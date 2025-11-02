export default function Stats() {
  const stats = [
    { label: "Email Đã Phân Tích", value: "2.5M+" },
    { label: "Độ Chính Xác", value: "98.7%" },
    { label: "Mẫu Đe Dọa", value: "47K+" },
    { label: "Giám Sát Thời Gian Thực", value: "24/7" },
  ];

  return (
    <section className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-6 backdrop-blur-md shadow">
            <div className="text-3xl font-bold mb-2">{s.value}</div>
            <p className="opacity-90">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
