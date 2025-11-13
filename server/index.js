// ========================
// 📦 IMPORTS & CẤU HÌNH CƠ BẢN
// ========================
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sql from "mssql/msnodesqlv8.js";

dotenv.config();
const app = express();

// ⚙️ CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ========================
// 💾 KẾT NỐI SQL SERVER
// ========================
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=E44T742\\SQLEXPRESS05;Database=phisingemail;Trusted_Connection=Yes;",
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
    throw err;
  }
}

// ========================
// 👤 API ĐĂNG KÝ TÀI KHOẢN
// ========================
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password)
      return res.status(400).json({ success: false, message: "⚠️ Thiếu thông tin đăng ký!" });

    const pool = await getPool();
    const checkUser = await pool.request().input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (checkUser.recordset.length > 0)
      return res.json({ success: false, message: "❌ Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.VarChar, fullname)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input("full_name", sql.VarChar, fullname)
      .query(`
        INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
        VALUES (@username, @email, @password, @full_name, 'user', 1, GETDATE(), GETDATE())
      `);

    res.json({ success: true, message: "✅ Đăng ký thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ========================
// 🔐 API ĐĂNG NHẬP
// ========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "⚠️ Thiếu thông tin!" });

    const pool = await getPool();
    const result = await pool.request().input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.json({ success: false, message: "❌ Email không tồn tại!" });

    const user = result.recordset[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });

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

// ========================
// 📊 API: Thống kê EMAIL TRONG NGÀY (cho từng user)
// ========================
app.get("/api/stats/daily/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await getPool();
    const query = `
      SELECT risk_level, COUNT(*) AS count
      FROM email_analysis
      WHERE user_id = @userId
        AND CAST(analysis_date AS DATE) = CAST(GETDATE() AS DATE)
      GROUP BY risk_level;
    `;
    const result = await pool.request().input("userId", sql.Int, userId).query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu daily:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 📈 API: Thống kê EMAIL THEO TUẦN (2 tháng gần nhất)
// ========================
app.get("/api/stats/weekly/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await getPool();
    const query = `
      SELECT 
        DATEPART(WEEK, analysis_date) AS week,
        COUNT(*) AS phishing_count
      FROM email_analysis
      WHERE user_id = @userId
        AND analysis_date >= DATEADD(MONTH, -2, GETDATE())
        AND risk_level = 'high'
      GROUP BY DATEPART(WEEK, analysis_date)
      ORDER BY week ASC;
    `;
    const result = await pool.request().input("userId", sql.Int, userId).query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu weekly:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// 🧩 API TEST
// ========================
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API hoạt động tốt!", time: new Date().toISOString() });
});

// ========================
// 🚀 KHỞI ĐỘNG SERVER
// ========================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
