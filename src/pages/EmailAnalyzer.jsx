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

  const fetchedRef = useRef(false);

  // ===================================
  // ⭐ API LƯU VÀO DATABASE
  // ===================================
  const saveAnalysisToDB = async (payload) => {
    try {
      await fetch("http://localhost:3000/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Đã lưu email vào database");
    } catch (err) {
      console.error("❌ Lỗi lưu DB:", err);
    }
  };

  // ===================================
  // 🧠 Tải email Gmail khi kết nối xong
  // ===================================
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) fetchEmailList();
  }, []);

  // ===============================
  // 📩 Lấy danh sách email
  // ===============================
  const fetchEmailList = async (pageToken = null) => {
    try {
      setLoading(true);
      const data = await fetchEmails(pageToken);

      if (data.success) {
        const unique = Array.from(
          new Map(data.messages.map((e) => [e.id, e])).values()
        );
        setEmails(unique.slice(0, 10));
        setNextPageToken(null);
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

  // ===============================
  // ⭐ Phân tích email nhập tay
  // ===============================
  const handleAnalyzeManual = async () => {
    if (!input.trim()) return setError("⚠️ Vui lòng nhập nội dung email.");

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeEmail(input);

      if (data.success) {
        setResult(data.result);

        // =====================================
        // ⭐ LƯU VÀO DATABASE
        // =====================================
        await saveAnalysisToDB({
          user_id: 1, // Hoặc user.id nếu có AuthContext
          email_content: input,
          sender_analysis: data.result.sender_analysis,
          content_analysis: data.result.content_analysis,
          link_analysis: data.result.link_analysis,
          risk_level: data.result.risk_level,
          threat_score: data.result.threat_score,
          recommendation: data.result.recommendation,
        });
      } else {
        setError(data.message || "❌ Lỗi khi phân tích email!");
      }
    } catch (err) {
      console.error(err);
      setError("🚫 Không thể kết nối AI Gemini!");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(selected.length === emails.length ? [] : emails.map((e) => e.id));

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

  // ===============================
  // ⭐ Quét các email đã chọn
  // ===============================
  const analyzeSelected = async () => {
    if (selected.length === 0)
      return alert("⚠️ Vui lòng chọn ít nhất 1 email!");

    setLoading(true);
    const newResults = { ...resultsMap };

    try {
      for (const id of selected) {
        const email = emails.find((e) => e.id === id);
        const res = await analyzeEmail(email.body || email.snippet);

        if (res.success) {
          newResults[id] = res.result;

          // =====================================
          // ⭐ LƯU PHÂN TÍCH EMAIL TỪ GMAIL
          // =====================================
          await saveAnalysisToDB({
            user_id: 1,
            email_content: email.body || email.snippet,
            sender_analysis: res.result.sender_analysis,
            content_analysis: res.result.content_analysis,
            link_analysis: res.result.link_analysis,
            risk_level: res.result.risk_level,
            threat_score: res.result.threat_score,
            recommendation: res.result.recommendation,
          });
        }
      }

      setResultsMap(newResults);
    } catch (err) {
      console.error("❌ Lỗi khi quét AI:", err);
      setError("🚫 Lỗi phân tích email!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        ✉️ Trình Phân Tích Email Lừa Đảo
      </h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập nội dung email đáng ngờ..."
        className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
      />

      <button
        onClick={handleAnalyzeManual}
        disabled={loading}
        className="mt-3 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        {loading ? "🔍 Đang phân tích..." : "Phân Tích Email Nhập Tay"}
      </button>

      {result && <EmailResult result={result} />}

      {/* ========================== */}
      {/* DANH SÁCH EMAIL GMAIL */}
      {/* ========================== */}
      <div className="mt-10">
        {emails.length === 0 ? (
          <div className="text-center">
            <button
              onClick={() => (window.location.href = getGmailConnectUrl())}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              📩 Kết Nối Gmail
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">📥 Email gần đây</h3>
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1 bg-indigo-100 rounded-md hover:bg-indigo-200"
              >
                {selected.length === emails.length ? "Bỏ chọn" : "Chọn tất cả"}
              </button>
            </div>

            <ul className="divide-y divide-gray-200">
              {emails.map((email) => (
                <li key={email.id} className="py-3">
                  <label className="flex space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(email.id)}
                      onChange={() => toggleSelect(email.id)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-indigo-700">{email.subject}</p>
                      <p className="text-sm text-gray-600">
                        {email.from} — <span>{email.date}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">{email.snippet}</p>
                    </div>
                  </label>

                  {resultsMap[email.id] && (
                    <div
                      className={`mt-3 border rounded-lg p-3 ${riskColor(
                        resultsMap[email.id].risk_level
                      )}`}
                    >
                      <p className="font-semibold">
                        📊 Rủi ro: {resultsMap[email.id].risk_level} (
                        {resultsMap[email.id].threat_score}%)
                      </p>
                      <p>👤 {resultsMap[email.id].sender_analysis}</p>
                      <p>🧾 {resultsMap[email.id].content_analysis}</p>
                      <p>🔗 {resultsMap[email.id].link_analysis}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center">
              <button
                onClick={analyzeSelected}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
              >
                {loading ? "🔍 Đang quét..." : "🤖 Quét Email Đã Chọn"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
