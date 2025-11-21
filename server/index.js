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

// ========================
// ENV + PATH
// ========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "phishhunters_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    },
  })
);

// ========================
// SQL SERVER
// ========================
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-8LLT5HQ\\MSSQLSERVER01;Database=phisingemail;Trusted_Connection=Yes;",
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

    // verify captcha
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

    if (!verifyRes.data.success)
      return res.json({
        success: false,
        message: "❌ Xác minh reCAPTCHA thất bại!",
      });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.json({ success: false, message: "Email không tồn tại!" });

    const user = result.recordset[0];

    // Fix bcrypt $2y$ error
    let hash = user.password;
    if (hash.startsWith("$2y$")) hash = "$2a$" + hash.substring(4);

    const valid = await bcrypt.compare(password, hash);
    if (!valid)
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });

    // Login Alert Email
    const now = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🔐 Đăng nhập mới vào Phish Hunters</h2>
        <p>Email: <b>${email}</b></p>
        <p>Thời gian: ${now}</p>
      </div>
    `;

    await sendMail(email, "🔐 Đăng nhập mới", html);

    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
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

    const pool = await getPool();
    const user = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");

    if (user.recordset.length === 0)
      return res.json({ success: false, message: "Email không tồn tại!" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    req.session.otp = otp;
    req.session.email = email;

    await sendMail(
      email,
      "🔐 Mã OTP Phish Hunters",
      `<p>Mã OTP của bạn: <b>${otp}</b> (hiệu lực 10 phút)</p>`
    );

    res.json({ success: true, message: "OTP đã gửi!" });
  } catch (err) {
    console.error("❌ Lỗi OTP:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// VERIFY OTP
// ========================
app.post("/api/verify-otp", (req, res) => {
  const { email, code } = req.body;

  if (!req.session.otp || req.session.email !== email)
    return res.json({
      success: false,
      message: "OTP đã hết hạn hoặc không hợp lệ!",
    });

  if (req.session.otp !== code)
    return res.json({ success: false, message: "Mã OTP không chính xác!" });

  const token = crypto.randomBytes(16).toString("hex");
  req.session.resetToken = token;

  res.json({ success: true, token });
});

// ========================
// RESET PASSWORD
// ========================
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!req.session.resetToken || req.session.resetToken !== token)
    return res.json({
      success: false,
      message: "Token không hợp lệ!",
    });

  const hashed = await bcrypt.hash(newPassword, 10);

  const pool = await getPool();
  await pool
    .request()
    .input("email", sql.VarChar, req.session.email)
    .input("password", sql.VarChar, hashed)
    .query("UPDATE users SET password = @password WHERE email = @email");

  res.json({ success: true, message: "Đổi mật khẩu thành công!" });
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
// START SERVER
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
);
