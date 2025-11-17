// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ChatBox from './components/ChatBox'; 

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Thanh điều hướng hiển thị trên mọi trang */}
        <Navbar />

        {/* Khu vực nội dung các trang */}
        <div className="pt-16"> {/* Tạo khoảng trống dưới Navbar cố định */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/analyze" element={<EmailAnalyzer />} />
            <Route path="/profile" element={<Profile />} /> {/* ✅ Hồ sơ người dùng */}
          </Routes>
        </div>

        {/* THÊM CHATBOX Ở ĐÂY - sẽ hiển thị trên tất cả các trang */}
        <ChatBox />
      </Router>
    </AuthProvider>
  );
}