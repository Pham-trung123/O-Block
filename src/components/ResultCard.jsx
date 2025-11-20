import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function ResultCard() {
  const [score, setScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate score from 0 to 87
          let currentScore = 0;
          const interval = setInterval(() => {
            currentScore += 1;
            setScore(currentScore);
            if (currentScore >= 87) {
              clearInterval(interval);
            }
          }, 20);
        }
      },
      { threshold: 0.3 }
    );

    const card = document.querySelector('#result-card');
    if (card) observer.observe(card);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      id="result-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="relative bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-red-200 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Warning Pulse Effect */}
      <motion.div
        className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </motion.svg>
          </motion.div>
          <div>
            <motion.h3
              className="font-bold text-2xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Kết Quả Phân Tích
            </motion.h3>
            <motion.div
              className="flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm text-red-600 font-semibold">⚠️ Phát hiện đe dọa nghiêm trọng</span>
            </motion.div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {[
            {
              text: "Phân Tích Người Gửi:",
              detail: "Không liên kết ngân hàng hợp pháp",
              severity: "high"
            },
            {
              text: "Phân Tích Nội Dung:",
              detail: "Có dấu hiệu lừa đảo, yêu cầu cung cấp thông tin",
              severity: "high"
            },
            {
              text: "URL Đính Kèm:",
              detail: "Liên kết đáng ngờ đến trang web giả mạo",
              severity: "medium"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4 p-3 bg-white/60 rounded-xl border border-red-200/50 hover:border-red-300 transition-all duration-300 group/item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.severity === 'high' ? 'bg-red-100' : 'bg-orange-100'
                }`}
                whileHover={{ scale: 1.2 }}
              >
                <svg className={`w-3 h-3 ${item.severity === 'high' ? 'text-red-600' : 'text-orange-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <div>
                <span className="font-semibold text-gray-800">{item.text}</span>
                <span className="text-gray-700 ml-2">{item.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk Score */}
        <motion.div
          className="p-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-3">
            <motion.span
              className="font-bold text-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚨 RỦI RO CAO
            </motion.span>
            <motion.span
              className="font-black text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
            >
              {score}/100
            </motion.span>
          </div>
          <div className="w-full bg-red-400/50 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-white h-3 rounded-full shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: isVisible ? "87%" : "0%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-red-100">
            <span>An toàn</span>
            <span>Trung bình</span>
            <span>Nguy hiểm</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function TrainingData() {
  const [confidence, setConfidence] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate confidence from 0 to 94
          let currentConfidence = 0;
          const interval = setInterval(() => {
            currentConfidence += 1;
            setConfidence(currentConfidence);
            if (currentConfidence >= 94) {
              clearInterval(interval);
            }
          }, 15);
        }
      },
      { threshold: 0.3 }
    );

    const card = document.querySelector('#training-card');
    if (card) observer.observe(card);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      id="training-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-200 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-6 right-6 text-2xl opacity-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        📊
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </motion.svg>
          </motion.div>
          <div>
            <motion.h3
              className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Dữ Liệu Huấn Luyện AI
            </motion.h3>
            <motion.div
              className="flex items-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm text-green-600 font-semibold">✅ Mô hình đã được huấn luyện tối ưu</span>
            </motion.div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <motion.div
            className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 group/item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ x: 5 }}
          >
            <motion.div
              className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4m4 8v4m-4-4v4" />
              </svg>
            </motion.div>
            <div>
              <p className="text-gray-700">
                Mô hình được huấn luyện trên hơn <span className="font-bold text-green-700">500.000 email</span> lừa đảo và hợp pháp
              </p>
            </div>
          </motion.div>

          {/* Confidence Score */}
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <motion.span
                className="font-semibold"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎯 Độ tin cậy mô hình
              </motion.span>
              <motion.span
                className="font-black text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
              >
                {confidence}%
              </motion.span>
            </div>
            <div className="w-full bg-green-400 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-white h-3 rounded-full shadow-lg"
                initial={{ width: "0%" }}
                animate={{ width: isVisible ? "94%" : "0%" }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2 text-green-100">
              <span>Cơ bản</span>
              <span>Khá</span>
              <span>Xuất sắc</span>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-white/50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.svg
              className="w-5 h-5 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </motion.svg>
            <span>Dữ liệu được cập nhật tự động hàng tuần</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}