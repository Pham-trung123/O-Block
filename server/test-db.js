// server/test-db.js
import sql from "mssql/msnodesqlv8.js";

const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=E44T742\\SQLEXPRESS05;Database=phisingemail;Trusted_Connection=Yes;",
  options: {
    connectionTimeout: 5000, // Giúp tránh treo
  },
};

// ==========================
// 🟢 THÊM PHẦN QUAN TRỌNG: getPool()
// ==========================

let pool;

export async function getPool() {
  try {
    if (pool) {
      // Nếu pool đã tồn tại → dùng lại
      return pool;
    }

    console.log("🔌 Đang tạo kết nối pool SQL...");
    pool = await sql.connect(dbConfig);

    console.log("✅ Pool SQL Server sẵn sàng!");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi tạo pool:", err);
    throw err;
  }
}

// ==========================
// 🟡 CODE CŨ CỦA BẠN – GIỮ NGUYÊN 100%
// ==========================

async function testConnection() {
  try {
    console.log("🔌 Kết nối thử SQL...");
    const poolTest = await sql.connect(dbConfig);
    const result = await poolTest.request().query("SELECT GETDATE() AS Now");
    console.log("✅ SQL OK:", result.recordset);
    await poolTest.close();
  } catch (err) {
    console.error("❌ Lỗi SQL:", err);
  }
}

testConnection();
