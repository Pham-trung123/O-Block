export default function Stats() {
  const stats = [
    { 
      label: "Email Đã Phân Tích", 
      value: "2.5M+",
      icon: "📧",
      description: "Tổng số email đã được xử lý",
      trend: "+12%",
      color: "from-cyan-400 to-blue-500"
    },
    { 
      label: "Độ Chính Xác", 
      value: "98.7%",
      icon: "🎯",
      description: "Tỷ lệ phát hiện chính xác",
      trend: "+2.3%",
      color: "from-green-400 to-emerald-500"
    },
    { 
      label: "Mẫu Đe Dọa", 
      value: "47K+",
      icon: "🛡️",
      description: "Mẫu lừa đảo trong cơ sở dữ liệu",
      trend: "+8%",
      color: "from-orange-400 to-red-500"
    },
    { 
      label: "Giám Sát", 
      value: "24/7",
      icon: "⚡",
      description: "Theo dõi liên tục",
      trend: "100%",
      color: "from-purple-400 to-pink-500"
    },
    { 
      label: "Phản Hồi", 
      value: "99.2%",
      icon: "🚀",
      description: "Tốc độ xử lý tức thì",
      trend: "+15ms",
      color: "from-yellow-400 to-amber-500"
    },
    { 
      label: "Tiết Kiệm", 
      value: "3.2K+",
      icon: "💰",
      description: "Giờ làm việc được tiết kiệm",
      trend: "+320h",
      color: "from-lime-400 to-green-500"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 overflow-hidden">
      {/* Geometric Background Patterns */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        <div className="absolute top-20 -left-32 w-64 h-64 bg-cyan-400 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-32 w-64 h-64 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-15 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-4 tracking-tight">
            HIỆU SUẤT
            <span className="block text-2xl md:text-3xl font-light mt-1">HỆ THỐNG AI</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Khám phá sức mạnh <span className="text-cyan-300 font-medium">AI</span> qua các chỉ số ấn tượng
          </p>
        </div>

        {/* Main Featured Card - Smaller */}
        <div className="mb-10">
          <div className="group relative bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-500 hover:transform hover:-translate-y-1">
            <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto md:mx-0 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                  🤖
                </div>
              </div>
              
              <div className="md:col-span-2 text-center md:text-left">
                <div className="text-5xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                  2.5M+
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Email Đã Phân Tích</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Hệ thống AI đã xử lý thành công hơn 2.5 triệu email với độ chính xác vượt trội
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30">
                    📈 +12%
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                    ⚡ Real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 3x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {stats.slice(1).map((stat, index) => (
            <div 
              key={index}
              className="group relative bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10 hover:border-cyan-400/20 transition-all duration-400 hover:transform hover:-translate-y-1"
            >
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-lg mb-3 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-md`}>
                  {stat.icon}
                </div>

                {/* Value with Trend */}
                <div className="flex items-end justify-between mb-2">
                  <div className="text-2xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded-full">
                    {stat.trend}
                  </span>
                </div>

                {/* Label */}
                <h3 className="text-base font-semibold text-white mb-1">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {stat.description}
                </p>

                {/* Progress Bar Effect */}
                <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mt-3 transition-all duration-500 delay-100" />
              </div>

              {/* Corner Accents */}
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150"></div>
            </div>
          ))}
        </div>

        {/* Bottom Real-time Indicator - Smaller */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-xl px-6 py-3 border border-cyan-400/20 hover:border-purple-400/30 transition-all duration-400 group">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse delay-400"></div>
            </div>
            <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
              Live Analytics Active
            </span>
          </div>
        </div>
      </div>

      {/* Custom CSS for Floating Animation */}
      <style >{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}