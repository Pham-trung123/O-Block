// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // 🔒 để mã hóa mật khẩu
const { sql, getConnection } = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Cho phép truy cập file HTML/JS/CSS

// 🟢 Đăng ký
app.post("/api/register", async (req, res) => {
  const { email, password, fullname } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Thiếu thông tin!" });

  try {
    const pool = await getConnection();

    // Kiểm tra email trùng
    const check = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (check.recordset.length > 0)
      return res.status(400).json({ message: "Email đã được đăng ký!" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user
    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("fullname", sql.NVarChar, fullname || null)
      .query(
        "INSERT INTO Users (Email, PasswordHash, FullName) VALUES (@email, @password, @fullname)"
      );

    res.json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
});

// 🟡 Đăng nhập
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (result.recordset.length === 0)
      return res.status(401).json({ message: "Email không tồn tại!" });

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match)
      return res.status(401).json({ message: "Mật khẩu không đúng!" });

    // Cập nhật thời gian đăng nhập
    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("UPDATE Users SET LastLoginAt = GETDATE() WHERE Email = @email");

    res.json({
      message: "Đăng nhập thành công!",
      user: { fullname: user.FullName, role: user.Role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập!" });
  }
});

app.listen(3000, () =>
  console.log("🚀 Server đang chạy tại http://localhost:3000")
);
