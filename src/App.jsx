// App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import { AuthProvider } from "./context/AuthContext";
import ChatBox from "./components/ChatBox"; // ✅ Thêm import ChatBox

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ✅ ChatBox được đặt ở đây để hiển thị trên mọi trang */}
        <ChatBox />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analyze" element={<EmailAnalyzer />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
