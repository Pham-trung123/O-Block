import sql from "mssql/msnodesqlv8.js";
import { getPool } from "../index.js";

// Lưu lịch sử phân tích
export async function saveEmailHistory(userId, emailContent, analysisResult) {
  try {
    const pool = await getPool();

    const summary = analysisResult?.analysis?.summary || "";
    const risk = analysisResult?.riskLevel || "UNKNOWN";
    const score = analysisResult?.score || 0;

    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("email_content", sql.NVarChar(sql.MAX), emailContent)
      .input("ai_summary", sql.NVarChar(sql.MAX), summary)
      .input("risk_level", sql.NVarChar(50), risk)
      .input("score", sql.Int, score)
      .query(`
        INSERT INTO email_analysis_history (user_id, email_content, ai_summary, risk_level, score, created_at)
        VALUES (@user_id, @email_content, @ai_summary, @risk_level, @score, GETDATE())
      `);

    console.log("📌 Đã lưu lịch sử quét!");
  } catch (err) {
    console.error("❌ Lỗi saveEmailHistory:", err.message);
  }
}
