import React, { useState, useEffect, useRef } from "react";
import {
  fetchEmails,
  analyzeEmail,
  getGmailConnectUrl,
  checkGmailStatus,
} from "../services/gmailService";
import EmailResult from "../components/EmailAnalyzer";
import { FiMail, FiShield, FiCheck, FiAlertTriangle, FiLink, FiUser } from "react-icons/fi";

export default function EmailAnalyzer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");

  const fetchedRef = useRef(false);

  // ===================================
  // ⭐ LƯU PHÂN TÍCH VÀO DATABASE
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

  // ===============================
  // ⭐ KIỂM TRA TRẠNG THÁI GMAIL
  // ===============================
  useEffect(() => {
    async function init() {
      const status = await checkGmailStatus();

      if (status.connected) {
        setGmailConnected(true);
        setGmailEmail(status.email);
        fetchEmailList();
      } else {
        const params = new URLSearchParams(window.location.search);
        if (params.get("gmail_connected")) {
          setGmailConnected(true);
          fetchEmailList();
        }
      }
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      init();
    }
  }, []);

  // ===============================
  // 📩 Lấy danh sách email
  // ===============================
  const fetchEmailList = async (pageToken = null) => {
    // ⭐ FIX LỖI: nếu chưa kết nối Gmail thì KHÔNG gọi API
    if (!gmailConnected) {
      console.log("⛔ Không fetch email vì chưa kết nối Gmail");
      return;
    }

    try {
      setLoading(true);

      const data = await fetchEmails(pageToken);

      if (data.success) {
        const unique = Array.from(new Map(data.messages.map((e) => [e.id, e])).values());
        setEmails(unique);
      } else {
        setError(data.message || "⚠️ Lỗi khi lấy email!");
      }
    } catch (err) {
      console.error(err);
      setError("🚫 Lỗi khi kết nối Gmail API!");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⭐ Phân tích email thủ công
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

        await saveAnalysisToDB({
          user_id: 1,
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
        return "bg-gradient-to-br from-red-50 to-orange-50 border-red-200 text-red-800";
      case "HIGH":
        return "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 text-orange-800";
      case "MEDIUM":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
      case "LOW":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-800";
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 text-gray-800";
    }
  };

  const riskBadgeColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "HIGH":
        return "bg-gradient-to-r from-orange-500 to-orange-600";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-green-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
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

  // ======================================================
  // ⭐⭐ RENDER UI
  // ======================================================
  return (
    <section className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <FiShield className="text-white text-xl" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
            Phân Tích Email Lừa Đảo
          </h2>
        </div>
        <p className="text-gray-600">Sử dụng AI để phát hiện email nguy hiểm.</p>
      </div>

      {/* ============================= */}
      {/* 🚫 CHƯA KẾT NỐI GMAIL */}
      {/* ============================= */}
      {!gmailConnected && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-green-500 text-2xl" />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa kết nối Gmail</h3>
          <p className="text-gray-600 mb-6">Kết nối Gmail để bắt đầu phân tích email.</p>

          <button
            onClick={() => (window.location.href = getGmailConnectUrl())}
            className="bg-green-600 text-white px-6 py-3 rounded-xl shadow hover:bg-green-700 transition"
          >
            Kết Nối Gmail
          </button>
        </div>
      )}

      {/* ============================= */}
      {/* ⭐ ĐÃ KẾT NỐI GMAIL */}
      {/* ============================= */}
      {gmailConnected && (
        <>
          {/* Phân tích thủ công */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 mb-8">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập nội dung email đáng ngờ..."
              className="w-full h-40 border border-gray-300 rounded-xl p-4"
            />

            <button
              onClick={handleAnalyzeManual}
              disabled={loading}
              className="mt-4 w-full bg-purple-600 text-white py-3 rounded-xl"
            >
              {loading ? "Đang phân tích..." : "Phân Tích Email"}
            </button>

            {result && <EmailResult result={result} />}
          </div>

          {/* DANH SÁCH EMAIL */}
          <div className="mt-8">

            {/* Header danh sách */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">

              {/* Thông tin */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiMail className="text-purple-500" />
                  Email gần đây
                </h3>
                <p className="text-sm text-gray-600">
                  Đã tải {emails.length} email • {selected.length} được chọn
                </p>
              </div>

              {/* Các nút hành động */}
              <div className="flex flex-wrap gap-3">

                {/* ⭐⭐ NÚT TẢI LẠI EMAIL ⭐⭐ */}
                <button
                  onClick={() => gmailConnected && fetchEmailList()}
                  disabled={!gmailConnected}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 font-medium ${
                    gmailConnected
                      ? "bg-white border-blue-300 text-blue-600 hover:bg-blue-50"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  🔄 Tải lại
                </button>

                {/* Chọn tất cả */}
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
                >
                  {selected.length === emails.length ? (
                    <>
                      <FiCheck className="text-lg" />
                      Bỏ chọn tất cả
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-lg" />
                      Chọn tất cả
                    </>
                  )}
                </button>

                {/* Quét email */}
                <button
                  onClick={analyzeSelected}
                  disabled={loading || selected.length === 0}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShield className="text-lg" />
                  Quét Email Đã Chọn ({selected.length})
                </button>
              </div>
            </div>

            {/* LIST CONTENT */}
            <div className="border border-gray-200 rounded-xl divide-y bg-white shadow-sm">
              {emails.map((email) => (
                <div key={email.id} className="p-4 hover:bg-gray-50 transition">

                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(email.id)}
                      onChange={() => toggleSelect(email.id)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {email.subject}
                        </h4>

                        {resultsMap[email.id] && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full text-white ${riskBadgeColor(
                              resultsMap[email.id].risk_level
                            )}`}
                          >
                            {resultsMap[email.id].risk_level}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FiUser className="text-gray-500" /> {email.from}
                      </p>

                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(email.date).toLocaleString("vi-VN")}
                      </p>

                      <p className="text-sm text-gray-700 line-clamp-2">
                        {email.snippet}
                      </p>
                    </div>
                  </div>

                  {/* Nếu có phân tích */}
                  {resultsMap[email.id] && (
                    <div
                      className={`mt-4 p-4 rounded-xl border-2 ${riskColor(
                        resultsMap[email.id].risk_level
                      )}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${riskBadgeColor(
                            resultsMap[email.id].risk_level
                          )}`}
                        >
                          <FiAlertTriangle className="text-white text-lg" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">
                            Rủi ro: {resultsMap[email.id].risk_level}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Điểm đe dọa: {resultsMap[email.id].threat_score}%
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <FiUser className="text-blue-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Người gửi:</span>
                            <p className="text-gray-700">
                              {resultsMap[email.id].sender_analysis}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <FiMail className="text-purple-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Nội dung:</span>
                            <p className="text-gray-700">
                              {resultsMap[email.id].content_analysis}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <FiLink className="text-orange-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Liên kết:</span>
                            <p className="text-gray-700">
                              {resultsMap[email.id].link_analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <FiAlertTriangle className="text-red-500 text-xl" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
