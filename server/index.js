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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// =======================
// CORS + SESSION
// =======================
// ========================
// CORS
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
// SQL Server
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
    console.log("🔌 Kết nối SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("✅ Đã kết nối SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL:", err);
    pool = null;
    throw err;
  }
}

// ========================
// Nodemailer
// ========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ========================
// Đăng ký
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
    console.error("❌ Lỗi:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ========================
// Đăng nhập + VERIFY reCAPTCHA
// ========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // ============================
    // 1️⃣ KIỂM TRA reCAPTCHA TOKEN
    // ============================
    if (!captchaToken) {
      return res.json({
        success: false,
        message: "⚠️ Vui lòng xác minh reCAPTCHA!",
      });
    }

    // ===== VERIFY CAPTCHA CHUẨN GOOGLE =====
    try {
      const googleRes = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (!googleRes.data.success) {
        return res.json({
          success: false,
          message: "❌ Xác minh reCAPTCHA thất bại!",
        });
      }
    } catch (error) {
      console.error("❌ Lỗi verify captcha:", error);
      return res.json({
        success: false,
        message: "❌ Không thể xác minh reCAPTCHA!",
      });
    }

    // ============================
    // 2️⃣ LOGIC ĐĂNG NHẬP GỐC
    // ============================
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

    // ===== Gửi email cảnh báo đăng nhập =====
    const now = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

        const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background-color:#0f0f0f;color:#f1f1f1;padding:24px;border-radius:12px;max-width:580px;margin:auto;">
        <h2 style="color:#cdb4ff;text-align:center;margin-bottom:8px;">🔒 Đăng nhập mới từ tài khoản của bạn</h2>

        <p style="font-size:15px;line-height:1.6;">Xin chào <b>${user.username}</b>,</p>

        <p style="font-size:15px;line-height:1.6;">
          Tài khoản <b style="color:#ffd166;">${email}</b> vừa đăng nhập vào hệ thống 
          <b style="color:#90caf9;">Phish Hunter</b> lúc:
        </p>

        <p style="background:#222;padding:10px 14px;border-radius:8px;font-family:monospace;color:#fff;text-align:center;margin:12px 0;">
          ${now}
        </p>

        <p style="font-size:15px;line-height:1.6;">
          Nếu đây <b>không phải bạn</b>, vui lòng 
          <a href="http://localhost:5173/login" target="_blank" style="color:#ff6666;text-decoration:none;font-weight:bold;">
            đổi mật khẩu ngay
          </a>
          để đảm bảo an toàn.
        </p>

        <p style="margin-top:30px;font-size:12px;color:#999;text-align:center;">
          Email này được gửi tự động. Vui lòng không trả lời lại.<br/>
          &copy; 2025 Phish Hunter Security
        </p>
      </div>
    `;


    await sendMail(
      email,
      "🔐 Đăng nhập mới trên tài khoản Phish Hunter của bạn",
      html
    );
    if (!valid) return res.json({ success: false, message: "Sai mật khẩu!" });

    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ========================
// QUÊN MẬT KHẨU — OTP
// AI Gemini
// ========================
app.post("/api/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "⚠️ Thiếu email!" });

  try {
    const pool = await getPool();
    const user = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");

    if (user.recordset.length === 0)
      return res.json({ success: false, message: "❌ Email không tồn tại!" });
app.post("/api/analyze", async (req, res) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent)
      return res.json({ success: false, message: "Thiếu nội dung email!" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    req.session.otp = otp;
    req.session.email = email;

    console.log("📩 OTP gửi:", otp);

    await sendMail(
      email,
      "🔐 Mã OTP đặt lại mật khẩu (Phish Hunters)",
      `<p>Mã OTP của bạn là: <b>${otp}</b> (hiệu lực 10 phút)</p>`
    );
    const result = await geminiAnalyzer.analyzeEmail(emailContent);

    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Lỗi AI:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// XÁC MINH OTP
// ========================
app.post("/api/verify-otp", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code)
    return res.json({ success: false, message: "⚠️ Thiếu thông tin!" });

  if (!req.session.otp || !req.session.email)
    return res.json({
      success: false,
      message: "⚠️ OTP đã hết hạn, vui lòng gửi lại!",
    });

  if (req.session.email !== email || req.session.otp !== code)
    return res.json({ success: false, message: "❌ Mã OTP không chính xác!" });

  const token = crypto.randomBytes(16).toString("hex");
  req.session.resetToken = token;

  res.json({ success: true, message: "✅ OTP chính xác!", token });
});

// ========================
// ĐỔI MẬT KHẨU
// ========================
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.json({ success: false, message: "⚠️ Thiếu thông tin!" });

  if (!req.session.resetToken || req.session.resetToken !== token)
    return res.json({
      success: false,
      message: "❌ Token không hợp lệ hoặc đã hết hạn!",
    });

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

// ===========================================================
// ⭐ FIXED — API LƯU PHÂN TÍCH VÀO DATABASE
// ===========================================================
app.post("/api/save-analysis", async (req, res) => {
  try {
    const { user_id, email_content, raw_result } = req.body;

    // Ánh xạ đúng dữ liệu từ AI Gemini
    const risk_level = raw_result?.riskLevel || "UNKNOWN";
    const threat_score = raw_result?.confidence || 0;

    const sender_analysis = raw_result?.analysis?.senderAnalysis || "";
    const content_analysis = raw_result?.analysis?.contentAnalysis || "";
    const link_analysis = raw_result?.analysis?.linkAnalysis || "";

    const recommendation = Array.isArray(raw_result?.analysis?.recommendations)
      ? raw_result.analysis.recommendations.join("; ")
      : "";

    const pool = await getPool();

    await pool.request()
      .input("user_id", sql.Int, user_id)
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
          content_analysis, link_analysis,
          risk_level, threat_score, recommendation, analysis_date
        )
        VALUES (
          @user_id, @email_content, @sender_analysis,
          @content_analysis, @link_analysis,
          @risk_level, @threat_score, @recommendation, GETDATE()
        )
      `);

    res.json({ success: true, message: "Lưu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi lưu DB:", err);
    res.status(500).json({ success: false });
  }
});

// ========================
// Gmail OAuth
// ========================
app.post("/api/analyze", async (req, res) => {
  try {
    const { emailContent } = req.body;
    if (!emailContent)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu nội dung email!" });

    const result = await geminiAnalyzer.analyzeEmail(emailContent);

    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Lỗi AI Gemini:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý AI!",
    });
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
// SERVER START
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
);
