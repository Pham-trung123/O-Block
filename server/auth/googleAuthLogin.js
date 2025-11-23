import express from "express";
import { google } from "googleapis";
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(process.cwd(), "server/.env") });

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// 🛢 SQL POOL
// =============================
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=E44T742\\QLEXPRESS05;Database=phisingemail;Trusted_Connection=Yes;",
};

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(dbConfig);
  return pool;
}

// =============================
// ⚙️ Google OAuth2 Social Login
// =============================
const googleClient = new google.auth.OAuth2(
  process.env.GOOGLE_LOGIN_CLIENT_ID,
  process.env.GOOGLE_LOGIN_CLIENT_SECRET,
  process.env.GOOGLE_LOGIN_REDIRECT_URI // Ví dụ: http://localhost:3000/auth/google/callback
);

const GOOGLE_SCOPE = [
  "profile",
  "email"
];

// =============================
// 🔗 Bước 1: Redirect người dùng đến Google Login
// =============================
router.get("/login", (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPE,
  });
  res.redirect(url);
});

// =============================
// 🔗 Bước 2: Google redirect về backend
// =============================
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Missing Google OAuth code!");

  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: "v2",
    auth: googleClient,
  });

  const userInfo = await oauth2.userinfo.get();
  const { email, name, picture } = userInfo.data;

  if (!email) return res.send("Không tìm thấy email!");

  // =============================
  // 🛢 LƯU HOẶC TẠO USER
  // =============================
  const pool = await getPool();

  const check = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM users WHERE email = @email");

  let user;
  if (check.recordset.length === 0) {
    // Tạo user mới
    await pool
      .request()
      .input("username", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, "") // Google login không dùng password
      .query(`
        INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
        VALUES (@username, @email, @password, 'user', 1, GETDATE(), GETDATE())
      `);

    user = { username: name, email };
  } else {
    user = check.recordset[0];
  }

  // Lưu vào session
  req.session.user = user;

  // Redirect về frontend
  res.redirect(`http://localhost:5173?google_login_success=1&username=${encodeURIComponent(name)}`);
});

export default router;
