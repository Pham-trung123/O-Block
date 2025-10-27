const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString:
    'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-LT2FQII\\SQLEXPRESS01;Database=phisingemail;Trusted_Connection=Yes;'
};

async function testFinal() {
  try {
    console.log('🧪 Testing final connection...');
    console.log('📡 Server: DESKTOP-LT2FQII\\SQLEXPRESS01');
    console.log('📁 Database: phisingemail');
    
    await sql.connect(config);
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    // Test query
    const result = await sql.query('SELECT @@SERVERNAME as server_name, DB_NAME() as db_name');
    console.log('📊 Connected to server:', result.recordset[0].server_name);
    console.log('📊 Current database:', result.recordset[0].db_name);
    
    // Check if users table exists and has data
    try {
      const users = await sql.query('SELECT COUNT(*) as user_count FROM users');
      console.log('👥 Total users in database:', users.recordset[0].user_count);
    } catch (tableErr) {
      console.log('ℹ️ Users table might be empty or not exist yet');
    }
    
    await sql.close();
    console.log('🎉 FINAL TEST COMPLETED SUCCESSFULLY!');
    return true;
    
  } catch (err) {
    console.error('❌ Final test failed:');
    console.error('Error:', err.message);
    return false;
  }
}

testFinal().then(success => {
  if (success) {
    console.log('\n✨ Everything is working! You can now run: node server.js');
  } else {
    console.log('\n💥 There is still a connection issue.');
  }
});