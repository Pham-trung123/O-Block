// server/gmailAuth.js
import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "server/.env") }); // load đúng .env
const router = express.Router();

// =============================
// ⚙️ Cấu hình OAuth2 Client
// =============================
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // ví dụ: http://localhost:3000/api/gmail/callback
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// =============================
// 🔗 ROUTES CHÍNH
// =============================

// Alias: /auth -> /login (giữ tương thích với các frontend cũ)
router.get("/auth", (req, res) => {
  res.redirect("/api/gmail/login");
});

// 🔑 Bước 1: Login Gmail (redirect tới Google OAuth)
router.get("/login", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  console.log("🌐 Redirecting user to Google OAuth:", url);
  res.redirect(url);
});

// 🔁 Bước 2: Callback sau khi người dùng cho phép truy cập
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Thiếu mã xác thực (code)!");

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // ✅ Lưu tokens vào session
    req.session.googleTokens = tokens;
    console.log("✅ Gmail tokens stored in session:", {
      access_token: !!tokens.access_token,
      refresh_token: !!tokens.refresh_token,
    });

    // redirect về frontend
    res.redirect("http://localhost:5173/?gmail_connected=1");
  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).send("OAuth callback error!");
  }
});

// =============================
// 🧩 Helper decode base64url
// =============================
function decodeBase64Url(str) {
  if (!str) return "";
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    return Buffer.from(s, "base64").toString("utf-8");
  } catch (e) {
    return "";
  }
}

// =============================
// 📬 API: Danh sách email
// =============================
router.get("/messages", async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens)
      return res
        .status(401)
        .json({ success: false, message: "⚠️ Bạn chưa đăng nhập Gmail" });

    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Hỗ trợ phân trang nếu có pageToken
    const { pageToken } = req.query;
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      pageToken: pageToken || undefined,
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0)
      return res.json({ success: true, messages: [], nextPageToken: null });

    // Lấy chi tiết từng email
    const details = await Promise.all(
      messages.map(async (m) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "full",
        });

        const headers = msg.data.payload?.headers || [];
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(No subject)";
        const from =
          headers.find((h) => h.name === "From")?.value || "(Unknown)";
        const date = headers.find((h) => h.name === "Date")?.value || "";
        const body =
          msg.data.payload?.parts?.[0]?.body?.data ||
          msg.data.payload?.body?.data ||
          "";
        const decoded = decodeBase64Url(body);

        return {
          id: m.id,
          from,
          subject,
          date,
          snippet: msg.data.snippet,
          body: decoded || "(No body)",
        };
      })
    );

    res.json({
      success: true,
      messages: details,
      nextPageToken: listRes.data.nextPageToken || null,
    });
  } catch (err) {
    console.error("❌ Gmail fetch error:", err.message);
    // Nếu token hết hạn, reset session
    if (err.message.includes("invalid_grant") || err.code === 401) {
      req.session.googleTokens = null;
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập Gmail đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách email" });
  }
});

// =============================
// 📥 API: Lấy email gần nhất
// =============================
router.get("/latest", async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens)
      return res
        .status(401)
        .json({ success: false, message: "Bạn chưa đăng nhập Gmail" });

    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1,
    });
    const messages = listRes.data.messages || [];
    if (messages.length === 0)
      return res.json({ success: true, content: "", snippet: "" });

    const m = messages[0];
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "full",
    });

    const headers = msg.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(No subject)";
    const from = headers.find((h) => h.name === "From")?.value || "(Unknown)";
    const body =
      msg.data.payload?.parts?.[0]?.body?.data ||
      msg.data.payload?.body?.data ||
      "";
    const decoded = decodeBase64Url(body);

    res.json({
      success: true,
      id: m.id,
      from,
      subject,
      snippet: msg.data.snippet,
      content: decoded || msg.data.snippet || "",
    });
  } catch (err) {
    console.error("❌ Gmail latest error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Không thể lấy email gần nhất" });
  }
});

// =============================
// 📄 API: Lấy chi tiết 1 email theo ID
// =============================
router.get("/message/:id", async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens)
      return res
        .status(401)
        .json({ success: false, message: "Bạn chưa đăng nhập Gmail" });

    const { id } = req.params;
    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });
    const headers = msg.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(No subject)";
    const from = headers.find((h) => h.name === "From")?.value || "(Unknown)";
    const body =
      msg.data.payload?.parts?.[0]?.body?.data ||
      msg.data.payload?.body?.data ||
      "";
    const decoded = decodeBase64Url(body);

    res.json({
      success: true,
      message: {
        id,
        from,
        subject,
        snippet: msg.data.snippet,
        body: decoded || "(No body)",
      },
    });
  } catch (err) {
    console.error("❌ Gmail detail error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Không thể lấy email chi tiết" });
  }
});

// =============================
// 🧹 API: Đăng xuất Gmail
// =============================
router.get("/logout", (req, res) => {
  try {
    req.session.googleTokens = null;
    res.json({ success: true, message: "Đã đăng xuất Gmail." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Không thể đăng xuất" });
  }
});

// =============================
// 🔎 Health check
// =============================
router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "Gmail OAuth API",
    connected: !!req.session.googleTokens,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
});

export default router;
