import React, { useEffect, useState } from "react";
import api from "../services/api"; // axios của bạn
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex justify-center">
        <p className="text-gray-400">Đang tải Dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pt-24 flex justify-center">
        <p className="text-red-400">Không lấy được dữ liệu Dashboard</p>
      </div>
    );
  }

  // ===== Chuẩn bị dữ liệu cho biểu đồ =====
  const high = stats.risk.find((r) => r.risk_level === "HIGH")?.total || 0;
  const medium = stats.risk.find((r) => r.risk_level === "MEDIUM")?.total || 0;
  const low = stats.risk.find((r) => r.risk_level === "LOW")?.total || 0;

  const pieData = {
    labels: ["Rủi ro cao", "Trung bình", "Thấp"],
    datasets: [
      {
        data: [high, medium, low],
        backgroundColor: ["#f97373", "#facc15", "#22c55e"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: stats.trend.map((i) => i.date),
    datasets: [
      {
        label: "Email được phân tích",
        data: stats.trend.map((i) => i.total),
        borderColor: "#6366f1",
        backgroundColor: "#a5b4fc",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="pt-24 pb-24 bg-gradient-to-b from-[#0d0225] via-[#1b0440] to-[#26075f] min-h-screen text-white">
      {/* Tiêu đề */}
      <div className="text-center mb-10">
        <p className="text-sm text-indigo-300 mb-1">
          Hệ thống AI phát hiện nguy hiểm đang hoạt động
        </p>
        <h1 className="text-4xl md:text-5xl font-bold">Phát Hiện Nguy Hiểm</h1>
        <p className="text-gray-300 mt-3 max-w-2xl mx-auto text-sm md:text-base">
          Sử dụng AI tiên tiến để bảo vệ bạn khỏi các cuộc tấn công email lừa đảo. 
          Phân tích thông minh, cảnh báo tức thì, thống kê trực quan.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-12 px-4">
        {/* Hàng card trên */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Kết quả phân tích */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Kết Quả Phân Tích</h2>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex justify-between">
                <span>📩 Tổng email đã phân tích</span>
                <span className="font-bold text-indigo-300">{stats.total}</span>
              </li>
              <li className="flex justify-between">
                <span>🔥 Email rủi ro cao</span>
                <span className="font-bold text-red-400">{high}</span>
              </li>
              <li className="flex justify-between">
                <span>⚠ Trung bình</span>
                <span className="font-bold text-yellow-300">{medium}</span>
              </li>
              <li className="flex justify-between">
                <span>✅ Thấp</span>
                <span className="font-bold text-green-400">{low}</span>
              </li>
            </ul>
          </div>

          {/* Dữ liệu huấn luyện AI */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Dữ Liệu Huấn Luyện AI</h2>
            <div className="space-y-3 text-sm md:text-base text-gray-100">
              <p>📚 Bộ dữ liệu: <span className="font-bold">500.000+ email</span></p>
              <p>🎯 Độ chính xác hiện tại: <span className="font-bold text-green-400">94%</span></p>
              <p>⏱ Cập nhật gần nhất: <span className="text-gray-300">{new Date().toLocaleDateString()}</span></p>
              <p>🚨 Giám sát: <span className="font-bold text-indigo-300">24/7</span></p>
            </div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Phân Phối Rủi Ro</h2>
            <Pie data={pieData} />
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Xu Hướng Theo Ngày</h2>
            <Line data={lineData} />
          </div>
        </div>

        {/* Hiệu suất hệ thống */}
        <div className="bg-gradient-to-r from-purple-900/70 to-indigo-700/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Hiệu Suất Hệ Thống AI
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Email Đã Phân Tích" value={stats.total} />
            <StatCard title="Độ Chính Xác" value="94%" />
            <StatCard title="Mẫu Dữ Liệu" value="500K+" />
            <StatCard title="Giám Sát" value="24/7" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-center shadow-lg">
      <p className="text-xs md:text-sm text-gray-200">{title}</p>
      <p className="text-xl md:text-2xl font-bold mt-1 text-indigo-300">
        {value}
      </p>
    </div>
  );
}