// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="pt-16">
          <AnimatedRoutes />
        </div>

        {/* THÊM CÁC WIDGET Ở ĐÂY - sẽ hiển thị trên tất cả các trang */}
        <ChatBox />
        <ZaloWidget />
        <MessengerWidget /> {/* THÊM DÒNG NÀY */}
      </Router>
    </AuthProvider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{
          duration: 0.45,
          ease: "easeInOut"
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analyze" element={<EmailAnalyzer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<AuthPage />} />  
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
