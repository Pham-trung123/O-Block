import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard() {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || 0;

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch(`http://localhost:3000/api/stats/daily/${userId}`),
          fetch(`http://localhost:3000/api/stats/weekly/${userId}`)
        ]);

        const daily = await dailyRes.json();
        const weekly = await weeklyRes.json();

        setDailyData(daily);
        setWeeklyData(weekly);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu biểu đồ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  useEffect(() => {
    if (loading) return;

    // 🔹 Chart 1: Biểu đồ tròn - phân phối rủi ro trong ngày
    const ctx1 = chart1Ref.current.getContext("2d");

    // Lấy dữ liệu risk_level (low, medium, high)
    const low = dailyData.find(d => d.risk_level === "low")?.count || 0;
    const medium = dailyData.find(d => d.risk_level === "medium")?.count || 0;
    const high = dailyData.find(d => d.risk_level === "high")?.count || 0;

    // Nếu không có dữ liệu -> dùng dữ liệu giả mẫu
    const hasNoData = low === 0 && medium === 0 && high === 0;
    const dailyChartData = hasNoData ? [60, 25, 15] : [low, medium, high];

    const chart1 = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["Rủi ro thấp", "Trung bình", "Cao"],
        datasets: [
          {
            data: dailyChartData,
            backgroundColor: [
              "rgba(34,197,94,0.8)",   // xanh lá
              "rgba(234,179,8,0.8)",   // vàng
              "rgba(239,68,68,0.8)",   // đỏ
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

    // 🔹 Chart 2: Biểu đồ line - xu hướng đe dọa theo tuần
    const ctx2 = chart2Ref.current.getContext("2d");

    // Chuẩn hóa dữ liệu tuần
    const labels =
      weeklyData.length > 0
        ? weeklyData.map((d) => `Tuần ${d.week}`)
        : ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6", "Tuần 7", "Tuần 8"];
    const dataPoints =
      weeklyData.length > 0 ? weeklyData.map((d) => d.phishing_count) : [5, 10, 20, 30, 40, 50, 60, 70];

    const chart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Email Lừa Đảo ",
            data: dataPoints,
            fill: true,
            borderColor: "rgba(79,70,229,1)", // xanh tím
            backgroundColor: "rgba(129,140,248,0.2)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
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
          y: {
            beginAtZero: true,
            suggestedMax: 30,
            ticks: {
              stepSize: 5,
              callback: (value) => value,
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    // Dọn biểu đồ cũ khi re-render
    return () => {
      chart1.destroy();
      chart2.destroy();
    };
  }, [dailyData, weeklyData, loading]);

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
