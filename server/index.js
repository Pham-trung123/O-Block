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
    "Driver={ODBC Driver 17 for SQL Server};Server=THANHPT09\\SQLEXPRESS03;Database=phisingemail;Trusted_Connection=Yes;",
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
      return res.json({ success: false, message: "Email không tồn tại!" });

    const user = result.recordset[0];

    let hash = user.password;
    if (hash.startsWith("$2y$")) hash = "$2a$" + hash.substring(4);

    const valid = await bcrypt.compare(password, hash);
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
// AI Gemini
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
app.use("/api/gmail", gmailRouter);
app.use("/api/google", gmailRouter);

// ========================
// SERVER START
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
);
