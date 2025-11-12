// server/test-db.js
import sql from "mssql/msnodesqlv8.js";

const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=E44T742\\SQLEXPRESS05;Database=phisingemail;Trusted_Connection=Yes;",
  options: {
    connectionTimeout: 5000, // Giúp tránh treo
  },
};


async function testConnection() {
  try {
    console.log("🔌 Kết nối thử SQL...");
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT GETDATE() AS Now");
    console.log("✅ SQL OK:", result.recordset);
    await pool.close();
  } catch (err) {
    console.error("❌ Lỗi SQL:", err);
  }
}

testConnection();
