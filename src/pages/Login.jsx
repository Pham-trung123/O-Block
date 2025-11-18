import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const SITE_KEY = "6Lcw4RAsAAAAAIUhCAP1C5icEQBHf5LkmaUsQnbZ";

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
    if (!captchaToken) newErrors.general = "Vui lòng xác minh reCAPTCHA!";

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
  // Gửi OTP
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
  // Form Login
  // ========================
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-600">
          Email
        </label>

        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400 text-lg">
            <i className="fa-solid fa-user"></i>
          </span>

          <input
            type="email"
            placeholder="Nhập email (Gmail)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full bg-gray-100 border ${
              errors.email ? "border-red-400" : "border-gray-300"
            } rounded-lg p-3 pl-10 text-gray-800 placeholder-gray-400`}
          />
        </div>

        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-600">
          Mật khẩu
        </label>

        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400 text-lg">
            <i className="fa-solid fa-lock"></i>
          </span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-gray-100 border ${
              errors.password ? "border-red-400" : "border-gray-300"
            } rounded-lg p-3 pl-10 pr-10 text-gray-800`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* ERROR */}
      {errors.general && (
        <p className="text-red-400 text-center text-sm">{errors.general}</p>
      )}

      {/* CAPTCHA */}
      <div className="flex justify-center scale-[0.9]">
        <ReCAPTCHA
          sitekey={SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-400 text-white text-lg font-bold rounded-lg shadow-lg hover:scale-[1.03] transition-all"
      >
        {loading ? "Đang đăng nhập..." : "Login"}
      </button>

      {/* FORGOT PASSWORD */}
      <button
        type="button"
        onClick={handleSendOtp}
        className="w-full text-blue-500 text-sm hover:underline text-center"
      >
        Quên mật khẩu?
      </button>

      {/* SOCIAL TITLE */}
      <p className="text-center text-gray-500 mt-4 text-sm">
        or login with social platforms
      </p>

      {/* SOCIAL ICONS */}
      <div className="flex justify-center mt-2 space-x-4">
        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/google/login")}
          className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100"
        >
          <i className="fa-brands fa-google text-xl"></i>
        </button>

        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/facebook/login")}
          className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100"
        >
          <i className="fa-brands fa-facebook text-xl"></i>
        </button>

        <button
          onClick={() => (window.location.href = "http://localhost:3000/auth/github/login")}
          className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100"
        >
          <i className="fa-brands fa-github text-xl"></i>
        </button>

        <button className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100">
          <i className="fa-brands fa-linkedin text-xl"></i>
        </button>
      </div>
    </form>
  );

  // ========================
  // Form OTP
  // ========================
  const renderOtpForm = () => (
    <div className="space-y-4">
      <p className="text-gray-600 text-center">
        Mã OTP đã gửi tới <b>{email}</b>
      </p>

      <input
        type="text"
        maxLength={4}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        className="w-full bg-gray-100 border rounded-lg p-3 text-gray-800 text-center"
        placeholder="Nhập OTP"
      />

      <button
        onClick={handleVerifyOtp}
        className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:opacity-90"
      >
        Xác minh OTP
      </button>

      <button
        onClick={() => setStep(1)}
        className="text-gray-500 text-sm hover:underline w-full text-center"
      >
        Hủy
      </button>
    </div>
  );

  // ========================
  // Form Reset Password
  // ========================
  const renderResetForm = () => (
    <div className="space-y-4">
      <p className="text-center text-gray-600">
        Nhập mật khẩu mới cho tài khoản
      </p>

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full bg-gray-100 border rounded-lg p-3 text-gray-800"
      />

      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-gray-100 border rounded-lg p-3 text-gray-800"
      />

      <button
        onClick={handleResetPassword}
        className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:opacity-90"
      >
        Xác nhận đổi mật khẩu
      </button>

      {message && (
        <p className="text-center text-sm text-blue-600">{message}</p>
      )}
    </div>
  );

  // ========================
  // UI MAIN
  // ========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700">
      <div className="w-[760px] h-[550px] bg-white rounded-3xl shadow-xl overflow-hidden flex">

        {/* LEFT */}
        <div className="w-[45%] bg-gradient-to-br from-cyan-400 to-blue-500 flex flex-col items-center justify-center text-white p-10">
          <h2 className="text-3xl font-bold mb-3">Hello, Welcome</h2>
          <p className="opacity-90 mb-6">Don’t have an Account?</p>

          <Link
            to="/register"
            className="px-8 py-2 border border-white rounded-full hover:bg-white hover:text-blue-600 transition"
          >
            Register
          </Link>
        </div>

        {/* RIGHT */}
        <div className="w-[55%] bg-white flex flex-col justify-center px-10">
          <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
            Login
          </h2>

          {step === 1 && renderLoginForm()}
          {step === 2 && renderOtpForm()}
          {step === 3 && renderResetForm()}
        </div>

      </div>
    </div>
  );
}
