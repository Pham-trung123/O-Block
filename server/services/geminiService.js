// server/services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ========================
// ⚙️ Load biến môi trường
// ========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) console.warn("⚠️ Thiếu GEMINI_API_KEY trong file .env!");

// ========================
// 🧠 Khởi tạo Gemini Client
// ========================
let ai = null;
try {
  ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
  console.log("✅ GoogleGenAI khởi tạo thành công.");
} catch (err) {
  console.error("❌ Lỗi khởi tạo GoogleGenAI:", err.message);
  ai = null;
}

export class GeminiEmailAnalyzer {
  constructor() {
    this.modelName = "gemini-2.0-flash"; // ✅ model ổn định
    this.fallbackModel = "gemini-2.0-pro"; // fallback nếu flash lỗi
    this.ai = ai;
  }

  // 🧾 Prompt sinh phân tích
  createAnalysisPrompt(emailContent) {
    return `
PHÂN TÍCH EMAIL LỪA ĐẢO - CHỈ TRẢ VỀ JSON

EMAIL CẦN PHÂN TÍCH:
${emailContent}

PHÂN TÍCH VÀ TRẢ VỀ JSON:
{
  "isPhishing": true/false,
  "confidence": 0–100,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "analysis": {
    "senderAnalysis": "đánh giá người gửi",
    "contentAnalysis": "đánh giá nội dung",
    "domainTrust": "TRUSTED" | "SUSPICIOUS" | "UNTRUSTED",
    "threats": ["mối đe dọa 1", "mối đe dọa 2"],
    "recommendations": ["khuyến nghị 1", "khuyến nghị 2"]
  },
  "explanation": "giải thích ngắn gọn"
}

CHỈ TRẢ JSON, KHÔNG VIẾT THÊM.
`;
  }

  // ========================
  // ⚙️ Phân tích email
  // ========================
  async analyzeEmail(emailContent) {
    try {
      if (!emailContent?.trim()) throw new Error("Nội dung email trống.");

      const trustedDomains = this.getTrustedDomains();
      const emails = this.extractEmails(emailContent);
      const hasTrustedDomain = emails.some((e) =>
        trustedDomains.includes(e.split("@")[1]?.toLowerCase())
      );

      if (hasTrustedDomain && !this.hasPhishingSignals(emailContent)) {
        return {
          isPhishing: false,
          confidence: 90,
          riskLevel: "LOW",
          analysis: {
            senderAnalysis: "Người gửi thuộc tổ chức uy tín.",
            contentAnalysis: "Email hợp lệ và an toàn.",
            domainTrust: "TRUSTED",
            threats: ["Không phát hiện mối đe dọa."],
            recommendations: ["Nguồn đáng tin cậy, vẫn nên cảnh giác."],
          },
          explanation: "Email gửi từ domain uy tín.",
        };
      }

      if (!this.ai) {
        console.warn("⚠️ Không có model AI, dùng fallback.");
        return this.fallbackAnalysis(emailContent);
      }

      const prompt = this.createAnalysisPrompt(emailContent);
      return await this.retryGeminiRequest(prompt);
    } catch (err) {
      console.error("❌ Lỗi chính:", err.message);
      return this.fallbackAnalysis(emailContent);
    }
  }

