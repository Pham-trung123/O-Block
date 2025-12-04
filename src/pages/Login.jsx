import { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaGoogle, FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login({ isPopup }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const SITE_KEY = "6LeVehksAAAAAKL01Etr0omj_5kk_3BfsNAlEmpH";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [captchaToken, setCaptchaToken] = useState(null);

  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  
  const switchToRegister = () => {
    window.location.href = "/register";
  };

  // ========================
  // Đăng nhập
  // ========================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!email) newErrors.email = "Vui lòng nhập email!";
    else if (!emailRegex.test(email))
      newErrors.email = "Email không hợp lệ! Chỉ hỗ trợ Gmail.";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu!";
    if (!captchaToken) {
  return setErrors({ general: "⚠️ reCAPTCHA đã hết hạn, vui lòng tick lại!" });
}


    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        // 👉 THÊM code phân quyền
        if (data.user.role === "admin") {
        return navigate("/admin");
        }
        navigate("/");
      } else {
        setErrors({ general: data.message });
      }
    } catch {
      setErrors({ general: "Không thể kết nối server!" });
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Gửi OTP (quên mật khẩu)
  // ========================
  const handleSendOtp = async () => {
    if (!email) return setMessage("Vui lòng nhập email trước!");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Mã OTP đã gửi đến email!");
        setStep(2);
      } else setMessage(data.message);
    } catch {
      setMessage("Lỗi gửi OTP!");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Xác minh OTP
  // ========================
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.replace(/\D/g, "").slice(0, 4);

    if (!cleanOtp) return setMessage("Vui lòng nhập OTP!");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: cleanOtp }),
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        setStep(3);
      } else setMessage(data.message);
    } catch {
      setMessage("Lỗi xác minh OTP!");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Reset Password
  // ========================
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return setMessage("Vui lòng nhập đầy đủ!");

    if (newPassword !== confirmPassword)
      return setMessage("Mật khẩu không khớp!");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Đổi mật khẩu thành công!");
        setTimeout(() => setStep(1), 1200);
      } else setMessage(data.message);
    } catch {
      setMessage("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Form Login (UI đẹp)
  // ========================
 const renderLoginForm = () => (
  <form onSubmit={handleSubmit} className="space-y-5">

    {/* EMAIL */}
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        Email
      </label>

      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaUser className="text-lg" />
        </span>

        <input
          type="email"
          placeholder="Nhập email (Gmail)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full bg-gray-50 border ${
            errors.email ? "border-red-400" : "border-gray-200"
          } rounded-xl p-3 pl-10 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
        />
      </div>
      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
    </div>

    {/* PASSWORD */}
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        Mật khẩu
      </label>

      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaLock className="text-lg" />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full bg-gray-50 border ${
            errors.password ? "border-red-400" : "border-gray-200"
          } rounded-xl p-3 pl-10 pr-10 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
      )}
    </div>

    {/* CAPTCHA */}
    <div className="flex justify-center scale-95">
<ReCAPTCHA
  sitekey={SITE_KEY}
  onChange={(token) => setCaptchaToken(token)}
  onExpired={() => {
    setCaptchaToken(null);  
    setErrors({ general: "⚠️ Vui lòng tick lại reCAPTCHA!" });
  }}
/>


    </div>

    {/* LOGIN BUTTON */}
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Đang đăng nhập...
        </div>
      ) : (
        "Đăng nhập"
      )}
    </button>

    {/* GENERAL ERROR */}
    {errors.general && (
      <div className="mt-2 w-full p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm text-center animate-fadeIn">
        {errors.general}
      </div>
    )}

    {/* FORGOT PASSWORD */}
    <button
      type="button"
      onClick={handleSendOtp}
      className="w-full text-purple-600 text-sm hover:text-purple-700 hover:underline text-center transition-colors"
    >
      Quên mật khẩu?
    </button>

    {/* SOCIAL LOGIN */}
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
      </div>
    </div>

    <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/google/login")}
          className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
        >
          <FaGoogle className="text-red-500 text-xl" />
        </button>

        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/facebook/login")}
          className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
        >
          <FaFacebook className="text-blue-600 text-xl" />
        </button>

        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/github/login")}
          className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
        >
          <FaGithub className="text-gray-800 text-xl" />
        </button>

        <button className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105">
          <FaLinkedin className="text-blue-700 text-xl" />
        </button>
      </div>
    </form>
  );

  // ========================
  // OTP FORM
  // ========================
  const renderOtpForm = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-center">
        Xác minh OTP
      </h3>

      <p className="text-gray-600 text-center text-sm">
        Mã OTP đã gửi tới <b className="text-purple-600">{email}</b>
      </p>

      <input
        type="text"
        maxLength={4}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        placeholder="Nhập OTP 4 số"
      />

      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        {loading ? "Đang xác minh..." : "Xác minh OTP"}
      </button>

      <button
        onClick={() => setStep(1)}
        className="text-center w-full text-gray-600 hover:text-purple-600 hover:underline transition-colors"
      >
        Quay lại đăng nhập
      </button>

      {message && (
        <p className={`text-center text-sm ${
          message.includes("thành công") ? "text-green-600" : "text-blue-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );

  // ========================
  // RESET PASSWORD FORM
  // ========================
  const renderResetForm = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent text-center">
        Đổi mật khẩu mới
      </h3>

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
      />

      <input
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
      />

      <button
        onClick={handleResetPassword}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
      </button>

      {message && (
        <p className={`text-center text-sm ${
          message.includes("thành công") ? "text-green-600" : "text-blue-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );

  if (isPopup) {
    return (
      <div className="p-2 w-full">
        {renderLoginForm()}
      </div>
    );
  }

  // ========================
  // UI MAIN
  // ========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">

      {/* CARD LOGIN */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex overflow-hidden">

        {/* LEFT PANEL - GRADIENT */}
        <div className="hidden md:flex w-[45%] bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex-col items-center justify-center text-white px-8 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaLock className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Chào mừng trở lại!
            </h2>
            <p className="text-blue-100 text-sm mb-6">
              Đăng nhập để tiếp tục bảo vệ email của bạn
            </p>

            <button
              type="button"
              onClick={switchToRegister}
              className="px-8 py-3 border-2 border-white/30 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Tạo tài khoản mới
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="w-full md:w-[55%] p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
              {step === 1 && "Đăng nhập"}
              {step === 2 && "Xác minh OTP"}
              {step === 3 && "Đổi mật khẩu"}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 && "Đăng nhập để truy cập hệ thống"}
              {step === 2 && "Nhập mã xác minh từ email"}
              {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
            </p>
          </div>

          {step === 1 && renderLoginForm()}
          {step === 2 && renderOtpForm()}
          {step === 3 && renderResetForm()}
        </div>
      </div>
    </div>
  );
}