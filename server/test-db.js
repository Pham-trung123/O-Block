import sql from "mssql/msnodesqlv8.js";

const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=E44T742\\SQLEXPRESS05;Database=phisingemail;Trusted_Connection=Yes;",
  options: {
    connectionTimeout: 5000,
  },
};

// ❗ KHÔNG EXPORT getPool TỪ FILE NÀY
// ❗ KHÔNG TẠO POOL THỨ 2

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
