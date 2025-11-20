import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin, FiShield, FiArrowRight, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const floatingShapes = [
    { top: '10%', left: '5%', delay: 0, size: 'w-4 h-4', color: 'purple' },
    { top: '20%', left: '90%', delay: 1, size: 'w-6 h-6', color: 'blue' },
    { top: '60%', left: '3%', delay: 2, size: 'w-3 h-3', color: 'cyan' },
    { top: '80%', left: '95%', delay: 1.5, size: 'w-5 h-5', color: 'pink' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-300 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Main background decorations */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.15, 0.1, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Floating animated shapes */}
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className={`absolute ${shape.size} bg-${shape.color}-400/20 rounded-full backdrop-blur-sm`}
            style={{
              top: shape.top,
              left: shape.left,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-4 md:grid-cols-2 gap-12 px-6 py-20">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <motion.div 
            className="flex items-center gap-3 mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FiShield className="text-white text-xl" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                SecureMail
              </h3>
              <motion.div 
                className="flex items-center gap-1 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Đang hoạt động</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 leading-relaxed text-sm mb-8"
          >
            Phát hiện email lừa đảo tiên tiến nhờ AI. Bảo vệ tổ chức và cá nhân khỏi
            các cuộc tấn công mạng với độ chính xác <span className="text-cyan-300 font-semibold">99.8%</span>.
          </motion.p>

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <FiHeart className="text-pink-400 text-sm" />
            <span className="text-xs text-gray-400 group-hover:text-white">Được tin dùng bởi 150K+ người</span>
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
            <motion.div 
              className="w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"
              whileHover={{ scaleY: 1.5 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            Liên Kết Nhanh
          </h3>
          <ul className="space-y-4">
            {[
              { name: 'Trang chủ', path: '/', icon: '🏠' },
              { name: 'Trình Kiểm Tra Email', path: '/analyze', icon: '🔍' },
              { name: 'Cơ Sở Dữ Liệu Đe Dọa', external: '#', icon: '📊' },
              { name: 'Tài Liệu API', external: '#', icon: '📚' }
            ].map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <button 
                  onClick={() => item.external ? handleExternalLink(item.external) : handleNavigation(item.path)}
                  className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3 group text-sm w-full text-left"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 group-hover:font-medium">{item.name}</span>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-purple-400"
                  >
                    <FiArrowRight className="text-sm" />
                  </motion.div>
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
            <motion.div 
              className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"
              whileHover={{ scaleY: 1.5 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            Tài Nguyên
          </h3>
          <ul className="space-y-4">
            {[
              { name: 'Ví Dụ Lừa Đảo', icon: '🎭' },
              { name: 'Blog Bảo Mật', icon: '📝' },
              { name: 'Tài Liệu Nghiên Cứu', icon: '🔬' },
              { name: 'Hướng Dẫn Sử Dụng', icon: '🎓' }
            ].map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <button 
                  onClick={() => handleExternalLink('#')}
                  className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3 group text-sm w-full text-left"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 group-hover:font-medium">{item.name}</span>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-cyan-400"
                  >
                    <FiArrowRight className="text-sm" />
                  </motion.div>
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
            <motion.div 
              className="w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full"
              whileHover={{ scaleY: 1.5 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            Liên Hệ
          </h3>
          <div className="space-y-6 text-sm">
            {[
              { 
                icon: FiMail, 
                title: 'Email', 
                detail: 'support@securemail.com',
                color: 'from-purple-500/20 to-pink-500/20',
                iconColor: 'text-purple-400'
              },
              { 
                icon: FiPhone, 
                title: 'Điện thoại', 
                detail: '+84 123 456 789',
                color: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-400'
              },
              { 
                icon: FiMapPin, 
                title: 'Địa chỉ', 
                detail: 'TP. Hồ Chí Minh, Việt Nam',
                color: 'from-cyan-500/20 to-green-500/20',
                iconColor: 'text-cyan-400'
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 group cursor-pointer"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div 
                  className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <contact.icon className={`text-lg ${contact.iconColor}`} />
                </motion.div>
                <div className="text-left">
                  <div className="font-medium text-gray-400 group-hover:text-white transition-colors">
                    {contact.title}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    {contact.detail}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Social Links */}
            <motion.div 
              className="flex gap-3 mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: FiFacebook, color: 'hover:bg-blue-500/20 hover:border-blue-400/50', label: 'Facebook' },
                { icon: FiTwitter, color: 'hover:bg-cyan-500/20 hover:border-cyan-400/50', label: 'Twitter' },
                { icon: FiLinkedin, color: 'hover:bg-blue-600/20 hover:border-blue-500/50', label: 'LinkedIn' }
              ].map((social, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleExternalLink('#')}
                  className={`w-12 h-12 bg-white/5 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/10 transition-all duration-300 ${social.color} text-gray-400 hover:text-white`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="text-lg" />
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div 
        className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div 
            className="text-center md:text-left text-sm text-gray-500 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span>© 2025</span>
            <span className="text-gray-400 font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SecureMail
            </span>
            <span>. Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiHeart className="text-pink-400 inline mx-1" />
            </motion.div>
            <span>in Vietnam</span>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-6 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {['Chính Sách Bảo Mật', 'Điều Khoản Dịch Vụ', 'Cookie'].map((item, index) => (
              <motion.button 
                key={index}
                onClick={() => handleExternalLink('#')}
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300 text-xs relative group"
                whileHover={{ y: -1 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
    </footer>
  );
}