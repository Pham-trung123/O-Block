import { useState } from "react";
import { motion } from "framer-motion";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      
      <div className="relative w-[900px] h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">

        {/* ===========================
            GRADIENT PANEL TRƯỢT
        ============================ */}
        <motion.div
          className="absolute top-0 left-0 w-1/2 h-full z-30 rounded-3xl"
          initial={false}
          animate={{ x: isLogin ? 0 : 450 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-3xl" />
          
          {/* Animated Background Decorations */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400 rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-12">

            {isLogin ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Chào mừng trở lại!
                </h1>
                <p className="text-blue-100 mt-3 text-lg">Tiếp tục bảo vệ email của bạn</p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="mt-8 px-8 py-3 border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  Tạo tài khoản mới
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Bắt đầu ngay!
                </h1>
                <p className="text-blue-100 mt-3 text-lg">Tham gia cộng đồng bảo mật</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="mt-8 px-8 py-3 border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  Đã có tài khoản?
                </button>
              </motion.div>
            )}

          </div>
        </motion.div>

        {/* ===========================
            PANEL TRẮNG TRƯỢT THEO
        ============================ */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full flex"
          initial={false}
          animate={{ x: isLogin ? 0 : -450 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* FORM LOGIN */}
          <motion.div
            className="w-1/2 p-12"
            animate={{ opacity: isLogin ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-full flex flex-col justify-center">
              <Login isPopup />
            </div>
          </motion.div>

          {/* FORM REGISTER */}
          <motion.div
            className="w-1/2 p-12"
            animate={{ opacity: isLogin ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-full flex flex-col justify-center">
              <Register isPopup />
            </div>
          </motion.div>
        </motion.div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-400/50 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400/50 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400/50 rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-400/50 rounded-br-3xl"></div>
      </div>
    </div>
  );
}