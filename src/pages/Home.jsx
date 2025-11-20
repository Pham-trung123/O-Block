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

  // Render các view khác nhau
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
      
      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <Navigation onViewChange={setCurrentView} currentView={currentView} />
        </div>
      </div>

      {/* Main Content với chuyển cảnh */}
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

// Component Navigation mới cho Navbar
export const Navigation = ({ onViewChange, currentView }) => {
  const navItems = [
    { key: 'home', label: 'Trang chủ', icon: '🏠' },
    { key: 'analyzer', label: 'Phân tích Email', icon: '📧' },
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'profile', label: 'Hồ sơ', icon: '👤' },
  ];

  return (
    <nav className="flex space-x-1 py-4">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onViewChange(item.key)}
          className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-medium group ${
            currentView === item.key 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25' 
              : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md border border-transparent hover:border-purple-200'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
          
          {/* Active indicator */}
          {currentView === item.key && (
            <motion.div 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
          
          {/* Hover effect */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
            currentView === item.key ? 'group-hover:opacity-10' : ''
          }`} />
        </button>
      ))}
    </nav>
  );
};