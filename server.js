const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('./db');

const app = express();

// ========== MIDDLEWARE ==========
// CORS chi tiết
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware logging để debug
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
    console.log('📦 Body:', req.body);
    next();
});

const SALT_ROUNDS = 10;

// ========== API ĐĂNG KÝ ==========
app.post('/api/register', async (req, res) => {
  const { email, password, fullname } = req.body;
  const username = fullname;

  console.log('📥 Received registration:', { email, password, fullname });

  if (!email || !password || !username) {
    return res.status(400).json({ 
      success: false,
      message: 'Thiếu thông tin đăng ký!' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
    });
  }

  try {
    const pool = await getPool();

    // Kiểm tra email trùng
    const check = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT id FROM users WHERE email = @email');

    if (check.recordset.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email đã tồn tại!' 
      });
    }

    // Mã hóa mật khẩu
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Thêm người dùng mới
    await pool.request()
      .input('username', sql.NVarChar(100), username)
      .input('email', sql.NVarChar(255), email)
      .input('password', sql.NVarChar(500), hashed)
      .input('full_name', sql.NVarChar(255), fullname)
      .input('role', sql.NVarChar(50), 'user')
      .query(`
        INSERT INTO users 
        (username, email, password, full_name, role, is_active, created_at, updated_at)
        VALUES (@username, @email, @password, @full_name, @role, 1, GETDATE(), GETDATE())
      `);

    console.log('✅ User registered successfully');
    
    res.json({ 
      success: true,
      message: 'Đăng ký thành công!' 
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng ký!' 
    });
  }
});

// ========== API ĐĂNG NHẬP ==========
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Login attempt:', { email });

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin!' 
    });
  }

  try {
    const pool = await getPool();

    // Tìm user theo email
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM users WHERE email = @email AND is_active = 1');

    if (result.recordset.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không tồn tại!' 
      });
    }

    const user = result.recordset[0];
    console.log('👤 User found:', user.email);

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Sai mật khẩu!' 
      });
    }

    console.log('✅ Login successful for:', user.email);

    // Trả về thông tin user (không bao gồm password)
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng nhập!' 
    });
  }
});

// ========== API LẤY THÔNG TIN USER ==========
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT id, username, email, full_name, role FROM users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User không tồn tại!' });
    }

    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// API test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`✅ Test API: http://localhost:${PORT}/api/test`);
});