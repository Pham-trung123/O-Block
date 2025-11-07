import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleVerify = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: verifyInput }),
      });
      const data = await response.json();
      if (data.success) {
        setShowPassword(true);
        setVerifyMode(false);
        setError("");
      } else {
        setError("❌ Mật khẩu không đúng!");
      }
    } catch {
      setError("⚠️ Lỗi kết nối server!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-100 flex justify-center items-center p-6">
      <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-md p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-indigo-800 text-center mb-6">
          Hồ sơ người dùng
        </h2>

        {/* Username */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-1">Tên đăng nhập:</p>
          <div className="bg-white/50 rounded-lg p-3 text-gray-900 border border-gray-200">
            {user.username || user.fullname || "Không xác định"}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-1">Email:</p>
          <div className="bg-white/50 rounded-lg p-3 text-gray-900 border border-gray-200">
            {user.email}
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-1">Mật khẩu:</p>
          <div className="bg-white/50 rounded-lg p-3 text-gray-900 border border-gray-200">
            {showPassword ? user.password : "••••••••••"}
          </div>

          {!verifyMode && (
            <button
              onClick={() => setVerifyMode(true)}
              className="mt-2 text-sm text-indigo-700 hover:underline"
            >
              🔐 Xem mật khẩu
            </button>
          )}

          {verifyMode && (
            <div className="mt-3">
              <input
                type="password"
                placeholder="Nhập lại mật khẩu để xác minh"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <div className="flex justify-between">
                <button
                  onClick={handleVerify}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Xác minh
                </button>
                <button
                  onClick={() => {
                    setVerifyMode(false);
                    setVerifyInput("");
                    setError("");
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Hủy
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          )}
        </div>

        {/* 🏠 Nút quay về Home */}
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 mb-3 bg-indigo-500 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-600 hover:scale-[1.03] transition-transform"
        >
           Quay về Trang chủ
        </button>

        {/* 🔴 Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 hover:scale-[1.03] transition-transform hover:brightness-110"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
