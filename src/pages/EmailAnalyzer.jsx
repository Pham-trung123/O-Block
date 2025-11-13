import React, { useState, useEffect, useRef } from "react";
import {
  fetchEmails,
  analyzeEmail,
  getGmailConnectUrl,
} from "../services/gmailService";
import EmailResult from "../components/EmailAnalyzer";

export default function EmailAnalyzer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [nextPageToken, setNextPageToken] = useState(null);

  const fetchedRef = useRef(false); // ✅ chống gọi API 2 lần do StrictMode

  // 🧠 Khi người dùng đăng nhập Gmail xong (callback có ?gmail_connected=1)
  useEffect(() => {
    if (fetchedRef.current) return; // chặn gọi lặp
    fetchedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) fetchEmailList();
  }, []);

  // 📩 Gọi API lấy danh sách email (chỉ tối đa 10 email, không lặp)
  const fetchEmailList = async (pageToken = null) => {
    try {
      setLoading(true);
      const data = await fetchEmails(pageToken);
      if (data.success) {
        // lọc trùng và giới hạn 10
        const unique = Array.from(
          new Map(data.messages.map((e) => [e.id, e])).values()
        );
        setEmails(unique.slice(0, 10)); // ✅ chỉ giữ 10 email mới nhất
        setNextPageToken(null); // ❌ tắt phân trang để tránh cộng dồn
      } else {
        setError(data.message || "⚠️ Lỗi khi lấy email!");
      }
    } catch (err) {
      console.error(err);
      setError("🚫 Lỗi khi kết nối tới Gmail API!");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Phân tích nội dung nhập tay
  const handleAnalyzeManual = async () => {
    if (!input.trim()) return setError("⚠️ Vui lòng nhập nội dung email để phân tích.");
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const data = await analyzeEmail(input);
      if (data.success) setResult(data.result);
      else setError(data.message || "❌ Lỗi khi phân tích email!");
    } catch (err) {
      console.error(err);
      setError("🚫 Không thể kết nối AI Gemini!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chọn / bỏ chọn email
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(selected.length === emails.length ? [] : emails.map((e) => e.id));

  // 🎨 Màu viền theo mức rủi ro
  const riskColor = (level) => {
    switch (level) {
      case "CRITICAL":
      case "HIGH":
        return "border-red-500 bg-red-50";
      case "MEDIUM":
        return "border-yellow-400 bg-yellow-50";
      case "LOW":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  // 🤖 Quét AI toàn bộ email đã chọn
  const analyzeSelected = async () => {
    if (selected.length === 0)
      return alert("⚠️ Vui lòng chọn ít nhất 1 email để quét!");
    setLoading(true);
    const newResults = { ...resultsMap };
    try {
      for (const id of selected) {
        const email = emails.find((e) => e.id === id);
        const res = await analyzeEmail(email.body || email.snippet);
        if (res.success) newResults[id] = res.result;
      }
      setResultsMap(newResults);
    } catch (err) {
      console.error("❌ Lỗi khi quét AI:", err);
      setError("🚫 Không thể phân tích tất cả email!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        ✉️ Trình Phân Tích Email Lừa Đảo
      </h2>

      {/* ============================= */}
      {/* 📧 NHẬP TAY EMAIL */}
      {/* ============================= */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập nội dung email đáng ngờ để phân tích..."
        className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleAnalyzeManual}
        disabled={loading}
        className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        {loading ? "🔍 Đang phân tích..." : "Phân Tích Email Nhập Tay"}
      </button>

      {result && <EmailResult result={result} />}

      {/* ============================= */}
      {/* 📩 DANH SÁCH EMAIL TỪ GMAIL */}
      {/* ============================= */}
      <div className="mt-10">
        {emails.length === 0 ? (
          <div className="text-center">
            <button
              onClick={() => (window.location.href = getGmailConnectUrl())}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              📩 Kết Nối Gmail
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Sau khi đăng nhập, hệ thống sẽ tự động tải email của bạn.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                📥 Email gần đây (tối đa 10)
              </h3>
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1 bg-indigo-100 rounded-md hover:bg-indigo-200"
              >
                {selected.length === emails.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
            </div>

            <ul className="divide-y divide-gray-200">
              {emails.slice(0, 10).map((email) => (
                <li key={email.id} className="py-3">
                  <label className="flex space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(email.id)}
                      onChange={() => toggleSelect(email.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-indigo-700">
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-600">
                        {email.from} —{" "}
                        <span className="text-gray-400">{email.date}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {email.snippet}
                      </p>
                    </div>
                  </label>

                  {/* ✅ Hiển thị kết quả phân tích nếu có */}
                  {resultsMap[email.id] && (
                    <div
                      className={`mt-3 border rounded-lg p-3 ${riskColor(
                        resultsMap[email.id].riskLevel
                      )}`}
                    >
                      <p className="font-semibold">
                        📊 Rủi ro: {resultsMap[email.id].riskLevel} (
                        {resultsMap[email.id].confidence}%)
                      </p>
                      <p>👤 {resultsMap[email.id].analysis?.senderAnalysis}</p>
                      <p>🧾 {resultsMap[email.id].analysis?.contentAnalysis}</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {resultsMap[email.id].analysis?.recommendations?.map(
                          (r, i) => (
                            <li key={i}>{r}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* 🤖 Dời nút Quét AI xuống cuối */}
            <div className="mt-8 text-center">
              <button
                onClick={analyzeSelected}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
              >
                {loading ? "🔍 Đang quét..." : "🤖 Quét Email Đã Chọn Bằng AI"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
