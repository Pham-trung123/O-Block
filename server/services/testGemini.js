// server/services/testGemini.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Load đúng file .env (từ thư mục cha)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY không tìm thấy trong .env!");
  process.exit(1);
}

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("🚀 Gửi yêu cầu tới Gemini...");

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello from Phish Hunters!",
    });

    console.log("✅ Kết quả Gemini:");
    console.log(result.text);
  } catch (err) {
    console.error("❌ Lỗi khi gọi Gemini:", err.message);
  }
}

run();
