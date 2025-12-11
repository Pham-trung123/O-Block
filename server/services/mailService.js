// server/services/mailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// =============================
// 🔧 Load biến môi trường đúng file /server/.env
// =============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(process.cwd(), "server/.env") });

// Debug ENV
console.log("📧 EMAIL_USER =", process.env.EMAIL_USER);
console.log("📧 EMAIL_PASS =", process.env.EMAIL_PASS ? "(OK)" : "❌ MISSING");

// =============================
// 📩 Cấu hình SMTP Gmail
// =============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================
// 🔗 Link dẫn đến trang đổi mật khẩu (front-end)
// =============================
// → Khi click, giao diện Login.jsx sẽ tự chuyển sang Step 3.
const RESET_PASSWORD_LINK = "http://localhost:5173/login?reset=1";

// ===========================================================================================
// 📤 1) EMAIL CHÀO MỪNG (ĐĂNG KÝ)
// ===========================================================================================
export const sendWelcomeRegisterEmail = async (toEmail, username) => {
  const mailOptions = {
    from: `"Phish Hunters Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🎉 Welcome to Phish Hunters — Your Email Security Starts Now",
    html: `
      <div style="font-family: Arial; padding: 20px">
        <h2>👋 Welcome to Phish Hunters!</h2>

        <p>Thank you for registering, <b>${username}</b>.</p>
        <p>Your account is now protected by our AI-driven phishing defense system.</p>
        <p>We’ll monitor suspicious emails and alert you in real time.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("✔ Welcome email sent to:", toEmail);
};

// ===========================================================================================
// 📤 2) EMAIL CẢNH BÁO + CHÀO MỪNG KHI ĐĂNG NHẬP
//     + THÊM LINK RESET PASSWORD NHƯ YÊU CẦU
// ===========================================================================================
export const sendLoginSecurityEmail = async (toEmail, username, ipAddress) => {

  const mailOptions = {
    from: `"Phish Hunters Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Login Notification — Welcome Back to Phish Hunters",
    html: `
      <div style="font-family: Arial; padding: 20px">

        <h2>👋 Welcome back, ${username}!</h2>
        <p>You have successfully logged into your Phish Hunters account.</p>

        <hr style="margin: 20px 0;">

        <h3>⚠️ Security Alert</h3>
        <p><b>IP Address:</b> ${ipAddress || "Unknown"}</p>
        <p><b>Time:</b> ${new Date().toLocaleString()}</p>

        <p>
          If this wasn't you, please 
          <a href="${RESET_PASSWORD_LINK}" style="color:#1a73e8; font-weight:bold; text-decoration:none;">
            click here to reset your password
          </a>.
        </p>

        <br/>
        <p>Stay protected,</p>
        <b>Phish Hunters Security Team</b>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("✔ Login security email sent to:", toEmail);
};

export default {
  sendWelcomeRegisterEmail,
  sendLoginSecurityEmail,
};
