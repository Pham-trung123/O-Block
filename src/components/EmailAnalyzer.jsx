import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiShield,
  FiBarChart2,
  FiExternalLink,
  FiLoader,
  FiClock,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scanningProgress, setScanningProgress] = useState(0);

  // ⭐ mở/đóng chi tiết từng tiêu chí & từng phần phân tích AI
  const [openCriteria, setOpenCriteria] = useState({}); // { [emailId]: criteriaKey | null }
  const [openDetail, setOpenDetail] = useState({}); // { [emailId]: sectionKey | null }

  // ⭐ mapping 10 tiêu chí ↔ key trong JSON backend
  const criteriaConfig = [
    { label: "Người gửi đáng ngờ", key: "sender" },
    { label: "Chủ đề bất thường", key: "subject" },
    { label: "Nội dung khẩn cấp hoặc đe dọa", key: "urgent" },
    { label: "Yêu cầu cung cấp thông tin nhạy cảm", key: "sensitiveInfo" },
    { label: "Liên kết URL đáng ngờ", key: "links" },
    { label: "File đính kèm rủi ro", key: "attachments" },
    { label: "Sai chính tả hoặc ngữ pháp", key: "grammar" },
    { label: "Mâu thuẫn thông tin trong email", key: "infoMismatch" },
    { label: "Máy chủ/IP gửi bất thường", key: "serverIP" },
    { label: "Dấu hiệu trùng mẫu email lừa đảo", key: "phishingPattern" },
  ];

  // ⭐ fallback mapping nếu backend không trả "criteria"
  const mapFallbackCriteria = (analysis, rulesMatched, behaviorFlags) => {
    if (!analysis) return {};

    return {
      sender: analysis.domainTrust && analysis.domainTrust !== "TRUSTED",
      subject: behaviorFlags?.includes("high_urgency"),
      urgent:
        rulesMatched?.some((r) => r.includes("threat")) ||
        behaviorFlags?.includes("high_urgency"),
      sensitiveInfo: rulesMatched?.includes("scam:sensitive_request"),
      links: rulesMatched?.some((r) => r.startsWith("technical:")),
      attachments:
        analysis?.technicalIndicators?.toLowerCase()?.includes("file") ||
        analysis?.technicalIndicators?.toLowerCase()?.includes("đính kèm"),
      grammar:
        analysis?.scamAnalysis?.toLowerCase()?.includes("chính tả") ||
        analysis?.scamAnalysis?.toLowerCase()?.includes("ngữ pháp"),
      infoMismatch:
        analysis?.contextAnalysis?.toLowerCase()?.includes("bất thường") ||
        analysis?.contextAnalysis?.toLowerCase()?.includes("không phù hợp"),
      serverIP:
        analysis.domainTrust === "SUSPICIOUS" ||
        analysis.domainTrust === "UNTRUSTED",
      phishingPattern:
        rulesMatched?.some((r) => r.startsWith("scam:")) ||
        rulesMatched?.some((r) => r.startsWith("psychological:")),
    };
  };

  // ⭐ fallback nếu thiếu riskLevel từ backend
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
    if (localStorage.getItem("gmail_connected") === "1") {
      fetchEmails();
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) {
      localStorage.setItem("gmail_connected", "1");
      fetchEmails();
    }
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
      console.log("KẾT QUẢ AI:", data.result);

      if (data.success) {
        setResults((prev) => ({
          ...prev,
          [id]: data.result,
        }));
        await saveAnalysis(id, content, data.result);

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

  const saveAnalysis = async (id, content, raw_result) => {
    try {
      await fetch("http://localhost:3000/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email_content: content,
          raw_result: raw_result,
        }),
      });

      console.log("💾 Đã lưu kết quả AI vào DB!");
    } catch (err) {
      console.error("❌ Lỗi save-analysis:", err);
    }
  };

  // =============================
  // Quét nhiều email
  // =============================
  const handleAnalyzeSelected = async () => {
    if (selected.length === 0) return alert("Vui lòng chọn email để quét!");

    setLoading(true);
    setScanningProgress(0);

    try {
      for (let i = 0; i < selected.length; i++) {
        const id = selected[i];

        const email = allEmails.find((e) => e.id === id);
        if (email) {
          await handleAnalyze(email.snippet || email.body, id);
        }
        setScanningProgress(((i + 1) / selected.length) * 100);
      }
    } finally {
      setLoading(false);
      setScanningProgress(0);
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
      case "CRITICAL":
        return "bg-gradient-to-br from-red-50 to-orange-50 border-red-200 text-red-800 shadow-lg";
      case "HIGH":
        return "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 text-orange-800 shadow-md";
      case "MEDIUM":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800 shadow-sm";
      case "LOW":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-800 shadow-sm";
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 text-gray-800";
    }
  };

  const riskBadgeColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "HIGH":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm";
      case "LOW":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  // Badge màu cho từng loại section phân tích
  const sectionBadgeColor = (key) => {
    switch (key) {
      case "scamAnalysis":
        return "bg-red-100 text-red-700 border-red-200";
      case "manipulationAnalysis":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "threatAnalysis":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "contextAnalysis":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "technicalIndicators":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "summary":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // =============================
  // UI khi chưa login
  // =============================
  if (!user) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 text-center"
      >
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiShield className="text-white text-3xl" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-red-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Truy cập bị giới hạn
        </motion.h2>
        <motion.p
          className="text-gray-600 mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Vui lòng đăng nhập để sử dụng tính năng phân tích email AI
        </motion.p>
        <motion.a
          href="/login"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:from-purple-700 hover:to-blue-600 transform hover:-translate-y-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMail className="text-xl" />
          Đăng nhập ngay
        </motion.a>
      </motion.section>
    );
  }

  // =============================
  // ⭐ UI chính
  // =============================
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100"
    >
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FiShield className="text-white text-2xl" />
          </motion.div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
            Phân Tích Email Lừa Đảo
          </h1>
        </div>
        <motion.p
          className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Sử dụng{" "}
          <span className="font-bold text-purple-600">AI tiên tiến</span> để
          phát hiện và cảnh báo các email đáng ngờ. Bảo vệ bạn khỏi các cuộc
          tấn công mạng tinh vi với độ chính xác 99.8%.
        </motion.p>
      </motion.div>

      {allEmails.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FiMail className="text-blue-500 text-3xl" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Chưa kết nối Gmail
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Kết nối với Gmail để bắt đầu phân tích email bằng AI
          </p>
          <motion.button
            onClick={() =>
              (window.location.href = "http://localhost:3000/api/gmail/login")
            }
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiExternalLink className="text-xl" />
            Kết nối Gmail
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Stats và Actions */}
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiBarChart2 className="text-blue-500 text-2xl" />
                </motion.div>
                Email gần đây
              </h3>
              <p className="text-gray-600 flex items-center gap-2">
                <FiMail className="text-purple-500" />
                Đã tải {allEmails.length} email • {selected.length} được chọn
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={toggleSelectAll}
                className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {selected.length === displayEmails.length ? (
                  <>
                    <FiX className="text-xl" />
                    Bỏ chọn trang
                  </>
                ) : (
                  <>
                    <FiCheck className="text-xl" />
                    Chọn trang này
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleAnalyzeSelected}
                disabled={selected.length === 0 || loading}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{
                  scale: selected.length > 0 && !loading ? 1.05 : 1,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : {}}
                  transition={{
                    duration: 2,
                    repeat: loading ? Infinity : 0,
                  }}
                >
                  <FiShield className="text-xl" />
                </motion.div>
                Quét AI ({selected.length})
              </motion.button>
            </div>
          </motion.div>

          {/* Scanning Progress */}
          <AnimatePresence>
            {scanningProgress > 0 && scanningProgress < 100 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FiLoader className="text-purple-500 text-xl" />
                  </motion.div>
                  <span className="font-semibold text-purple-700">
                    Đang quét {selected.length} email...
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${scanningProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-right text-sm text-purple-600 mt-1 font-medium">
                  {Math.round(scanningProgress)}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List email */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border border-gray-200 rounded-2xl divide-y divide-gray-100 bg-white shadow-lg overflow-hidden"
          >
            {displayEmails.map((email) => {
              const emailResult = results[email.id];

              // ⭐ TÍNH CRITERIA + RISK DỰA TRÊN KẾT QUẢ AI
              let criteriaStates = {};
              let criteriaReasons = {};
              let criteriaScore = 0;
              let finalRisk = "LOW";

              if (emailResult) {
                const aiCriteria = emailResult.criteria || {};
                const fallbackCriteria = mapFallbackCriteria(
                  emailResult.analysis,
                  emailResult.rulesMatched,
                  emailResult.behaviorFlags
                );

                criteriaConfig.forEach((cfg) => {
                  const fromAI = aiCriteria?.[cfg.key];
                  if (fromAI) {
                    const isWarning = fromAI.status === "warning";
                    criteriaStates[cfg.key] = isWarning;
                    criteriaReasons[cfg.key] =
                      fromAI.reason ||
                      (isWarning
                        ? "AI phát hiện dấu hiệu bất thường cho tiêu chí này."
                        : "AI không phát hiện dấu hiệu đáng ngờ rõ rệt.");
                  } else {
                    const fb = fallbackCriteria?.[cfg.key];
                    criteriaStates[cfg.key] = !!fb;
                    criteriaReasons[cfg.key] = fb
                      ? "Bộ luật offline phát hiện dấu hiệu bất thường cho tiêu chí này."
                      : "Không phát hiện dấu hiệu rõ rệt cho tiêu chí này (offline).";
                  }
                });

                // Điểm: ưu tiên score từ backend, nếu không có thì = số warning * 10
                if (typeof emailResult.score === "number") {
                  criteriaScore = emailResult.score;
                } else {
                  criteriaScore =
                    Object.values(criteriaStates).filter(Boolean).length * 10;
                }

                // Risk: ưu tiên riskLevel backend, fallback theo score
                finalRisk =
                  emailResult.riskLevel ||
                  riskLevelFromCriteriaScore(criteriaScore);
              }

              const analysis = emailResult?.analysis || {};
              const detailSections = [
                {
                  key: "scamAnalysis",
                  title: "Dấu hiệu lừa đảo / Scam",
                  text: analysis.scamAnalysis,
                },
                {
                  key: "manipulationAnalysis",
                  title: "Thao túng tâm lý / Social Engineering",
                  text: analysis.manipulationAnalysis,
                },
                {
                  key: "threatAnalysis",
                  title: "Ngôn ngữ đe dọa / Uy hiếp",
                  text: analysis.threatAnalysis,
                },
                {
                  key: "contextAnalysis",
                  title: "Ngữ cảnh & vai trò người gửi",
                  text: analysis.contextAnalysis,
                },
                {
                  key: "technicalIndicators",
                  title: "Chỉ báo kỹ thuật (links, domain, file)",
                  text: analysis.technicalIndicators,
                },
                {
                  key: "summary",
                  title: "Tổng kết AI",
                  text: analysis.summary,
                },
              ].filter((s) => s.text && s.text.trim().length > 0);

              const currentOpenCriteria = openCriteria[email.id] || null;
              const currentOpenDetail = openDetail[email.id] || null;

              return (
                <motion.div
                  key={email.id}
                  variants={itemVariants}
                  className="p-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300 border-l-4 border-transparent hover:border-purple-400"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <motion.input
                        type="checkbox"
                        checked={selected.includes(email.id)}
                        onChange={() => toggleSelect(email.id)}
                        className="mt-2 w-5 h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          handleAnalyze(email.snippet || email.body, email.id)
                        }
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-bold text-gray-900 text-lg truncate flex items-center gap-2">
                            <FiMail className="text-blue-500 flex-shrink-0" />
                            {email.subject}
                          </h4>
                          {emailResult && (
                            <motion.span
                              className={`px-3 py-1.5 text-sm font-bold rounded-full ${riskBadgeColor(
                                finalRisk
                              )} shadow-lg`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                              }}
                            >
                              {finalRisk}
                            </motion.span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-2">
                            <FiUser className="text-purple-500" />
                            {email.from}
                          </span>
                          <span className="flex items-center gap-2">
                            <FiCalendar className="text-green-500" />
                            {new Date(email.date).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-gray-700 line-clamp-2 bg-gray-50/50 p-2 rounded-lg">
                          {email.snippet}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      onClick={() =>
                        handleAnalyze(email.snippet || email.body, email.id)
                      }
                      disabled={itemLoading[email.id]}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold min-w-[140px] justify-center"
                      whileHover={{
                        scale: itemLoading[email.id] ? 1 : 1.05,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {itemLoading[email.id] ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Đang phân tích...
                        </>
                      ) : (
                        <>
                          <FiShield className="text-base" />
                          {emailResult ? "Phân tích lại" : "Phân tích"}
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Progress bar */}
                  {itemLoading[email.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4"
                    >
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{
                            width: `${progress[email.id] || 0}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {Math.round(progress[email.id] || 0)}%
                      </div>
                    </motion.div>
                  )}

                  {/* Nút xem lại nếu đã phân tích */}
                  {!isOpen[email.id] && results[email.id] && (
                    <motion.button
                      onClick={() =>
                        setIsOpen((prev) => ({
                          ...prev,
                          [email.id]: true,
                        }))
                      }
                      className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 transition-colors group"
                      whileHover={{ x: 5 }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        👁
                      </motion.span>
                      Xem kết quả phân tích chi tiết
                      <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  )}

                  {/* KẾT QUẢ */}
                  <AnimatePresence>
                    {isOpen[email.id] && emailResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-6 p-6 rounded-2xl border-2 relative overflow-hidden ${riskColor(
                          finalRisk
                        )}`}
                      >
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full -translate-y-16 translate-x-16" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full translate-y-12 -translate-x-12" />
                        </div>

                        {/* nút đóng */}
                        <motion.button
                          onClick={() =>
                            setIsOpen((prev) => ({
                              ...prev,
                              [email.id]: false,
                            }))
                          }
                          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-white/50 z-10"
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiX className="text-xl" />
                        </motion.button>

                        {/* Header kết quả */}
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                          <motion.div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${riskBadgeColor(
                              finalRisk
                            )}`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                            }}
                          >
                            <FiAlertTriangle className="text-xl" />
                          </motion.div>
                          <div>
                            <motion.h3
                              className="font-black text-2xl mb-1"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              Mức độ rủi ro: {finalRisk}
                            </motion.h3>
                            <motion.p
                              className="text-lg font-semibold opacity-80"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Điểm đánh giá: {Math.round(criteriaScore)}%
                            </motion.p>
                            {emailResult.explanation && (
                              <motion.p
                                className="text-sm mt-1 opacity-80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                {emailResult.explanation}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* BẢNG TIÊU CHÍ + ACCORDION */}
                        <motion.div
                          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-5 relative z-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            >
                              <FiCheck className="text-green-500 text-xl" />
                            </motion.div>
                            Đánh giá theo 10 tiêu chí AI
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {criteriaConfig.map((cfg, idx) => {
                              const active = criteriaStates[cfg.key];
                              const reason = criteriaReasons[cfg.key];
                              const opened =
                                currentOpenCriteria === cfg.key;

                              return (
                                <motion.div
                                  key={cfg.key}
                                  className={`group cursor-pointer relative rounded-xl border p-3 transition-all duration-300 ${
                                    active
                                      ? "bg-red-50 border-red-200"
                                      : "bg-green-50 border-green-200"
                                  }`}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: 0.4 + idx * 0.08,
                                  }}
                                  onClick={() =>
                                    setOpenCriteria((prev) => ({
                                      ...prev,
                                      [email.id]:
                                        prev[email.id] === cfg.key
                                          ? null
                                          : cfg.key,
                                    }))
                                  }
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span
                                      className={`text-sm font-medium ${
                                        active
                                          ? "text-red-700"
                                          : "text-green-700"
                                      }`}
                                    >
                                      {cfg.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <motion.div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                                          active
                                            ? "bg-red-500 text-white"
                                            : "bg-green-500 text-white"
                                        }`}
                                        whileHover={{ scale: 1.15 }}
                                      >
                                        {active ? "!" : "✓"}
                                      </motion.div>
                                      <motion.div
                                        animate={{
                                          rotate: opened ? 90 : 0,
                                        }}
                                        className="text-xs text-gray-500"
                                      >
                                        <FiChevronRight />
                                      </motion.div>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {opened && (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          height: 0,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          height: "auto",
                                        }}
                                        exit={{
                                          opacity: 0,
                                          height: 0,
                                        }}
                                        className="mt-2 text-xs text-gray-700 bg-white/70 rounded-lg p-2 border border-dashed border-gray-200"
                                      >
                                        {reason ||
                                          "AI không cung cấp giải thích chi tiết cho tiêu chí này."}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>

                        {/* Khuyến nghị */}
                        {emailResult.recommendations?.length > 0 && (
                          <motion.div
                            className="mt-6 relative z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-lg">
                              <FiAlertTriangle className="text-orange-500 text-xl" />
                              Khuyến nghị bảo mật:
                            </h4>
                            <ul className="space-y-2">
                              {emailResult.recommendations.map((r, i) => (
                                <motion.li
                                  key={i}
                                  className={`text-gray-700 flex items-start gap-3 p-2 rounded-lg ${
                                    finalRisk === "CRITICAL"
                                      ? "bg-red-100 text-red-800 font-semibold border border-red-300"
                                      : "bg-white/50 backdrop-blur-sm"
                                  }`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: 0.9 + i * 0.1,
                                  }}
                                >
                                  <span className="text-purple-500 font-bold mt-0.5">
                                    •
                                  </span>
                                  {r}
                                </motion.li>
                              ))}
                            </ul>

                            {finalRisk === "CRITICAL" && (
                              <div className="mt-4 p-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg">
                                ❌ NGUY HIỂM: Email chứa nội dung đe dọa nghiêm
                                trọng.{" "}
                                <span className="underline">
                                  HÃY XÓA EMAIL NÀY NGAY LẬP TỨC
                                </span>
                                .<br />
                                📢 Nếu cảm thấy bị đe dọa an toàn cá nhân, hãy
                                báo cáo với{" "}
                                <span className="underline">
                                  cơ quan chức năng có thẩm quyền
                                </span>
                                .
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* ACCORDION PHÂN TÍCH SÂU CỦA AI */}
                        {detailSections.length > 0 && (
                          <motion.div
                            className="mt-6 relative z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                          >
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-lg">
                              <FiBarChart2 className="text-blue-500 text-xl" />
                              Phân tích chi tiết của AI
                            </h4>

                            <div className="space-y-3">
                              {detailSections.map((sec) => {
                                const opened =
                                  currentOpenDetail === sec.key;
                                const badgeCls = sectionBadgeColor(sec.key);
                                return (
                                  <motion.div
                                    key={sec.key}
                                    className={`rounded-xl border p-3 bg-white/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-md`}
                                    whileHover={{ y: -2 }}
                                    onClick={() =>
                                      setOpenDetail((prev) => ({
                                        ...prev,
                                        [email.id]:
                                          prev[email.id] === sec.key
                                            ? null
                                            : sec.key,
                                      }))
                                    }
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${badgeCls}`}
                                        >
                                          {sec.title}
                                        </span>
                                      </div>
                                      <motion.div
                                        animate={{
                                          rotate: opened ? 90 : 0,
                                        }}
                                        className="text-gray-500 text-sm"
                                      >
                                        <FiChevronRight />
                                      </motion.div>
                                    </div>

                                    <AnimatePresence>
                                      {opened && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                          }}
                                          className="mt-2 text-sm text-gray-700 leading-relaxed"
                                        >
                                          {sec.text}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-gray-600 flex items-center gap-2">
              <FiClock className="text-purple-500" />
              Hiển thị {(currentPage - 1) * emailsPerPage + 1} -{" "}
              {Math.min(currentPage * emailsPerPage, allEmails.length)} của{" "}
              {allEmails.length} email
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                whileHover={{
                  scale: currentPage !== 1 ? 1.05 : 1,
                  x: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronLeft className="text-xl" />
                Trước
              </motion.button>

              {[...Array(totalPages)].map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    currentPage === idx + 1
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-2xl transform scale-105"
                      : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-lg"
                  }`}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {idx + 1}
                </motion.button>
              ))}

              <motion.button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                whileHover={{
                  scale: currentPage !== totalPages ? 1.05 : 1,
                  x: 2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                Sau
                <FiChevronRight className="text-xl" />
              </motion.button>
            </div>
          </motion.div>

          {nextPageToken && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                onClick={() => fetchEmails(nextPageToken)}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-700 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMail className="text-lg" />
                📄 Tải thêm email
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4"
            >
              <motion.div
                className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.h3
                className="text-xl font-bold text-gray-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Đang xử lý...
              </motion.h3>
              <motion.p
                className="text-gray-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Hệ thống AI đang phân tích email của bạn
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mt-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center gap-4 shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiAlertTriangle className="text-red-500 text-2xl flex-shrink-0" />
            </motion.div>
            <div>
              <h4 className="font-bold text-lg mb-1">Lỗi hệ thống</h4>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
