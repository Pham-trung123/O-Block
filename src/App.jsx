// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import Profile from "./pages/Profile"; // ✅ Thêm trang Hồ sơ cá nhân
import Navbar from "./components/Navbar"; // ✅ Thêm Navbar
import { AuthProvider } from "./context/AuthContext"; // ✅ Bọc AuthContext

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
      </Router>
    </AuthProvider>
  );
}
