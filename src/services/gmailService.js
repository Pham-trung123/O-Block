const BASE_URL = "http://localhost:3000";

// ✅ Hàm tạo đường dẫn đăng nhập Gmail OAuth2
export function getGmailConnectUrl() {
  return `${BASE_URL}/api/gmail/login`;
}

// ✅ Lấy danh sách email từ backend (hỗ trợ phân trang & xử lý lỗi)
export async function fetchEmails(pageToken = null) {
  try {
    const url = new URL(`${BASE_URL}/api/gmail/messages`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString(), {
      credentials: "include",
    });

    if (!response.ok)
      throw new Error(`Không thể tải danh sách email! (${response.status})`);

    const data = await response.json();
    if (!data || typeof data !== "object" || !("success" in data)) {
      return { success: false, messages: [], message: "Dữ liệu không hợp lệ!" };
    }

    return data;
  } catch (err) {
    console.error("❌ fetchEmails error:", err);
    return { success: false, messages: [], message: err.message };
  }
}

// ✅ Gửi nội dung email để AI Gemini phân tích
export async function analyzeEmail(emailContent) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailContent }),
    });

    if (!response.ok)
      throw new Error(`Không thể gửi nội dung tới AI! (${response.status})`);

    const data = await response.json();
    if (!data || typeof data !== "object" || !("success" in data)) {
      return { success: false, message: "Dữ liệu AI trả về không hợp lệ!" };
    }

    return data;
  } catch (err) {
    console.error("❌ analyzeEmail error:", err);
    return { success: false, message: err.message };
  }
}
