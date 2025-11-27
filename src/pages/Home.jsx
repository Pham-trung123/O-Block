import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EmailAnalyzer from "../components/EmailAnalyzer";
import { ResultCard, TrainingData } from "../components/ResultCard";
import Dashboard from "../components/Dashboard";
import Features from "../components/Features";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function Home() {
  const [currentView, setCurrentView] = useState('home');

  // Hiệu ứng chuyển trang
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: [0.25, 0.46, 0.45, 0.94],
    duration: 0.4
  };

  // Render các view khác nhau (KHÔNG XOÁ LOGIC)
  const renderCurrentView = (view) => {
    switch(view) {
      case 'home':
        return (
          <div className="space-y-20 mt-8">
            <EmailAnalyzer />
            <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
              <ResultCard />
              <TrainingData />
            </section>
            <Dashboard />
            <Features />
            <Stats />
          </div>
        );

      case 'analyzer':
        return (
          <div className="mt-8">
            <EmailAnalyzer />
          </div>
        );

      case 'dashboard':
        return (
          <div className="mt-8">
            <Dashboard />
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200/60">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  U
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
                    Hồ sơ người dùng
                  </h2>
                  <p className="text-gray-600 mt-1">user@example.com</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Thông tin cá nhân</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Tên:</span> Người dùng</p>
                    <p><span className="font-medium">Email:</span> user@example.com</p>
                    <p><span className="font-medium">Tham gia:</span> 01/01/2024</p>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Thống kê hoạt động</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Email đã phân tích:</span> 127</p>
                    <p><span className="font-medium">Rủi ro phát hiện:</span> 23</p>
                    <p><span className="font-medium">Độ tin cậy:</span> 96%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-20 mt-8">
            <EmailAnalyzer />
            <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
              <ResultCard />
              <TrainingData />
            </section>
            <Dashboard />
            <Features />
            <Stats />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Navbar onViewChange={setCurrentView} currentView={currentView} />
      <Hero />

      {/* ❌ XOÁ HOÀN TOÀN Navigation Tabs  */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderCurrentView(currentView)}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