  // ========================
  // 🔁 Retry Gemini với SDK @google/genai
  // ========================
  async retryGeminiRequest(prompt, retries = 3, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      for (const modelName of [this.modelName, this.fallbackModel]) {
        try {
          console.log(`🔍 [Thử lần ${attempt}] gọi model ${modelName}...`);
          const result = await this.ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          // ✅ SDK @google/genai dùng outputText
          const text = result.outputText;
          if (!text || !text.trim()) {
            console.warn("⚠️ Phản hồi Gemini rỗng — fallback kích hoạt.");
            continue;
          }

          console.log("✅ Nhận phản hồi Gemini hợp lệ.");
          return this.safeJsonParse(text);
        } catch (err) {
          console.warn(`⚠️ Lỗi model ${modelName}: ${err.message}`);
          if (err.message.includes("429")) {
            console.warn(`⏳ Đợi ${delay / 1000}s rồi thử lại...`);
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
          }
        }
      }
    }
    console.error("🚫 Hết lượt thử — fallback offline.");
    return this.fallbackAnalysis(prompt);
  }

  // ========================
  // 🧩 Parse JSON an toàn
  // ========================
  safeJsonParse(text) {
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.confidence <= 25) parsed.riskLevel = "CRITICAL";
        else if (parsed.confidence <= 50) parsed.riskLevel = "HIGH";
        else if (parsed.confidence <= 75) parsed.riskLevel = "MEDIUM";
        else parsed.riskLevel = "LOW";
        return parsed;
      }
      throw new Error("Không tìm thấy JSON hợp lệ.");
    } catch (err) {
      console.error("⚠️ Parse JSON lỗi:", err.message);
      return this.fallbackAnalysis(text);
    }
  }

  // ========================
  // ⚙️ Fallback offline
  // ========================
  fallbackAnalysis(emailContent) {
    const lower = emailContent.toLowerCase();
    const score = this.calculateScore(lower);
    const isPhishing = score <= 50;
    const confidence = Math.max(10, Math.min(90, score));
    const riskLevel = this.getRiskLevel(confidence);
    const domainTrust = this.getDomainTrust(emailContent);

    return {
      isPhishing,
      confidence,
      riskLevel,
      analysis: {
        senderAnalysis: this.getSenderAnalysis(emailContent, domainTrust),
        contentAnalysis: this.getContentAnalysis(lower, score),
        domainTrust,
        threats: this.getThreats(lower, isPhishing),
        recommendations: this.getRecommendations(isPhishing, domainTrust),
      },
      explanation: "Phân tích fallback dựa vào từ khóa & domain.",
    };
  }

  // ========================
  // 📚 Các hàm phụ trợ
  // ========================
  extractEmails(text) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(regex) || [];
  }

  hasPhishingSignals(content) {
    const signals = ["click here", "verify", "account", "http://", "forms."];
    return signals.some((s) => content.toLowerCase().includes(s));
  }

  calculateScore(content) {
    let score = 60;
    const phishing = {
      urgent: -15, verify: -10, password: -15, account: -10,
      suspend: -12, "click here": -20, login: -12, bank: -15,
      payment: -15, prize: -20, free: -15, "bit.ly": -25,
      tinyurl: -25, "forms.": -10, "http://": -10,
    };
    const safe = { "fpl.edu.vn": 30, "gov.vn": 30, "vietcombank.com.vn": 25, "security@": 15 };
    for (const [k, v] of Object.entries(phishing)) if (content.includes(k)) score += v;
    for (const [k, v] of Object.entries(safe)) if (content.includes(k)) score += v;
    return Math.max(0, Math.min(100, score));
  }

  getTrustedDomains() {
    return [
      "gmail.com", "google.com", "outlook.com", "microsoft.com", "yahoo.com",
      "icloud.com", "apple.com", "protonmail.com", "zoho.com",
      "vietcombank.com.vn", "vietinbank.vn", "bidv.com.vn", "agribank.com.vn",
      "techcombank.com.vn", "mbbank.com.vn", "acb.com.vn", "vpbank.com.vn",
      "fpl.edu.vn", "hust.edu.vn", "vnu.edu.vn", "ptit.edu.vn",
      "gov.vn", "nic.vn", "mofa.gov.vn", "mof.gov.vn",
    ];
  }

  getSenderAnalysis(content, domainTrust) {
    const emails = this.extractEmails(content);
    if (!emails.length) return "Không có thông tin người gửi.";
    if (domainTrust === "TRUSTED") return "Domain người gửi uy tín.";
    if (domainTrust === "SUSPICIOUS") return "Domain không rõ nguồn.";
    return "Không thể xác định độ tin cậy người gửi.";
  }

  getContentAnalysis(content, score) {
    if (score <= 20) return "Nhiều dấu hiệu lừa đảo nghiêm trọng.";
    if (score <= 40) return "Có dấu hiệu lừa đảo rõ ràng.";
    if (score <= 60) return "Có yếu tố đáng ngờ.";
    if (score <= 80) return "Nội dung tương đối an toàn.";
    return "Nội dung an toàn và đáng tin cậy.";
  }

  getThreats(content, isPhishing) {
    if (!isPhishing) return ["Không phát hiện mối đe dọa."];
    const t = [];
    if (content.includes("http")) t.push("Liên kết đáng ngờ");
    if (content.includes("verify")) t.push("Yêu cầu xác minh giả mạo");
    if (content.includes("prize") || content.includes("free")) t.push("Lời mời nhận thưởng giả");
    return t.length ? t : ["Có dấu hiệu lừa đảo không xác định"];
  }

  getRecommendations(isPhishing, domainTrust) {
    if (isPhishing)
      return [
        "KHÔNG click vào liên kết.",
        "KHÔNG cung cấp thông tin cá nhân.",
        "Xóa email ngay.",
        "Báo cáo cho IT nếu là email công việc.",
      ];
    if (domainTrust === "TRUSTED")
      return ["Email đáng tin cậy.", "Có thể trả lời nếu cần."];
    return [
      "Cảnh giác với yêu cầu bất thường.",
      "Kiểm tra kỹ domain người gửi.",
      "Liên hệ tổ chức qua kênh chính thức.",
    ];
  }

  getRiskLevel(confidence) {
    if (confidence <= 25) return "CRITICAL";
    if (confidence <= 50) return "HIGH";
    if (confidence <= 75) return "MEDIUM";
    return "LOW";
  }

  getDomainTrust(content) {
    const trusted = this.getTrustedDomains();
    const emails = this.extractEmails(content);
    for (const e of emails) {
      const domain = e.split("@")[1]?.toLowerCase();
      if (trusted.includes(domain)) return "TRUSTED";
    }
    return emails.length > 0 ? "SUSPICIOUS" : "UNTRUSTED";
  }
}

// ✅ Export instance
export const geminiAnalyzer = new GeminiEmailAnalyzer();
