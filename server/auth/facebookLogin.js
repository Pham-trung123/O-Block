import express from "express";
import axios from "axios";
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "server/.env") });

const router = express.Router();

// SQL Pool
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=phisingemail;Trusted_Connection=Yes;",
};
let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(dbConfig);
  return pool;
}

// ===============================
// 1️⃣ Redirect to Facebook Login
// ===============================
router.get("/login", (req, res) => {
  const fbURL =
    "https://www.facebook.com/v18.0/dialog/oauth?" +
    `client_id=${process.env.FB_CLIENT_ID}` +
    `&redirect_uri=${process.env.FB_REDIRECT_URI}` +
    "&scope=email,public_profile";

  res.redirect(fbURL);
});

// ===============================
// 2️⃣ Facebook Callback
// ===============================
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send("Thiếu mã code!");

  try {
    //  Lấy access_token từ Facebook
    const tokenURL =
      "https://graph.facebook.com/v18.0/oauth/access_token?" +
      `client_id=${process.env.FB_CLIENT_ID}` +
      `&client_secret=${process.env.FB_CLIENT_SECRET}` +
      `&redirect_uri=${process.env.FB_REDIRECT_URI}` +
      `&code=${code}`;

    const tokenRes = await axios.get(tokenURL);
    const access_token = tokenRes.data.access_token;

    // Lấy thông tin user
    const userRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
    );

    const { name, email } = userRes.data;

    if (!email) return res.send("Facebook không trả email!");

    const pool = await getPool();
    const check = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    let user;
    if (check.recordset.length === 0) {
      await pool
        .request()
        .input("username", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, "")
        .query(`
          INSERT INTO users (username, email, password, role, is_active, created_at, updated_at)
          VALUES (@username, @email, '', 'user', 1, GETDATE(), GETDATE())
        `);
      user = { username: name, email };
    } else {
      user = check.recordset[0];
    }

    req.session.user = user;

    res.redirect(
      `http://localhost:5173?login_facebook=1&username=${encodeURIComponent(
        name
      )}`
    );
  } catch (err) {
    console.error(err);
    res.send("Facebook Login Error!");
  }
});

export default router;
