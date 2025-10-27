const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString:
    'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-LT2FQII\\SQLEXPRESS01;Database=phisingemail;Trusted_Connection=Yes;'
};

async function getPool() {
  if (global.__pool) return global.__pool;
  try {
    global.__pool = await sql.connect(config);
    console.log('✅ DB connected to phisingemail');
    return global.__pool;
  } catch (err) {
    console.error('❌ DB connect error:', err);
    throw err;
  }
}

module.exports = { getPool, sql };