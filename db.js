// db.js
const sql = require("mssql/msnodesqlv8");

const config = {
  server: "(localdb)\\MSSQLLocalDB",   // LocalDB instance
  database: "DoAn",                    // Tên database
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    enableArithAbort: true,
  },
};

async function getConnection() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Kết nối SQL Server thành công!");
    return pool;
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL Server:", err.message);
    return null;
  }
}

module.exports = { sql, getConnection };
