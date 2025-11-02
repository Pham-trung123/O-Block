import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard() {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  useEffect(() => {
    const ctx1 = chart1Ref.current.getContext("2d");
    const ctx2 = chart2Ref.current.getContext("2d");

    const chart1 = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["Rủi ro thấp", "Trung bình", "Cao"],
        datasets: [
          {
            data: [60, 25, 15],
            backgroundColor: [
              "rgba(34,197,94,0.8)",
              "rgba(234,179,8,0.8)",
              "rgba(239,68,68,0.8)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: { display: true, text: "Phân Phối Rủi Ro", color: "#111" },
          legend: { position: "bottom" },
        },
      },
    });

    const chart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
        datasets: [
          {
            label: "Email Lừa Đảo",
            data: [1500, 1800, 2100, 1900, 2400, 2800],
            fill: true,
            borderColor: "rgba(79,70,229,1)",
            backgroundColor: "rgba(129,140,248,0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: {
          title: { display: true, text: "Xu Hướng Đe Dọa", color: "#111" },
          legend: { position: "bottom" },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });

    return () => {
      chart1.destroy();
      chart2.destroy();
    };
  }, []);

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
