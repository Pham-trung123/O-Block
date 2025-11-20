import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiArrowLeft, FiLogOut, FiShield, FiCheckCircle } from "react-icons/fi";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex justify-center items-center p-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiUser className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Hồ sơ người dùng</h2>
              <p className="text-blue-100 text-sm">Quản lý thông tin tài khoản</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Thông tin tài khoản */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUser className="text-purple-600 text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tên đăng nhập</p>
                <p className="font-semibold text-gray-800">
                  {user.username || user.fullname || "Không xác định"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>
            </div>
          </div>

          {/* 🔐 Đổi mật khẩu có OTP */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiShield className="text-purple-500" />
              Bảo mật tài khoản
            </h3>

            {step === 1 && (
              <div className="text-center">
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi mã...
                    </>
                  ) : (
                    <>
                      <FiLock className="text-lg" />
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập mã OTP đã gửi qua email:
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mã gồm 4 số"
                    maxLength={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xác minh...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-lg" />
                        Xác minh OTP
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setMessage("");
                    }}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang đổi...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="text-lg" />
                      Xác nhận đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 📨 Thông báo */}
            {message && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                message.includes("✅") || message.includes("thành công")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : message.includes("⚠️") 
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Nút điều hướng */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gray-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <FiArrowLeft className="text-lg" />
              Quay về Trang chủ
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <FiLogOut className="text-lg" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}