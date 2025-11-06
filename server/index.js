import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sql from "mssql/msnodesqlv8.js";

dotenv.config();
const app = express();

// ⚠️ CORS phải đặt ngay sau khi khởi tạo app
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // 👈 cho phép cả 2
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));


app.use(express.json());


// ⚙️ Cấu hình kết nối SQL Server
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=CUONG\\CUONGDUA;Database=phisingemail;Trusted_Connection=Yes;",
  options: {
    connectionTimeout: 5000, // Giúp tránh treo
  },
};



// 🧩 Tạo pool kết nối
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
    throw err; // 👈 Quan trọng! Ném lỗi ra ngoài để không bị treo
  }
}


// 🧠 API Đăng ký tài khoản
app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: "⚠️ Thiếu thông tin đăng ký!" });
    }

    const pool = await getPool();
    const checkUser = await pool.request().input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (checkUser.recordset.length > 0) {
      return res.json({ success: false, message: "❌ Email đã tồn tại!" });
    }

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

// 🔐 API Đăng nhập (thêm log để debug)
app.post("/api/login", async (req, res) => {
  try {
    console.log("📥 Nhận yêu cầu đăng nhập:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("⚠️ Thiếu thông tin");
      return res.status(400).json({ success: false, message: "Thiếu thông tin" });
    }

    const pool = await getPool();
    console.log("✅ Đã có pool SQL, bắt đầu truy vấn...");

    const result = await pool.request().input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    console.log("📦 Kết quả truy vấn:", result.recordset);

    if (result.recordset.length === 0) {
      console.log("❌ Không tìm thấy email trong DB");
      return res.json({ success: false, message: "❌ Email không tồn tại!" });
    }

    const user = result.recordset[0];
    console.log("🔑 Đang kiểm tra mật khẩu cho:", user.email);

    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      console.log("❌ Sai mật khẩu cho:", user.email);
      return res.json({ success: false, message: "❌ Mật khẩu sai!" });
    }

    console.log("✅ Đăng nhập thành công cho:", user.email);

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


// 🧩 API test
app.get("/api", (req, res) => {
  res.json({
    status: "✅ Server đang hoạt động!",
    time: new Date().toLocaleString(),
  });
});


// 🚀 Khởi động server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));