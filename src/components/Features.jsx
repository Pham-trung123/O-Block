export default function Features() {
  const features = [
    {
      title: "Phát Hiện Bằng AI",
      desc: "Hệ thống sử dụng AI phân tích nội dung email và cảnh báo người dùng khi phát hiện dấu hiệu lừa đảo.",
      icon: "🤖",
    },
    {
      title: "Cơ Sở Dữ Liệu Đe Dọa",
      desc: "Dữ liệu được cập nhật liên tục với các mẫu email lừa đảo, giúp phát hiện chính xác hơn.",
      icon: "🧠",
    },
    {
      title: "Phân Tích Thời Gian Thực",
      desc: "Theo dõi và phân tích email theo thời gian thực giúp người dùng phản ứng nhanh chóng.",
      icon: "📊",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto py-20 px-4">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent mb-4">
          Tính Năng Nổi Bật
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Công nghệ tiên tiến bảo vệ bạn khỏi các mối đe dọa trực tuyến
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:transform hover:-translate-y-2"
          >
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon Container */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto shadow-lg">
                {f.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-4 group-hover:text-purple-700 transition-colors duration-300">
                {f.title}
              </h3>
              
              <p className="text-gray-600 text-center leading-relaxed">
                {f.desc}
              </p>

              {/* Hover Line */}
              <div className="w-0 group-hover:w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-6 transition-all duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-6 py-4 border border-purple-100">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-gray-700 font-medium">
            Tất cả tính năng đều hoạt động 24/7 để bảo vệ bạn
          </span>
        </div>
      </div>
    </section>
  );
}