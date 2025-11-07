import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sql from "mssql/msnodesqlv8.js";
import nodemailer from "nodemailer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// 🧩 Đảm bảo dotenv đọc đúng file .env trong thư mục server/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// ⚠️ Kiểm tra biến môi trường
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("⚠️ Thiếu EMAIL_USER hoặc EMAIL_PASS trong file .env!");
}

const app = express();

// ⚙️ Cấu hình CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// ⚙️ Cấu hình kết nối SQL Server
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=THANHPT09\\SQLEXPRESS03;Database=phisingemail;Trusted_Connection=Yes;",
  options: { connectionTimeout: 5000 },
};

// 🧠 Biến toàn cục lưu pool kết nối
let pool;
async function getPool() {
  if (pool) return pool;
  try {
    console.log("🔌 Đang kết nối tới SQL Server...");
    pool = await sql.connect(dbConfig);
    console.log("✅ Đã kết nối SQL Server!");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL:", err);
    pool = null;
    throw err;
  }
}

// ✉️ Cấu hình Gmail trung tâm
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📤 Hàm gửi email tiện lợi
async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Phising Hunter Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📨 Email đã gửi đến ${to}`);
  } catch (err) {
    console.error("❌ Gửi email thất bại:", err);
  }
}

// ========================
// 🧩 API Đăng ký tài khoản
// ========================
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "⚠️ Thiếu thông tin đăng ký!" });
    }

    const pool = await getPool();
    const checkUser = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (checkUser.recordset.length > 0) {
      return res.json({ success: false, message: "❌ Email đã tồn tại!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("username", sql.VarChar, fullname)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
        VALUES (@username, @email, @password, 'user', 1, GETDATE(), GETDATE())
      `);

    // ✉️ Gửi thông báo chào mừng
    const registerMail = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;border-radius:10px;">
        <h2 style="color:#4F46E5;">🎉 Xin chào ${fullname},</h2>
        <p>Bạn đã đăng ký thành công tài khoản <b>Phising Hunter</b>.</p>
        <p>👉 <a href="http://localhost:5173/login" style="color:#4F46E5;font-weight:bold;">Đăng nhập ngay</a> để bắt đầu trải nghiệm.</p>
        <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />
        <small style="color:#777;">Email này được gửi tự động bởi hệ thống Phising Hunter.</small>
      </div>
    `;
    await sendMail(email, "🎉 Đăng ký tài khoản Phising Hunter thành công!", registerMail);

    res.json({
      success: true,
      message: "✅ Đăng ký thành công! Vui lòng kiểm tra email.",
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ====================
// 🔐 API Đăng nhập
// ====================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin đăng nhập!" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.json({ success: false, message: "❌ Email không tồn tại!" });
    }

    const user = result.recordset[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });
    }

    // ✉️ Gửi email cảnh báo đăng nhập
    const loginMail = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;border-radius:10px;">
        <h2 style="color:#4F46E5;">🔔 Đăng nhập mới từ tài khoản của bạn</h2>
        <p>Xin chào ${user.username},</p>
        <p>Tài khoản <b>${user.email}</b> vừa đăng nhập vào hệ thống <b>Phising Hunter</b> lúc:</p>
        <p><b>${new Date().toLocaleString()}</b></p>
        <p>Nếu không phải bạn, vui lòng đổi mật khẩu ngay.</p>
      </div>
    `;
    await sendMail(email, "🔐 Cảnh báo đăng nhập mới - Phising Hunter", loginMail);

    res.json({
      success: true,
      message: "✅ Đăng nhập thành công!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ==============================
// 📩 API Gửi & xác minh OTP đổi mật khẩu
// ==============================
const otpStore = new Map();

// 📤 Gửi OTP qua email
app.post("/api/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Thiếu email!" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT username FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.json({ success: false, message: "Email không tồn tại!" });

    const otp = crypto.randomInt(1000, 9999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;border-radius:10px;">
        <h2 style="color:#4F46E5;">🔐 Mã xác thực OTP</h2>
        <p>Xin chào <b>${result.recordset[0].username}</b>,</p>
        <p>Mã xác thực để thay đổi mật khẩu của bạn là:</p>
        <h1 style="color:#2563EB;letter-spacing:5px;">${otp}</h1>
        <p>Mã có hiệu lực trong 5 phút.</p>
      </div>
    `;
    await sendMail(email, "🔐 Mã xác thực OTP - Phising Hunter", html);
    res.json({ success: true, message: "✅ Mã OTP đã gửi tới email." });
  } catch (err) {
    console.error("❌ Lỗi gửi OTP:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi gửi OTP!" });
  }
});

// ✅ Xác minh OTP
app.post("/api/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email);
  if (!record) return res.json({ success: false, message: "Chưa gửi mã OTP!" });
  if (Date.now() > record.expiresAt) return res.json({ success: false, message: "Mã OTP đã hết hạn!" });
  if (record.otp !== code) return res.json({ success: false, message: "Mã OTP không đúng!" });

  const token = crypto.randomBytes(16).toString("hex");
  otpStore.set(email, { ...record, token });
  res.json({ success: true, message: "✅ Xác minh thành công!", token });
});

// ✅ Đặt lại mật khẩu
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const entry = [...otpStore.entries()].find(([_, val]) => val.token === token);

    if (!entry) return res.json({ success: false, message: "Token không hợp lệ!" });
    const [email] = entry;

    const hashed = await bcrypt.hash(newPassword, 10);
    const pool = await getPool();
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashed)
      .query("UPDATE users SET password=@password, updated_at=GETDATE() WHERE email=@email");

    otpStore.delete(email);
    res.json({ success: true, message: "✅ Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// 🧪 API test
app.get("/api", (req, res) => {
  res.json({
    status: "✅ Server đang hoạt động tốt!",
    time: new Date().toLocaleString(),
  });
});

// 🚀 Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
);
