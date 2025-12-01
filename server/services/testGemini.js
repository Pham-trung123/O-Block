// server/services/testGemini.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load đúng file .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🔑 GEMINI KEY:", process.env.GEMINI_API_KEY ? "ĐÃ LOAD" : "KHÔNG LOAD");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    console.log("🔍 Gửi yêu cầu đến Gemini 2.0 Flash…");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const result = await model.generateContent("Hello từ test!");
    console.log("✅ Kết quả:", result.response.text());

  } catch (err) {
    console.error("❌ Lỗi Gemini:", err);
  }
}

run();
