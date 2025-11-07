import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Các biến trạng thái
  const [step, setStep] = useState(1); // 1: gửi OTP, 2: xác minh OTP, 3: đổi mật khẩu
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  // 📨 Gửi mã OTP qua email người dùng
  const handleSendOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setMessage("✅ Mã OTP đã gửi tới email của bạn. Hãy kiểm tra hộp thư đến!");
      } else {
        setMessage(data.message || "❌ Không thể gửi OTP.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Lỗi kết nối server!");
    }
    setLoading(false);
  };

  // 🔐 Xác minh mã OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("⚠️ Vui lòng nhập mã OTP!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setStep(3);
        setMessage("✅ Mã OTP hợp lệ! Vui lòng nhập mật khẩu mới.");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Lỗi server khi xác minh OTP!");
    }
    setLoading(false);
  };

  // 🔁 Đổi mật khẩu mới
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword)
      return setMessage("⚠️ Vui lòng nhập đầy đủ mật khẩu mới!");
    if (newPassword !== confirmPassword)
      return setMessage("❌ Mật khẩu xác nhận không khớp!");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Đổi mật khẩu thành công!");
        setTimeout(() => setStep(1), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Lỗi server khi đổi mật khẩu!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-100 flex justify-center items-center p-6">
      <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg w-full max-w-md p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-indigo-800 text-center mb-6">
          Hồ sơ người dùng
        </h2>

        {/* Thông tin tài khoản */}
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-1">Tên đăng nhập:</p>
          <div className="bg-white/50 rounded-lg p-3 text-gray-900 border border-gray-200">
            {user.username || user.fullname || "Không xác định"}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-1">Email:</p>
          <div className="bg-white/50 rounded-lg p-3 text-gray-900 border border-gray-200">
            {user.email}
          </div>
        </div>

        <hr className="my-5 border-gray-300" />

        {/* 🔐 Đổi mật khẩu có OTP */}
        {step === 1 && (
          <div className="text-center">
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              {loading ? "Đang gửi mã..." : "Đổi mật khẩu 🔐"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <p className="text-gray-700 font-semibold mb-1">
              Nhập mã OTP đã gửi qua email:
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Mã gồm 4 số"
            />
            <div className="flex justify-between">
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                {loading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                }}
                className="text-gray-600 hover:underline px-3 py-2"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <p className="text-gray-700 font-semibold mb-1">Mật khẩu mới:</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <p className="text-gray-700 font-semibold mb-1">
              Xác nhận mật khẩu mới:
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              {loading ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
            </button>
          </div>
        )}

        {/* 📨 Thông báo */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700 bg-white/40 p-2 rounded-md">
            {message}
          </p>
        )}

        <hr className="my-5 border-gray-300" />

        {/* Nút điều hướng */}
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 mb-3 bg-indigo-500 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-600 hover:scale-[1.03] transition-transform"
        >
          Quay về Trang chủ
        </button>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 hover:scale-[1.03] transition-transform"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
