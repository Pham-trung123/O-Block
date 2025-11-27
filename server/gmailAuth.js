// server/gmailAuth.js
import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "server/.env") });
const router = express.Router();

// =============================
// ⚙️ Cấu hình OAuth2 Client
// =============================
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Alias /auth → /login
router.get("/auth", (req, res) => {
  res.redirect("/api/gmail/login");
});

// =============================
// 🔑 Bước 1: Login Gmail
// =============================
router.get("/login", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("🌐 Redirecting to Google OAuth:", url);
  res.redirect(url);
});

// =============================
// 🔁 Bước 2: OAuth Callback
// =============================
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Thiếu mã xác thực!");

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // LƯU TOKEN VÀO SESSION (logic cũ giữ nguyên)
    req.session.googleTokens = tokens;
    console.log("✅ Gmail tokens stored");

    // ⭐⭐⭐ GIỮ TRẠNG THÁI GMAIL BẰNG COOKIE ⭐⭐⭐
    res.cookie("gmail_connected", "1", {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    // Lấy email user từ JWT Google nếu có
    const email =
      tokens.id_token
        ? JSON.parse(
            Buffer.from(tokens.id_token.split(".")[1], "base64").toString()
          ).email
        : null;

    if (email) {
      res.cookie("gmail_email", email, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: false,
        secure: false,
        sameSite: "lax",
      });
    }

    res.redirect("http://localhost:5173/?gmail_connected=1");
  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).send("OAuth callback error");
  }
});

// =============================
// 🔥 API kiểm tra trạng thái Gmail
// =============================
router.get("/status", async (req, res) => {
  try {
    // ⭐ ƯU TIÊN LẤY COOKIE NẾU SESSION MẤT
    if (req.cookies.gmail_connected === "1") {
      return res.json({
        success: true,
        connected: true,
        email: req.cookies.gmail_email || null,
      });
    }

    // Logic cũ nếu session còn
    if (!req.session.googleTokens) {
      return res.json({ success: true, connected: false });
    }

    oAuth2Client.setCredentials(req.session.googleTokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const profile = await gmail.users.getProfile({ userId: "me" });

    return res.json({
      success: true,
      connected: true,
      email: profile.data.emailAddress,
    });
  } catch (err) {
    console.error("❌ Status check error:", err);
    res.json({ success: false, connected: false });
  }
});

// =============================
// 🔧 Decode Base64URL
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
// 📌 LẤY NỘI DUNG EMAIL (Multipart)
// =============================
function extractFullBody(payload) {
  if (!payload) return "";

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts?.length) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      const deep = extractFullBody(part);
      if (deep) return deep;
    }
  }

  return "";
}

// =============================
// 📬 API lấy danh sách email
// =============================
router.get("/messages", async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens)
      return res.status(401).json({
        success: false,
        message: "⚠️ Bạn chưa đăng nhập Gmail",
      });

    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const { pageToken } = req.query;
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      pageToken: pageToken || undefined,
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0)
      return res.json({ success: true, messages: [], nextPageToken: null });

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

        const fullBody = extractFullBody(msg.data.payload);

        return {
          id: m.id,
          from,
          subject,
          date,
          snippet: msg.data.snippet,
          body: fullBody || "(No body content)",
        };
      })
    );

    res.json({
      success: true,
      messages: details,
      nextPageToken: listRes.data.nextPageToken || null,
    });
  } catch (err) {
    console.error("❌ Gmail fetch error:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi không thể lấy email" });
  }
});

// =============================
// 📩 API lấy email mới nhất
// =============================
router.get("/latest", async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens)
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập Gmail" });

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

    const headers = msg.data.payload.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(No subject)";
    const from = headers.find((h) => h.name === "From")?.value || "(Unknown)";

    const fullBody = extractFullBody(msg.data.payload);

    res.json({
      success: true,
      id: m.id,
      from,
      subject,
      snippet: msg.data.snippet,
      content: fullBody,
    });
  } catch (err) {
    console.error("❌ Gmail latest error:", err);
    res.status(500).json({ success: false, message: "Không thể lấy email" });
  }
});

// =============================
// 📄 API lấy chi tiết email
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
    const from =
      headers.find((h) => h.name === "From")?.value || "(Unknown)";

    const fullBody = extractFullBody(msg.data.payload);

    res.json({
      success: true,
      message: {
        id,
        from,
        subject,
        snippet: msg.data.snippet,
        body: fullBody,
      },
    });
  } catch (err) {
    console.error("❌ Gmail detail error:", err);
    res.status(500).json({ success: false, message: "Không thể lấy email" });
  }
});

// =============================
// 🧹 API Logout Gmail
// =============================
router.get("/logout", (req, res) => {
  req.session.googleTokens = null;

  // ⭐ XÓA COOKIE TRẠNG THÁI GMAIL
  res.clearCookie("gmail_connected");
  res.clearCookie("gmail_email");

  res.json({ success: true, message: "Đã logout Gmail" });
});

// =============================
// 🔎 Health check
// =============================
router.get("/", (req, res) => {
  res.json({
    success: true,
    connected: !!req.session.googleTokens,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
});

export default router;
