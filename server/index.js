import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sql from "mssql/msnodesqlv8.js";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import gmailRouter from "./gmailAuth.js";
import { geminiAnalyzer } from "./services/geminiService.js";
import crypto from "crypto";
import googleLoginRouter from "./auth/googleAuthLogin.js";
import facebookLoginRouter from "./auth/facebookLogin.js";
import githubLoginRouter from "./auth/githubLogin.js";
import linkedinLoginRouter from "./auth/linkedinLogin.js";
import axios from "axios";
import { sendWelcomeRegisterEmail, sendLoginSecurityEmail } from "./services/mailService.js";


// ========================
// ENV + PATH
// ========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.join(process.cwd(), "server/.env"),
});

console.log(">>> EMAIL_USER =", process.env.EMAIL_USER);
console.log(">>> EMAIL_PASS =", process.env.EMAIL_PASS);

const app = express();

// ========================
// CORS + COOKIES + SESSION
// ========================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "phishhunters_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        // vì đang dùng HTTP
      httpOnly: true,
      sameSite: "lax",      // ⭐ BẮT BUỘC: KHÔNG ĐƯỢC DÙNG "none"
      maxAge: 10 * 60 * 1000,
    },
  })
);

// ========================
// SQL SERVER
// ========================
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=THANHPT09\\SQLEXPRESS03;Database=phisingemail;Trusted_Connection=Yes;",
  options: { connectionTimeout: 5000 },
};

let pool;
async function getPool() {
  if (pool) return pool;

  try {
    console.log("🔌 Đang kết nối SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server đã kết nối!");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL:", err);
    pool = null;
    throw err;
  }
}

