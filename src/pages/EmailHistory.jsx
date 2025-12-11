// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiAlertTriangle,
  FiMail,
  FiChevronRight,
  FiChevronLeft,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function EmailHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:3000/api/history/${user.id}`)
      .then((res) => {
        if (res.data.success) setHistory(res.data.history || []);
      })
      .catch((err) => console.error(err));
  }, [user]);

  const riskColor = {
    LOW: "bg-green-100 text-green-700 border border-green-300",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
    HIGH: "bg-orange-100 text-orange-700 border-orange-300",
    CRITICAL: "bg-red-100 text-red-700 border border-red-300",
  };

  // ======================= EXPORT PDF =======================
  const generatePDF = async () => {
    if (!selected) return;

    const pdfElement = document.getElementById("pdf-content");

    const canvas = await html2canvas(pdfElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`SecureMail_Report_${selected.id}.pdf`);
  };

  return (
    <div className="p-6 mt-20 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text drop-shadow-sm">
        📜 Lịch sử phân tích email
      </h1>

      {/* ======================= LIST ======================= */}
      <div className="space-y-4">
        {history.length === 0 && (
          <p className="text-gray-500 italic mt-10 text-center">
            Bạn chưa có lịch sử phân tích nào…
          </p>
        )}

        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="p-5 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiMail className="text-purple-600" />
                {item.email_content.substring(0, 60)}...
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${riskColor[item.risk_level]}`}
              >
                {item.risk_level}
              </span>
            </div>

            <p className="text-gray-500 text-sm mt-2">
              Điểm nguy cơ: <b>{item.score}</b> —{" "}
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ======================= MODAL ======================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl relative">

            {/* Close btn */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800"
            >
              <FiX />
            </button>

            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 text-red-600">
              <FiAlertTriangle /> Chi tiết phân tích email
            </h2>

            {(() => {
              let parsed = {};
              try {
                parsed = JSON.parse(selected.details_json || "{}");
              } catch {
                return (
                  <p className="text-red-600 font-semibold">
                    ⚠ Không thể đọc dữ liệu phân tích!
                  </p>
                );
              }

              return (
                <div
                  id="pdf-content"
                  className="space-y-5 max-h-[520px] overflow-y-auto pr-2"
                >

                  {/* ---- RISK INFO ---- */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white shadow-lg">
                    <p className="text-lg font-bold">
                      🔥 Mức độ nguy hiểm: {parsed.riskLevel}
                    </p>
                    <p className="mt-1 text-sm opacity-90">
                      Điểm số AI:{" "}
                      <span className="font-semibold text-white">
                        {parsed.score || parsed.confidence}
                      </span>
                    </p>
                  </div>

                  {/* ---- SOC CRITERIA ---- */}
                  <details className="bg-gray-50 p-5 rounded-xl border shadow-sm group">
                    <summary className="font-semibold text-lg cursor-pointer group-open:text-purple-600">
                      🎯 Tiêu chí SOC
                    </summary>

                    <div className="mt-3 space-y-3">
                      {Object.entries(parsed.criteria || {}).map(
                        ([key, val]) => (
                          <div key={key} className="border-b pb-3">
                            <p className="font-semibold capitalize flex items-center gap-2">
                              {key}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  val.status === "warning"
                                    ? "bg-red-200 text-red-700"
                                    : "bg-green-200 text-green-700"
                                }`}
                              >
                                {val.status}
                              </span>
                            </p>
                            <p className="text-gray-600 text-sm">{val.reason}</p>
                          </div>
                        )
                      )}
                    </div>
                  </details>

                  {/* ---- DEEP ANALYSIS ---- */}
                  <details className="bg-gray-50 p-5 rounded-xl border shadow-sm group">
                    <summary className="font-semibold text-lg cursor-pointer group-open:text-purple-600">
                      🧠 Phân tích chuyên sâu
                    </summary>

                    <div className="mt-3 space-y-3">
                      {Object.entries(parsed.analysis || {}).map(
                        ([key, val]) => (
                          <div key={key}>
                            <p className="font-semibold">{key}:</p>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {val}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </details>

                  {/* ---- FLAGS ---- */}
                  {parsed.behaviorFlags?.length > 0 && (
                    <details className="bg-gray-50 p-5 rounded-xl border shadow-sm group">
                      <summary className="font-semibold text-lg cursor-pointer group-open:text-purple-600">
                        🚩 Dấu hiệu hành vi
                      </summary>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {parsed.behaviorFlags.map((f, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold shadow-sm"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* ---- RECOMMENDATIONS ---- */}
                  <details className="bg-gray-50 p-5 rounded-xl border shadow-sm group">
                    <summary className="font-semibold text-lg cursor-pointer group-open:text-purple-600">
                      💡 Khuyến nghị xử lý
                    </summary>

                    <ul className="mt-3 list-disc pl-6 space-y-2 text-gray-700">
                      {(parsed.recommendations || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </details>

                  {/* ---- RAW JSON ---- */}
                  <details>
                    <summary className="cursor-pointer font-semibold text-purple-600">
                      📦 Xem JSON gốc
                    </summary>
                    <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-auto mt-3">
                      {JSON.stringify(parsed, null, 2)}
                    </pre>
                  </details>
                </div>
              );
            })()}

            {/* --- BUTTONS --- */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={generatePDF}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow transition"
              >
                📄 Xuất PDF
              </button>

              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold shadow transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
