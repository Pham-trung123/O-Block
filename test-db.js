const { getConnection } = require("./db");

(async () => {
  const pool = await getConnection();
  if (pool) {
    console.log("✅ Đã kết nối thành công tới SQL Server!");
    const result = await pool.request().query("SELECT GETDATE() AS Now");
    console.log(result.recordset);
  } else {
    console.log("❌ Không thể kết nối SQL Server!");
  }
})();
