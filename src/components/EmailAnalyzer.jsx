import React, { useState } from "react";

export default function EmailAnalyzer() {
  const [tab, setTab] = useState("text");
  const [input, setInput] = useState("");

  return (
    <section className="max-w-4xl mx-auto mt-12 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">✉️ Trình Phân Tích Email Lừa Đảo</h2>
      <div className="flex space-x-4 border-b mb-4">
        {["Nhập Văn Bản", "Tải Tệp Lên", "Phân Tích URL"].map((name, idx) => (
          <button
            key={idx}
            onClick={() => setTab(name)}
            className={`pb-2 text-sm font-semibold ${
              tab === name ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Nhập nội dung email đáng ngờ..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
        Phân Tích Email
      </button>
    </section>
  );
}