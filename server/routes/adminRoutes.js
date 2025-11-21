import express from "express";
import sql from "mssql/msnodesqlv8.js";
import { requireAdmin } from "../middleware/auth.js";
import { getPool } from "../test-db.js";


const router = express.Router();

// ======================
// 1) Dashboard Stats
// ======================
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const userCount = await pool.request().query(`
      SELECT COUNT(*) AS total_users FROM users
    `);

    const emailCount = await pool.request().query(`
      SELECT COUNT(*) AS total_emails FROM email_analysis
    `);

    const riskStats = await pool.request().query(`
      SELECT risk_level, COUNT(*) AS count
      FROM email_analysis
      GROUP BY risk_level
    `);

    const sysStats = await pool.request().query(`SELECT TOP 1 * FROM system_stats`);

    res.json({
      success: true,
      data: {
        users: userCount.recordset[0].total_users,
        emails: emailCount.recordset[0].total_emails,
        risk: riskStats.recordset,
        system: sysStats.recordset[0]
      }
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================
// 2) Danh sách User
// ======================
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const users = await pool.request().query(`
      SELECT id, username, email, full_name, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ success: true, users: users.recordset });
  } catch (err) {
    console.error("Error load users:", err);
    res.status(500).json({ success: false });
  }
});

// Đổi role
router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const pool = await getPool();

    await pool.request()
      .input("role", sql.VarChar, role)
      .input("id", sql.Int, id)
      .query(`UPDATE users SET role = @role WHERE id = @id`);

    res.json({ success: true, message: "Cập nhật role thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Khóa / Mở khóa user
router.patch("/users/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const q = await pool.request().input("id", sql.Int, id).query(`
      UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = @id
    `);

    res.json({ success: true, message: "Thay đổi trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ======================
// 3) Email đã phân tích
// ======================
router.get("/emails", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const emails = await pool.request().query(`
      SELECT ea.*, u.email AS user_email, u.username AS user_name
      FROM email_analysis ea
      LEFT JOIN users u ON ea.user_id = u.id
      ORDER BY analysis_date DESC
    `);

    res.json({ success: true, emails: emails.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ======================
// 4) Known Threats
// ======================
router.get("/threats", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const threats = await pool.request().query(`
      SELECT * FROM known_threats ORDER BY created_at DESC
    `);

    res.json({ success: true, threats: threats.recordset });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ======================
// 5) Training Data
// ======================
router.get("/training", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const train = await pool.request().query(`
      SELECT td.*, u.username
      FROM training_data td
      LEFT JOIN users u ON td.added_by = u.id
      ORDER BY added_date DESC
    `);

    res.json({ success: true, data: train.recordset });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Verify dữ liệu huấn luyện
router.patch("/training/:id/verify", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    await pool.request().input("id", sql.Int, id).query(`
      UPDATE training_data SET verified_by_admin = 1 WHERE id = @id
    `);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ======================
// 6) Xem logs
// ======================
router.get("/logs", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const logs = await pool.request().query(`
      SELECT l.*, u.username
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY log_date DESC
    `);

    res.json({ success: true, logs: logs.recordset });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
