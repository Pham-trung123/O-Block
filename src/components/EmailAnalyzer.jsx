import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ import kiểm tra đăng nhập

export default function EmailAnalyzer() {
  const { user } = useAuth(); // ✅ lấy thông tin người dùng đăng nhập
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState({});
  const [nextPageToken, setNextPageToken] = useState(null);

  // 🧠 Khi người dùng đã đăng nhập + Gmail connected
  useEffect(() => {
    if (!user) return; // ❌ chưa đăng nhập thì không tải email
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) {
      fetchEmails();
    }
  }, [user]);

  // 📩 Lấy danh sách email từ server
  const fetchEmails = async (pageToken = null) => {
    if (!user) {
      alert("⚠️ Bạn cần đăng nhập để tải email!");
      return;
    }
    try {
      setLoading(true);
      const url = pageToken
        ? `http://localhost:3000/api/gmail/messages?pageToken=${pageToken}`
        : `http://localhost:3000/api/gmail/messages`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setEmails((prev) => [...prev, ...data.messages].slice(0, 10)); // ✅ giới hạn 10 email
        setNextPageToken(data.nextPageToken || null);
      } else {
        setError("⚠️ Không lấy được danh sách email.");
      }
    } catch (err) {
      console.error(err);
      setError("🚫 Lỗi khi lấy email từ Gmail.");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Phân tích nội dung email đơn
  const handleAnalyze = async (content, id) => {
    if (!user) {
      alert("⚠️ Bạn cần đăng nhập để sử dụng AI!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent: content }),
      });
      const data = await response.json();
      if (data.success) {
        setResults((prev) => ({
          ...prev,
          [id]: data.result,
        }));
      } else {
        setError("🚫 Phân tích thất bại: " + (data.message || ""));
      }
    } catch (err) {
      console.error(err);
      setError("🚫 Không thể kết nối tới server hoặc AI Gemini.");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Phân tích nhiều email
  const handleAnalyzeSelected = async () => {
    if (!user) return alert("⚠️ Bạn cần đăng nhập để sử dụng AI!");
    if (selected.length === 0)
      return alert("⚠️ Vui lòng chọn ít nhất một email để quét!");
    setLoading(true);
    try {
      for (const id of selected) {
        const email = emails.find((e) => e.id === id);
        if (email) {
          await handleAnalyze(email.snippet || email.body, id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle chọn email
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === emails.length) setSelected([]);
    else setSelected(emails.map((e) => e.id));
  };

  // 🎨 Màu theo rủi ro
  const riskColor = (level) => {
    switch (level) {
      case "CRITICAL":
      case "HIGH":
        return "bg-red-100 border-red-500 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "LOW":
        return "bg-green-100 border-green-500 text-green-700";
      default:
        return "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  // 🔒 Nếu chưa đăng nhập → hiển thị thông báo
  if (!user) {
    return (
      <section className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          🔐 Truy cập bị giới hạn
        </h2>
        <p className="text-gray-600 mb-3">
          Bạn cần{" "}
          <a href="/login" className="text-indigo-600 underline font-semibold">
            đăng nhập
          </a>{" "}
          hoặc{" "}
          <a href="/register" className="text-indigo-600 underline font-semibold">
            đăng ký
          </a>{" "}
          để sử dụng tính năng phân tích email.
        </p>
      </section>
    );
  }

  // ✅ Nếu đã đăng nhập → hiển thị giao diện chính
  return (
    <section className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        ✉️ Trình Phân Tích Email Lừa Đảo
      </h2>

      {emails.length === 0 ? (
        <button
          onClick={() =>
            (window.location.href = "http://localhost:3000/api/gmail/login")
          }
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          📩 Kết Nối Gmail
        </button>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">📥 Danh sách email gần đây:</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
              >
                {selected.length === emails.length
                  ? "☑️ Bỏ chọn tất cả"
                  : "✅ Chọn tất cả"}
              </button>
              <button
                onClick={handleAnalyzeSelected}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                🤖 Quét AI ({selected.length})
              </button>
            </div>
          </div>

          <ul className="divide-y divide-gray-200 border rounded-lg">
            {emails.map((m) => (
              <li
                key={m.id}
                className="p-3 flex flex-col hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                    />
                    <div
                      className="cursor-pointer"
                      onClick={() => handleAnalyze(m.snippet || m.body, m.id)}
                    >
                      <b>{m.subject}</b> —{" "}
                      <span className="text-gray-600 text-sm">{m.from}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(m.date).toLocaleString()}
                  </span>
                </div>

                {/* ✅ Nếu đã có kết quả phân tích */}
                {results[m.id] && (
                  <div
                    className={`mt-3 border rounded-lg p-3 ${riskColor(
                      results[m.id].riskLevel
                    )}`}
                  >
                    <p className="font-semibold">
                      📊 Rủi ro: {results[m.id].riskLevel} (
                      {results[m.id].confidence}%)
                    </p>
                    <p>👤 {results[m.id].analysis?.senderAnalysis}</p>
                    <p>🧾 {results[m.id].analysis?.contentAnalysis}</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {results[m.id].analysis?.recommendations?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {nextPageToken && (
            <div className="mt-4 text-center">
              <button
                onClick={() => fetchEmails(nextPageToken)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                📄 Tải thêm email
              </button>
            </div>
          )}
        </div>
      )}

      {loading && <p className="mt-3 text-blue-600">🔍 Đang xử lý...</p>}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* ✅ Kết quả thủ công */}
      {result && (
        <div className="mt-6 p-5 border-t border-gray-200 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold text-indigo-700 mb-3">
            📊 Kết Quả Phân Tích (Thủ công):
          </h3>
          <p>
            <b>Mức độ rủi ro:</b> {result.riskLevel} – <b>Độ tin cậy:</b>{" "}
            {result.confidence}%
          </p>
          <p>
            <b>Người gửi:</b> {result.analysis?.senderAnalysis}
          </p>
          <p>
            <b>Nội dung:</b> {result.analysis?.contentAnalysis}
          </p>
          <p>
            <b>Khuyến nghị:</b>
          </p>
          <ul className="list-disc list-inside">
            {result.analysis?.recommendations?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
