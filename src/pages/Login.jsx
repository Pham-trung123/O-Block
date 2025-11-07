import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1=login, 2=OTP, 3=reset password
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // 🧠 Xử lý đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!email) newErrors.email = "Vui lòng nhập email!";
    else if (!emailRegex.test(email))
      newErrors.email = "Email không hợp lệ! Chỉ hỗ trợ Gmail.";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      } else {
        setErrors({ general: data.message || "Sai thông tin đăng nhập!" });
      }
    } catch (err) {
      console.error("💥 Lỗi khi kết nối server:", err);
      setErrors({ general: "⚠️ Không thể kết nối đến server!" });
    } finally {
      setLoading(false);
    }
  };

  // ✉️ Gửi OTP
  const handleSendOtp = async () => {
    if (!email) return setMessage("⚠️ Vui lòng nhập email trước!");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Mã OTP đã gửi đến email của bạn!");
        setStep(2);
      } else setMessage(data.message);
    } catch {
      setMessage("⚠️ Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Xác minh OTP
  const handleVerifyOtp = async () => {
    if (!otp) return setMessage("⚠️ Vui lòng nhập mã OTP!");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setStep(3);
        setMessage("✅ OTP chính xác! Hãy nhập mật khẩu mới.");
      } else setMessage(data.message);
    } catch {
      setMessage("⚠️ Lỗi xác minh OTP!");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Đặt lại mật khẩu
  const handleResetPassword = async () => {
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
        setMessage("✅ Đổi mật khẩu thành công! Hãy đăng nhập lại.");
        setTimeout(() => setStep(1), 2000);
      } else setMessage(data.message);
    } catch {
      setMessage("⚠️ Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Đánh giá độ mạnh mật khẩu
  const checkStrength = (password) => {
    const lengthOK = password.length >= 8;
    const upperOK = /[A-Z]/.test(password);
    const numberOK = /[0-9]/.test(password);
    const specialOK = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passed = [lengthOK, upperOK, numberOK, specialOK].filter(Boolean).length;

    let strength = "";
    let color = "";
    if (passed === 4) {
      strength = "Mạnh 💪";
      color = "bg-green-500";
    } else if (passed === 3) {
      strength = "Trung bình ⚡";
      color = "bg-yellow-400";
    } else if (passed === 2) {
      strength = "Yếu ⚠️";
      color = "bg-orange-400";
    } else {
      strength = "Rất yếu ❌";
      color = "bg-red-500";
    }

    return { strength, color, passed };
  };

  const { strength, color } = checkStrength(newPassword);

  // ---------------------------
  // ⚙️ Các form giao diện
  // ---------------------------

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-200">
          Email
        </label>
        <input
          type="email"
          placeholder="Nhập email (chỉ hỗ trợ Gmail)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full bg-white/20 border ${
            errors.email ? "border-red-400" : "border-gray-300/30"
          } rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none`}
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-200">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-white/20 border ${
              errors.password ? "border-red-400" : "border-gray-300/30"
            } rounded-lg p-3 pr-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-300 hover:text-yellow-300"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Thông báo lỗi */}
      {errors.general && (
        <p className="text-red-400 text-center text-sm mt-2">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-lg hover:scale-[1.03] transition-transform"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      {/* 🔐 Nút quên mật khẩu */}
      <button
        type="button"
        onClick={handleSendOtp}
        className="w-full text-yellow-300 hover:underline mt-3"
      >
        Quên mật khẩu?
      </button>
    </form>
  );

  const renderOtpForm = () => (
    <div className="space-y-4">
      <p className="text-gray-100 text-sm">
        Mã OTP đã được gửi tới <b>{email}</b>. Vui lòng nhập mã để tiếp tục.
      </p>
      <input
        type="text"
        placeholder="Nhập mã OTP (4 số)"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
      />
      <div className="flex justify-between">
        <button
          onClick={handleVerifyOtp}
          className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:scale-[1.03] transition"
        >
          Xác minh OTP
        </button>
        <button onClick={() => setStep(1)} className="text-gray-200 text-sm hover:underline">
          Hủy
        </button>
      </div>
    </div>
  );

  const renderResetForm = () => (
    <div className="space-y-4">
      <label className="block text-sm font-semibold mb-1 text-gray-200">
        Mật khẩu mới
      </label>
      <input
        type="password"
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
      />

      {/* Thanh độ mạnh */}
      {newPassword && (
        <div className="mt-2">
          <div className={`h-2 rounded-full ${color} transition-all`}></div>
          <p className="text-sm mt-1 text-white">
            Độ mạnh mật khẩu: <b>{strength}</b>
          </p>
        </div>
      )}

      {/* Ghi chú */}
      <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4 text-sm">
        <p className="text-green-300 font-semibold mb-1">
          ✅ Kiểm tra <b>độ mạnh của mật khẩu</b> — phải có:
        </p>
        <ul className="list-disc list-inside text-gray-200 space-y-1">
          <li><b>Ít nhất 8 ký tự</b></li>
          <li>Ít nhất <b>1 chữ in hoa (A–Z)</b></li>
          <li>Ít nhất <b>1 chữ số (0–9)</b></li>
          <li>Ít nhất <b>1 ký tự đặc biệt (!@#$%^&*)</b></li>
        </ul>
      </div>

      <label className="block text-sm font-semibold mb-1 text-gray-200 mt-4">
        Xác nhận mật khẩu mới
      </label>
      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
      />

      <button
        onClick={handleResetPassword}
        className="w-full py-3 bg-green-400 text-gray-900 font-bold rounded-lg hover:scale-[1.03] transition"
      >
        Xác nhận đổi mật khẩu
      </button>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-fade-in">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-[380px] px-8 py-10 text-white">
        <h2 className="text-center text-2xl font-bold mb-8">
          {step === 1 && <>Đăng nhập <span className="text-yellow-300 font-extrabold">SecureMail</span></>}
          {step === 2 && "Xác minh OTP 🔐"}
          {step === 3 && "Đổi mật khẩu 🔑"}
        </h2>

        {step === 1 && renderLoginForm()}
        {step === 2 && renderOtpForm()}
        {step === 3 && renderResetForm()}

        {message && <p className="text-yellow-300 text-sm text-center mt-4">{message}</p>}

        {step === 1 && (
          <p className="text-center mt-6 text-sm text-gray-200">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-yellow-300 font-semibold hover:underline">
              Đăng ký
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
