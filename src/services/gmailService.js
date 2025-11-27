const BASE_URL = "http://localhost:3000";

// ======================================================
// ✅ HÀM LẤY URL ĐĂNG NHẬP GMAIL OAUTH2
// ======================================================
export function getGmailConnectUrl() {
  return `${BASE_URL}/api/gmail/login`;
}

// ======================================================
// ✅ LẤY DANH SÁCH EMAIL (PHÂN TRANG + KIỂM TRA LỖI)
// ======================================================
export async function fetchEmails(pageToken = null) {
  try {
    const url = new URL(`${BASE_URL}/api/gmail/messages`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString(), {
      credentials: "include",       // ⭐ QUAN TRỌNG: giữ session Gmail
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

// ======================================================
// ✅ GỬI NỘI DUNG EMAIL CHO AI PHÂN TÍCH
// ======================================================
export async function analyzeEmail(emailContent) {
  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ⭐ Nên thêm để đồng bộ cookie phiên
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

// ======================================================
// ⭐⭐  NEW: KIỂM TRA TRẠNG THÁI KẾT NỐI GMAIL
// ======================================================
export async function checkGmailStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/gmail/status`, {
      credentials: "include",   // ⭐ BẮT BUỘC để đọc session user
    });

    if (!response.ok) {
      return { success: false, connected: false };
    }

    const data = await response.json();

    // Dữ liệu hợp lệ từ server: { success, connected, email }
    return data;
  } catch (err) {
    console.error("❌ checkGmailStatus error:", err);
    return { success: false, connected: false };
  }
}
