import express from "express";
import axios from "axios";
import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "server/.env") });

const router = express.Router();

const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-8LLT5HQ\\MSSQLSERVER01;Database=phisingemail;Trusted_Connection=Yes;",
};

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(dbConfig);
  return pool;
}

// 1️⃣ Redirect LinkedIn
router.get("/login", (req, res) => {
  const url =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    "response_type=code&" +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&` +
    "scope=r_liteprofile%20r_emailaddress";

  res.redirect(url);
});

// 2️⃣ Callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Lấy access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token;

    // Lấy info user
    const profileRes = await axios.get(
      "https://api.linkedin.com/v2/me",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const emailRes = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const username = profileRes.data.localizedFirstName;
    const email = emailRes.data.elements[0]["handle~"].emailAddress;

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
          INSERT INTO users (username, email, password, role,is_active,created_at,updated_at)
          VALUES (@username, @email, '', 'user',1,GETDATE(),GETDATE())
      `);

      user = { username, email };
    } else user = check.recordset[0];

    req.session.user = user;

    res.redirect(
      `http://localhost:5173?login_linkedin=1&username=${encodeURIComponent(
        username
      )}`
    );
  } catch (err) {
    console.error(err);
    res.send("LinkedIn Login Error!");
  }
});

export default router;
