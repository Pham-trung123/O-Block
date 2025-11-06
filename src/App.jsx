// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import { AuthProvider } from "./context/AuthContext"; // ✅ import thêm dòng này

export default function App() {
  return (
  
    <AuthProvider> {/* ✅ Bọc toàn bộ Router trong AuthProvider */}
      <Router>
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