// ========================
// NODEMAILER SETUP
// ========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ========================
// SEND MAIL FUNCTION
// ========================
async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Phish Hunters" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📨 Email đã được gửi:", to);
  } catch (err) {
    console.error("❌ Lỗi sendMail():", err);
  }
}
// =========================
// 📊 API DASHBOARD
// =========================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const pool = await getPool();

    // 1. Tổng số email đã phân tích
    const totalResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM email_analysis
    `);

    // 2. Phân bố risk_level
    const riskResult = await pool.request().query(`
      SELECT risk_level, COUNT(*) AS total
      FROM email_analysis
      GROUP BY risk_level
    `);

    // 3. Xu hướng theo ngày
    const trendResult = await pool.request().query(`
      SELECT 
        CONVERT(date, analysis_date) AS [date],
        COUNT(*) AS total
      FROM email_analysis
      GROUP BY CONVERT(date, analysis_date)
      ORDER BY [date] ASC
    `);

    res.json({
      success: true,
      data: {
        total: totalResult.recordset[0]?.total || 0,
        risk: riskResult.recordset,
        trend: trendResult.recordset,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi /api/dashboard/stats:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ========================
// REGISTER
// ========================
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password)
      return res.json({ success: false, message: "Thiếu dữ liệu!" });

    const pool = await getPool();
    const check = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (check.recordset.length > 0)
      return res.json({ success: false, message: "Email đã tồn tại!" });

    const hashed = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("username", sql.VarChar, fullname)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashed)
      .query(`
        INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
        VALUES (@username, @email, @password, 'user', 1, GETDATE(), GETDATE())
      `);

    // ⭐ GỬI EMAIL CHÀO MỪNG
    await sendWelcomeRegisterEmail(email, fullname);

    res.json({ success: true, message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("❌ Lỗi /register:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// LOGIN + VERIFY reCAPTCHA
// ========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    console.log("🔑 SECRET KEY:", process.env.RECAPTCHA_SECRET_KEY);
    console.log("📌 Token FE gửi:", captchaToken);

    if (!captchaToken)
      return res.json({
        success: false,
        message: "⚠️ Vui lòng xác minh reCAPTCHA!",
      });

    const verifyRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captchaToken,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("📌 Google verify response:", verifyRes.data);

    if (!verifyRes.data.success)
      return res.json({
        success: false,
        message: "❌ Xác minh reCAPTCHA thất bại!",
        googleError: verifyRes.data["error-codes"],
      });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.json({ success: false, message: "Email không tồn tại!" });

    const user = result.recordset[0];

    let hash = user.password;
    if (hash.startsWith("$2y$")) hash = "$2a$" + hash.substring(4);

    const valid = await bcrypt.compare(password, hash);
    if (!valid)
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });

    // =======================
    // GIỮ NGUYÊN — CHỈ THÊM ROLE
    // =======================
    req.session.user = { id: user.id, role: user.role, email: user.email };

    // ⭐⭐⭐⭐⭐ THÊM Ở ĐÂY — KHÔNG ĐỤNG CODE CŨ ⭐⭐⭐⭐⭐
    try {
      await sendLoginSecurityEmail(
        user.email,
        user.username,
        req.ip || req.connection.remoteAddress
      );
      console.log("📨 Email đăng nhập đã gửi!");
    } catch (mailErr) {
      console.error("⚠️ Lỗi gửi email đăng nhập:", mailErr);
    }
    // ⭐⭐⭐⭐⭐ HẾT PHẦN THÊM ⭐⭐⭐⭐⭐

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("❌ Lỗi /login:", error);
    res.status(500).json({ success: false });
  }
});


// ========================
// REQUEST OTP
// ========================
app.post("/api/request-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: "Thiếu email!" });

    const pool = await getPool();
    const userCheck = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (userCheck.recordset.length === 0) {
      return res.json({
        success: false,
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    // Tạo OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("🔐 OTP sinh ra:", otp);

    // LƯU VÀO SESSION
    req.session.resetOtp = otp;
    req.session.resetEmail = email;
    req.session.save();

    console.log("📌 Session lưu OTP:", req.session.resetOtp);
    console.log("📌 Session lưu Email:", req.session.resetEmail);

    // Gửi email OTP
    await sendMail(
      email,
      "Mã OTP đặt lại mật khẩu - Phish Hunters",
      `<h2>🔐 Mã OTP của bạn: <b>${otp}</b></h2>`
    );

    res.json({ success: true, message: "Đã gửi OTP!" });
  } catch (err) {
    console.log("❌ Lỗi request-otp:", err);
    res.json({ success: false, message: "Lỗi server!" });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, code } = req.body;

  console.log("📩 Email client gửi:", email);
  console.log("📤 OTP client gửi:", code);

  console.log("📌 SESSION EMAIL:", req.session.resetEmail);
  console.log("📌 SESSION OTP:", req.session.resetOtp);

  if (
    req.session.resetEmail === email &&
    req.session.resetOtp === code
  ) {
    const token = crypto.randomBytes(20).toString("hex");
    req.session.resetToken = token;

    return res.json({ success: true, token });
  }

  return res.json({ success: false, message: "OTP không chính xác!" });
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.json({ success: false, message: "Thiếu dữ liệu!" });

    if (token !== req.session.resetToken)
      return res.json({ success: false, message: "Token không hợp lệ!" });

    const email = req.session.resetEmail;

    const hashed = await bcrypt.hash(newPassword, 10);

    const pool = await getPool();
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashed)
      .query("UPDATE users SET password = @password WHERE email = @email");

    res.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.json({ success: false, message: "Lỗi server!" });
  }
});

// ========================
// AI ANALYZE EMAIL
// ========================
app.post("/api/analyze", async (req, res) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent)
      return res.json({ success: false, message: "Thiếu nội dung email!" });

    const result = await geminiAnalyzer.analyzeEmail(emailContent);

    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Lỗi AI:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// SAVE AI RESULT
// ========================
app.post("/api/save-analysis", async (req, res) => {
  try {
    const { user_id, email_content, raw_result } = req.body;

    const risk_level = raw_result?.riskLevel || "UNKNOWN";
    const threat_score = raw_result?.confidence || 0;

    const sender_analysis =
      raw_result?.analysis?.senderAnalysis || "";
    const content_analysis =
      raw_result?.analysis?.contentAnalysis || "";
    const link_analysis =
      raw_result?.analysis?.linkAnalysis || "";
    const recommendation = Array.isArray(
      raw_result?.analysis?.recommendations
    )
      ? raw_result.analysis.recommendations.join("; ")
      : "";

    const pool = await getPool();

    await pool.request().input("user_id", sql.Int, user_id)
      .input("email_content", sql.NVarChar(sql.MAX), email_content)
      .input("sender_analysis", sql.NVarChar(sql.MAX), sender_analysis)
      .input("content_analysis", sql.NVarChar(sql.MAX), content_analysis)
      .input("link_analysis", sql.NVarChar(sql.MAX), link_analysis)
      .input("risk_level", sql.NVarChar(50), risk_level)
      .input("threat_score", sql.Int, threat_score)
      .input("recommendation", sql.NVarChar(sql.MAX), recommendation)
      .query(`
        INSERT INTO email_analysis (
          user_id, email_content, sender_analysis,
          content_analysis, link_analysis, risk_level,
          threat_score, recommendation, analysis_date
        )
        VALUES (
          @user_id, @email_content, @sender_analysis,
          @content_analysis, @link_analysis, @risk_level,
          @threat_score, @recommendation, GETDATE()
        )
      `);

    res.json({ success: true, message: "Lưu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi lưu DB:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// OAuth Routers
// ========================
app.use("/api/gmail", gmailRouter);
app.use("/auth/google", googleLoginRouter);
app.use("/auth/linkedin", linkedinLoginRouter);
app.use("/auth/github", githubLoginRouter);
app.use("/auth/facebook", facebookLoginRouter);

// ========================
// Admin Route
// ========================
import adminRouter from "./routes/adminRoutes.js";

app.use("/api/admin", adminRouter);

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
);

// ⭐⭐⭐⭐⭐ THÊM DÒNG NÀY — KHÔNG SỬA CODE CŨ ⭐⭐⭐⭐⭐
export { getPool };