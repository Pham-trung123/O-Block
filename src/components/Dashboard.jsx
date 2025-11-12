import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard() {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  // 🧠 1️⃣ Lấy dữ liệu từ API khi tải trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("http://localhost:3000/api/stats/daily"),
          fetch("http://localhost:3000/api/stats/weekly"),
        ]);
        const daily = await dailyRes.json();
        const weekly = await weeklyRes.json();
        setDailyData(daily);
        setWeeklyData(weekly);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  // 🧩 2️⃣ Vẽ biểu đồ khi có dữ liệu
  useEffect(() => {
    if (!chart1Ref.current || !chart2Ref.current) return;

    const ctx1 = chart1Ref.current.getContext("2d");
    const ctx2 = chart2Ref.current.getContext("2d");

    // ==============================
    // 🟢 Biểu đồ 1: Phân bố rủi ro trong ngày
    // ==============================
    const low = dailyData.find((d) => d.risk_level === "Thấp")?.count || 0;
    const medium = dailyData.find((d) => d.risk_level === "Trung bình")?.count || 0;
    const high = dailyData.find((d) => d.risk_level === "Cao")?.count || 0;

    // ✅ Nếu chưa có dữ liệu thật → hiển thị dữ liệu mẫu
    const hasNoData = low === 0 && medium === 0 && high === 0;
    const chartData = hasNoData ? [60, 25, 15] : [low, medium, high];

    const chart1 = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["Rủi ro thấp", "Trung bình", "Cao"],
        datasets: [
          {
            data: chartData,
            backgroundColor: [
              "rgba(34,197,94,0.8)",   // Xanh
              "rgba(234,179,8,0.8)",   // Vàng
              "rgba(239,68,68,0.8)",   // Đỏ
            ],
            borderWidth: 1,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        plugins: {
          title: { 
            display: true, 
            text: "Phân Phối Mức Độ Cảnh Báo Trong Ngày", 
            color: "#111",
            font: { size: 16, weight: "bold" },
          },
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.chart._metasets[0].total;
                const value = context.raw;
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percent}%)`;
              },
            },
          },
        },
      },
    });

    // ==============================
    // 📈 Biểu đồ 2: Xu hướng email lừa đảo theo tuần
    // ==============================
    const weekLabels =
      weeklyData.length > 0
        ? weeklyData.map((item, index) => `Tuần ${item.week || index + 1}`)
        : Array.from({ length: 8 }, (_, i) => `Tuần ${i + 1}`); // Fallback khi chưa có dữ liệu

    const phishingCounts =
      weeklyData.length > 0
        ? weeklyData.map((item) => (item.phishing_count > 30 ? 30 : item.phishing_count))
        : [5, 10, 12, 18, 20, 25, 28, 30]; // Dữ liệu mẫu nếu chưa có

    const chart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: weekLabels,
        datasets: [
          {
            label: "Email Lừa Đảo ",
            data: phishingCounts,
            fill: true,
            borderColor: "rgba(79,70,229,1)",
            backgroundColor: "rgba(129,140,248,0.2)",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: "rgba(79,70,229,1)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Xu Hướng Đe Dọa Theo Tuần",
            color: "#111",
            font: { size: 16, weight: "bold" },
          },
          legend: { position: "bottom" },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Các Tuần Gần Đây",
              color: "#111",
              font: { size: 13 },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 30, // ✅ Giới hạn trục Y
            ticks: {
              stepSize: 5, // ✅ Hiển thị 5, 10, 15...
              color: "#333",
              font: { size: 12 },
            },
            title: {
              display: true,
              text: "Số lượng Email Lừa Đảo",
              color: "#111",
              font: { size: 13 },
            },
          },
        },
      },
    });

    // 🧹 Dọn biểu đồ khi re-render
    return () => {
      chart1.destroy();
      chart2.destroy();
    };
  }, [dailyData, weeklyData]);

  // 💄 3️⃣ Giao diện hiển thị
  return (
    <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 py-16">
      <div className="bg-white/90 p-6 rounded-2xl shadow">
        <canvas ref={chart1Ref}></canvas>
      </div>
      <div className="bg-white/90 p-6 rounded-2xl shadow">
        <canvas ref={chart2Ref}></canvas>
      </div>
    </section>
  );
}
