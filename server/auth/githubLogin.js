// server/auth/githubLogin.js
import express from "express";
import axios from "axios";
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ======================
// Load .env
// ======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env nằm ở thư mục server/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

// ======================
// SQL Server config
// ======================
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=phisingemail;Trusted_Connection=Yes;",
};

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(dbConfig);
  return pool;
}

// ======================
// 1️⃣ Redirect tới GitHub
// ======================
router.get("/login", (req, res) => {
  try {
    const redirectURI = encodeURIComponent(process.env.GITHUB_REDIRECT_URI);

    const url =
      "https://github.com/login/oauth/authorize?" +
      `client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${redirectURI}` + // ⚠ PHẢI encode
      "&scope=user:email";

    console.log("🌐 Redirect GitHub URL:", url);
    res.redirect(url);
  } catch (err) {
    console.error("❌ Lỗi khi redirect GitHub:", err);
    res.status(500).send("GitHub redirect error");
  }
});

// ======================
// 2️⃣ Callback từ GitHub
// ======================
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing GitHub code!");

  try {
    // 🔑 Đổi code lấy access_token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      { headers: { Accept: "application/json" } }
    );

    const access_token = tokenRes.data.access_token;
    if (!access_token) {
      console.error("❌ Không lấy được access_token từ GitHub:", tokenRes.data);
      return res.status(500).send("No access_token from GitHub");
    }

    // 👤 Lấy info user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // 📧 Lấy email (có thể private nên phải gọi endpoint emails)
    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const primaryEmailObj = emailRes.data.find((x) => x.primary) || emailRes.data[0];
    const email = primaryEmailObj?.email;

    const { name, login } = userRes.data;
    const username = name || login || "GitHub User";

    if (!email) {
      console.warn("⚠️ GitHub không trả email:", emailRes.data);
      return res.send("GitHub không trả email, hãy mở public email trong profile.");
    }

    // 💾 Lưu / tìm user trong SQL
    const pool = await getPool();
    const check = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email=@email");

    let user;
    if (check.recordset.length === 0) {
      await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("email", sql.VarChar, email)
        .query(`
          INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
          VALUES (@username, @email, '', 'user', 1, GETDATE(), GETDATE());
        `);

      user = { username, email };
      console.log("🆕 Tạo tài khoản GitHub mới:", username, email);
    } else {
      user = check.recordset[0];
      console.log("✅ Đăng nhập GitHub tài khoản có sẵn:", user.username);
    }

    // Lưu session
    req.session.user = {
      id: user.id,
      username: user.username || username,
      email: user.email || email,
      provider: "github",
    };

    // Redirect về frontend
    const redirectFrontend =
      `http://localhost:5173?login_github=1&username=${encodeURIComponent(
        user.username || username
      )}`;

    res.redirect(redirectFrontend);
  } catch (err) {
    console.error("❌ GitHub Login error:", err.response?.data || err.message);
    res.status(500).send("GitHub Login error!");
  }
});

export default router;
