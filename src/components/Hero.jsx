import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Hero() {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const phishingWords = ["Lừa Đảo", "Giả Mạo", "Độc Hại", "Nguy Hiểm"];
  const stats = [
    { value: "99.8%", label: "Độ chính xác" },
    { value: "2.5M+", label: "Email đã phân tích" },
    { value: "24/7", label: "Giám sát" },
    { value: "47K+", label: "Mẫu đe dọa" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % phishingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTryAnalysis = () => {
    navigate('/analyze');
  };

  const floatingShapes = [
    { top: '20%', left: '10%', delay: 0, color: 'purple' },
    { top: '60%', left: '85%', delay: 1, color: 'cyan' },
    { top: '30%', left: '80%', delay: 2, color: 'blue' },
    { top: '70%', left: '15%', delay: 1.5, color: 'pink' },
  ];

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Main background gradients */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3)_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(56,189,248,0.3)_0%,transparent_50%)]"></div>
        </div>

        {/* Floating animated shapes */}
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className={`absolute w-6 h-6 rounded-full bg-${shape.color}-400/30 backdrop-blur-sm`}
            style={{
              top: shape.top,
              left: shape.left,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Pulsing orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-8 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
          />
          <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
            🛡️ Hệ thống bảo vệ thời gian thực đang hoạt động
          </span>
        </motion.div>

        {/* Main heading with typing animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200 block">
              Phát Hiện
            </span>
            <motion.span
              key={currentWordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 block mt-2"
            >
              {phishingWords[currentWordIndex]}
            </motion.span>
          </h1>
        </motion.div>

        {/* Animated description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-xl md:text-2xl text-white/80 mb-6 leading-relaxed max-w-4xl mx-auto font-light">
            Sử dụng <span className="font-bold text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded-lg">AI tiên tiến</span> để bảo vệ bạn khỏi 
            <motion.span
              animate={{ color: ['#f472b6', '#60a5fa', '#f472b6'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="font-semibold mx-1"
            >
              các cuộc tấn công tinh vi
            </motion.span>
            . Phân tích thông minh, cảnh báo tức thì.
          </p>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group cursor-pointer"
            >
              <motion.div
                className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs md:text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.button
            onClick={handleTryAnalysis}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transform transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 flex items-center gap-3 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100"
              whileHover={{ x: ['0%', '100%'] }}
              transition={{ duration: 0.8 }}
            />
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚀
            </motion.span>
            <span className="relative">Bắt Đầu Phân Tích Ngay</span>
            <motion.svg
              className="w-6 h-6 relative"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-bold text-lg hover:border-cyan-400/50 transition-all duration-300 flex items-center gap-3 group"
          >
            <span>📚</span>
            <span>Tìm Hiểu Thêm</span>
          </motion.button>
        </motion.div>

        {/* Security badge with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex justify-center items-center gap-4 text-sm text-white/60"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
            </div>
          </motion.div>
          <span className="font-medium">
            🔒 Bảo mật tuyệt đối • ⚡ Xử lý nhanh chóng • 🎯 Độ chính xác cao
          </span>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent"></div>

      {/* Scanning line effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </section>
  );
}