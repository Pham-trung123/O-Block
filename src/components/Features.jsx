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
    <section className="max-w-6xl mx-auto py-16">
      <h2 className="text-center text-2xl font-bold text-indigo-700 mb-10">
        Các Tính Năng Nổi Bật
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white/90 p-6 rounded-2xl shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg text-indigo-700">{f.title}</h3>
            <p className="text-gray-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
