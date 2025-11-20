import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { motion } from "framer-motion";
Chart.register(...registerables);

export default function Dashboard() {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  useEffect(() => {
    const ctx1 = chart1Ref.current.getContext("2d");
    const ctx2 = chart2Ref.current.getContext("2d");

    // Tạo gradients cho chart 1 (doughnut)
    const gradient1 = ctx1.createLinearGradient(0, 0, 400, 0);
    gradient1.addColorStop(0, "rgba(34, 197, 94, 0.8)");
    gradient1.addColorStop(0.5, "rgba(245, 158, 11, 0.8)");
    gradient1.addColorStop(1, "rgba(239, 68, 68, 0.8)");

    // Tạo gradients cho từng segment
    const gradients = [
      ctx1.createLinearGradient(0, 0, 200, 200),
      ctx1.createLinearGradient(0, 0, 200, 200),
      ctx1.createLinearGradient(0, 0, 200, 200)
    ];
    
    gradients[0].addColorStop(0, "#22c55e");
    gradients[0].addColorStop(1, "#16a34a");
    
    gradients[1].addColorStop(0, "#f59e0b");
    gradients[1].addColorStop(1, "#d97706");
    
    gradients[2].addColorStop(0, "#ef4444");
    gradients[2].addColorStop(1, "#dc2626");

    // Tạo gradient cho chart line với nhiều màu
    const lineGradient = ctx2.createLinearGradient(0, 0, 0, 400);
    lineGradient.addColorStop(0, "rgba(139, 92, 246, 0.6)");
    lineGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.4)");
    lineGradient.addColorStop(1, "rgba(79, 70, 229, 0.1)");

    const chart1 = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["🟢 Rủi ro thấp", "🟡 Trung bình", "🔴 Cao"],
        datasets: [
          {
            data: [60, 25, 15],
            backgroundColor: gradients,
            borderColor: [
              "rgba(255,255,255,0.8)",
              "rgba(255,255,255,0.8)",
              "rgba(255,255,255,0.8)"
            ],
            borderWidth: 4,
            hoverBorderWidth: 6,
            hoverBackgroundColor: [
              "rgba(34, 197, 94, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(239, 68, 68, 1)",
            ],
            hoverOffset: 15,
            borderRadius: 10,
            spacing: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { 
            display: true, 
            text: "📊 Phân Phối Rủi Ro", 
            color: "#1f2937",
            font: { 
              size: 20, 
              weight: "bold", 
              family: "'Inter', sans-serif" 
            },
            padding: { bottom: 20 }
          },
          legend: { 
            position: "bottom",
            labels: { 
              color: "#4b5563",
              font: { 
                size: 14, 
                family: "'Inter', sans-serif",
                weight: "600"
              },
              padding: 25,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            titleColor: "#f9fafb",
            bodyColor: "#f9fafb",
            cornerRadius: 12,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${value}%`;
              }
            }
          }
        },
        cutout: "70%",
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 2000,
          easing: 'easeOutQuart'
        },
      },
    });

    const chart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
        datasets: [
          {
            label: "📧 Email Lừa Đảo",
            data: [1500, 1800, 2100, 1900, 2400, 2800],
            fill: true,
            borderColor: "rgba(139, 92, 246, 1)",
            backgroundColor: lineGradient,
            pointBackgroundColor: "rgba(255,255,255,1)",
            pointBorderColor: "rgba(139, 92, 246, 1)",
            pointBorderWidth: 4,
            pointRadius: 8,
            pointHoverRadius: 12,
            pointHoverBackgroundColor: "rgba(255,255,255,1)",
            pointHoverBorderColor: "rgba(99, 102, 241, 1)",
            pointHoverBorderWidth: 4,
            tension: 0.4,
            borderWidth: 4,
            borderDash: [0, 0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { 
            display: true, 
            text: "📈 Xu Hướng Đe Dọa", 
            color: "#1f2937",
            font: { 
              size: 20, 
              weight: "bold", 
              family: "'Inter', sans-serif" 
            },
            padding: { bottom: 20 }
          },
          legend: { 
            position: "bottom",
            labels: { 
              color: "#4b5563",
              font: { 
                size: 14, 
                family: "'Inter', sans-serif",
                weight: "600"
              },
              padding: 25
            }
          },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            titleColor: "#f9fafb",
            bodyColor: "#f9fafb",
            cornerRadius: 12,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `Email lừa đảo: ${context.parsed.y} lượt`;
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { 
              display: false,
              color: "rgba(243,244,246,0.5)",
            },
            ticks: { 
              color: "#6b7280",
              font: { 
                family: "'Inter', sans-serif",
                size: 12,
                weight: "600"
              }
            }
          },
          y: { 
            beginAtZero: true,
            grid: { 
              color: "rgba(243,244,246,0.8)",
              borderDash: [5, 5],
              drawBorder: false,
            },
            ticks: { 
              color: "#6b7280",
              font: { 
                family: "'Inter', sans-serif",
                size: 12,
                weight: "600"
              },
              callback: function(value) {
                return value.toLocaleString() + '';
              }
            }
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      },
    });

    return () => {
      chart1.destroy();
      chart2.destroy();
    };
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 py-16 px-4"
    >
      {/* Chart 1: Phân phối rủi ro */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-3xl transition-all duration-500 group"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-yellow-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="h-80">
            <canvas ref={chart1Ref}></canvas>
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">60%</div>
              <div className="text-sm text-green-700 font-medium">Thấp</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">25%</div>
              <div className="text-sm text-yellow-700 font-medium">Trung bình</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-600">15%</div>
              <div className="text-sm text-red-700 font-medium">Cao</div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
      </motion.div>

      {/* Chart 2: Xu hướng đe dọa */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative bg-gradient-to-br from-white to-purple-50 p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-all duration-500 group"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="h-80">
            <canvas ref={chart2Ref}></canvas>
          </div>
          
          {/* Growth indicator */}
          <div className="flex items-center justify-between mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-200">
            <div className="text-sm text-purple-700 font-medium">
              📈 Tăng trưởng so với tháng trước
            </div>
            <div className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
              +16.7%
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
      </motion.div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="lg:col-span-2 bg-gradient-to-r from-slate-50 to-gray-100 p-6 rounded-2xl border border-gray-200 text-center"
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>🛡️ Hệ thống đang hoạt động ổn định</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300"></div>
            <span>📊 Dữ liệu được cập nhật theo thời gian thực</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-700"></div>
            <span>🎯 Độ chính xác phân tích: 99.8%</span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}