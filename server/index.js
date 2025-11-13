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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// CORS + cookie session cho localhost
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
// SQL Server connection
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
    console.log("🔌 Kết nối SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("✅ Đã kết nối SQL Server!");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL:", err);
    pool = null;
    throw err;
  }
}

// ========================
// Nodemailer Gmail
// ========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify((err) => {
  if (err) console.warn("⚠️ Mailer chưa sẵn sàng:", err.message);
  else console.log("📮 Mailer sẵn sàng gửi email.");
});

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Phish Hunters Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📨 Đã gửi email đến ${to}`);
  } catch (err) {
    console.error("❌ Gửi email thất bại:", err);
  }
}

// ========================
// Đăng ký
// ========================
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "⚠️ Thiếu thông tin đăng ký!" });

    const pool = await getPool();
    const check = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");
    if (check.recordset.length > 0)
      return res.json({ success: false, message: "❌ Email đã tồn tại!" });

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

    await sendMail(
      email,
      "🎉 Đăng ký tài khoản Phish Hunters thành công!",
      `<h3>Chào mừng ${fullname}!</h3><p>Bạn đã đăng ký thành công tài khoản.</p>`
    );

    res.json({ success: true, message: "✅ Đăng ký thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ========================
// Đăng nhập
// ========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.json({ success: false, message: "❌ Email không tồn tại!" });

    const user = result.recordset[0];

    let hash = user.password || "";
    if (hash.startsWith("$2y$")) hash = "$2a$" + hash.substring(4);

    const valid = await bcrypt.compare(password, hash);
    if (!valid)
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });

    // ✅ Gửi email cảnh báo đăng nhập với giao diện giống hình
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

    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ========================
// Quên mật khẩu (OTP)
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

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    req.session.otp = otp;
    req.session.email = email;
    console.log("📩 OTP gửi:", otp);

    await sendMail(
      email,
      "🔐 Mã OTP đặt lại mật khẩu (Phish Hunters)",
      `<p>Mã OTP của bạn là: <b>${otp}</b> (hiệu lực 10 phút)</p>`
    );

    res.json({ success: true, message: "✅ OTP đã gửi qua email!" });
  } catch (err) {
    console.error("❌ Lỗi gửi OTP:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

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
    const pool = await getPool();
    await pool
      .request()
      .input("email", sql.VarChar, req.session.email)
      .input("password", sql.VarChar, hashed)
      .query("UPDATE users SET password = @password WHERE email = @email");

    delete req.session.otp;
    delete req.session.resetToken;

    res.json({ success: true, message: "✅ Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ========================
// Gemini AI
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
    res
      .status(500)
      .json({ success: false, message: "Lỗi xử lý AI!" });
  }
});

app.use("/api/gmail", gmailRouter);
app.use("/api/google", gmailRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
);
