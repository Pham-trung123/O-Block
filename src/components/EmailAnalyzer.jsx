import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function EmailAnalyzer() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [allEmails, setAllEmails] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState({});
  const [nextPageToken, setNextPageToken] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 10;

  const [itemLoading, setItemLoading] = useState({});
  const [progress, setProgress] = useState({});

  // ⭐ mở/đóng UI phân tích
  const [isOpen, setIsOpen] = useState({});

  // ⭐ Danh sách 10 tiêu chí
  const criteriaList = [
    "Người gửi đáng ngờ",
    "Chủ đề bất thường",
    "Nội dung khẩn cấp hoặc đe dọa",
    "Yêu cầu cung cấp thông tin nhạy cảm",
    "Liên kết URL đáng ngờ",
    "File đính kèm rủi ro",
    "Sai chính tả hoặc ngữ pháp",
    "Mâu thuẫn thông tin trong email",
    "Máy chủ/IP gửi bất thường",
    "Dấu hiệu trùng mẫu email lừa đảo",
  ];

  // ⭐ mapping từ AI → ✔️ hoặc —
  const mapCriteriaToSignals = (analysis, rulesMatched, behaviorFlags) => {
    if (!analysis) return {};

    return {
      "Người gửi đáng ngờ": analysis.domainTrust !== "TRUSTED",
      "Chủ đề bất thường": behaviorFlags?.includes("high_urgency"),
      "Nội dung khẩn cấp hoặc đe dọa":
        rulesMatched?.some((r) => r.includes("threat")) ||
        behaviorFlags?.includes("high_urgency"),
      "Yêu cầu cung cấp thông tin nhạy cảm":
        rulesMatched?.includes("scam:sensitive_request"),
      "Liên kết URL đáng ngờ":
        rulesMatched?.some((r) => r.startsWith("technical:")),
      "File đính kèm rủi ro":
        analysis?.technicalIndicators?.toLowerCase()?.includes("file"),
      "Sai chính tả hoặc ngữ pháp":
        analysis?.scamAnalysis?.includes("chính tả") ||
        analysis?.scamAnalysis?.includes("ngữ pháp"),
      "Mâu thuẫn thông tin trong email":
        analysis?.contextAnalysis?.includes("bất thường") ||
        analysis?.contextAnalysis?.includes("không phù hợp"),
      "Máy chủ/IP gửi bất thường":
        analysis.domainTrust === "SUSPICIOUS" ||
        analysis.domainTrust === "UNTRUSTED",
      "Dấu hiệu trùng mẫu email lừa đảo":
        rulesMatched?.some((r) => r.startsWith("scam:")) ||
        rulesMatched?.some((r) => r.startsWith("psychological:")),
    };
  };

  // ⭐ tính mức rủi ro bằng tiêu chí
  const riskLevelFromCriteriaScore = (score) => {
    if (score >= 90) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 30) return "MEDIUM";
    return "LOW";
  };

  // =============================
  // Lấy email từ Gmail
  // =============================
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) fetchEmails();
  }, [user]);

  const fetchEmails = async (pageToken = null) => {
    try {
      setLoading(true);

      const url = pageToken
        ? `http://localhost:3000/api/gmail/messages?pageToken=${pageToken}`
        : `http://localhost:3000/api/gmail/messages`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setAllEmails((prev) => [...prev, ...data.messages]);
        setNextPageToken(data.nextPageToken || null);
      } else {
        setError("Không lấy được email.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi lấy email.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // progress bar
  // =============================
  const startProgress = (id) => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 8;
      if (value >= 95) value = 95;
      setProgress((prev) => ({ ...prev, [id]: value }));
    }, 150);

    return interval;
  };

  // =============================
  // Quét 1 email
  // =============================
  const handleAnalyze = async (content, id) => {
    if (!user) return alert("Bạn cần đăng nhập!");

    setItemLoading((prev) => ({ ...prev, [id]: true }));
    setProgress((prev) => ({ ...prev, [id]: 0 }));

    const interval = startProgress(id);
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

        // mở UI sau khi phân tích
        setIsOpen((prev) => ({ ...prev, [id]: true }));
      } else {
        setError("Phân tích thất bại.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối AI.");
    } finally {
      clearInterval(interval);
      setProgress((prev) => ({ ...prev, [id]: 100 }));
      setItemLoading((prev) => ({ ...prev, [id]: false }));
      setLoading(false);
    }
  };

  // =============================
  // Quét nhiều email
  // =============================
  const handleAnalyzeSelected = async () => {
    if (selected.length === 0)
      return alert("Vui lòng chọn email để quét!");

    setLoading(true);

    try {
      for (const id of selected) {
        if (results[id]) continue;
        const email = allEmails.find((e) => e.id === id);
        if (email) {
          await handleAnalyze(email.snippet || email.body, id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const list = getDisplayEmails();
    if (selected.length === list.length) setSelected([]);
    else setSelected(list.map((e) => e.id));
  };

  const getDisplayEmails = () => {
    const start = (currentPage - 1) * emailsPerPage;
    return allEmails.slice(start, start + emailsPerPage);
  };

  const displayEmails = getDisplayEmails();
  const totalPages = Math.ceil(allEmails.length / emailsPerPage);

  const riskColor = (level) => {
    switch (level) {
      case "HIGH":
      case "CRITICAL":
        return "bg-red-50 border-red-400 text-red-700";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-400 text-yellow-700";
      case "LOW":
        return "bg-green-50 border-green-400 text-green-700";
      default:
        return "bg-gray-50 border-gray-300";
    }
  };

  // =============================
  // UI khi chưa login
  // =============================
  if (!user) {
    return (
      <section className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          🔐 Truy cập bị giới hạn
        </h2>
        <p className="text-gray-600">
          Vui lòng <a href="/login" className="text-indigo-600">đăng nhập</a>
        </p>
      </section>
    );
  }

  // =============================
  // ⭐ UI chính
  // =============================
  return (
    <section className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
        ✉️ Trình Phân Tích Email Lừa Đảo
      </h2>

      {allEmails.length === 0 ? (
        <button
          onClick={() =>
            (window.location.href = "http://localhost:3000/api/gmail/login")
          }
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          📩 Kết nối Gmail
        </button>
      ) : (
        <>
          {/* Actions */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">📥 Email gần đây:</h3>

            <div className="flex gap-3">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-200 px-3 py-1 rounded-lg"
              >
                {selected.length === displayEmails.length
                  ? "☑ Bỏ chọn"
                  : "✅ Chọn trang này"}
              </button>

              <button
                onClick={handleAnalyzeSelected}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                🤖 Quét AI ({selected.length})
              </button>
            </div>
          </div>

          {/* List email */}
          <ul className="border rounded-lg divide-y">
            {displayEmails.map((email) => {
              const emailResult = results[email.id];

              const criteriaStates = emailResult
                ? mapCriteriaToSignals(
                    emailResult.analysis,
                    emailResult.rulesMatched,
                    emailResult.behaviorFlags
                  )
                : {};

              const criteriaScore =
                Object.values(criteriaStates).filter(Boolean).length * 10;

              const finalRisk = riskLevelFromCriteriaScore(criteriaScore);

              return (
                <li key={email.id} className="p-3 flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(email.id)}
                        onChange={() => toggleSelect(email.id)}
                      />

                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          handleAnalyze(email.snippet || email.body, email.id)
                        }
                      >
                        <b>{email.subject}</b> —{" "}
                        <span className="text-gray-600">{email.from}</span>
                      </div>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(email.date).toLocaleString()}
                    </span>
                  </div>

                  {/* progress bar */}
                  {itemLoading[email.id] && (
                    <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${progress[email.id] || 0}%` }}
                      />
                    </div>
                  )}

                  {/* Nút xem lại nếu đã phân tích */}
                  {!isOpen[email.id] && results[email.id] && (
                    <button
                      onClick={() =>
                        setIsOpen((prev) => ({ ...prev, [email.id]: true }))
                      }
                      className="mt-2 text-indigo-600 text-sm underline"
                    >
                      👁 Xem kết quả phân tích
                    </button>
                  )}

                  {/* KẾT QUẢ */}
                  {isOpen[email.id] && emailResult && (
                    <div
                      className={`mt-3 p-4 border rounded-lg relative ${riskColor(
                        finalRisk
                      )}`}
                    >
                      {/* nút đóng */}
                      <button
                        onClick={() =>
                          setIsOpen((prev) => ({
                            ...prev,
                            [email.id]: false,
                          }))
                        }
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 text-lg"
                      >
                        ×
                      </button>

                      {/* ALERT */}
                      <h3 className="font-bold text-lg">
                        🔴 Rủi ro: {finalRisk} ({criteriaScore}%)
                      </h3>

                      {/* Không hiển thị dòng người gửi */}
                      {/* Không hiển thị điểm tổng */}

                      {/* BẢNG TIÊU CHÍ */}
                      <div className="mt-4 bg-white border rounded-lg p-3">
                        <h4 className="font-semibold mb-3">
                          🔎 Đánh giá theo 10 tiêu chí
                        </h4>

                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b text-gray-700">
                              <th className="py-2 font-semibold">Tiêu chí</th>
                              <th className="py-2 font-semibold text-center w-20">
                                Kết quả
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {criteriaList.map((item, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{item}</td>
                                <td className="py-2 text-center">
                                  {criteriaStates[item] ? (
                                    <span className="text-purple-600 text-lg">
                                      ✔️
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-lg">
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Khuyến nghị */}
                      <ul className="list-disc ml-6 mt-3 text-sm">
                        {emailResult.recommendations?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === idx + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next ➡
            </button>
          </div>

          {nextPageToken && (
            <div className="text-center mt-4">
              <button
                onClick={() => fetchEmails(nextPageToken)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                📄 Tải thêm email
              </button>
            </div>
          )}
        </>
      )}

      {loading && <p className="text-blue-500 mt-3">🔄 Đang xử lý...</p>}
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </section>
  );
}
