import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register({ isPopup = false }) {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // PASSWORD STRENGTH
  // ======================
  const checkPasswordStrength = (password) => {
    const strong =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const medium = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

    if (strong.test(password)) return "strong";
    if (medium.test(password)) return "medium";
    return "weak";
  };

  const getStrengthColor = () => {
    if (passwordStrength === "strong") return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (passwordStrength === "medium") return "bg-gradient-to-r from-yellow-500 to-amber-500";
    return "bg-gradient-to-r from-red-500 to-orange-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength === "strong") return "Mạnh 💪";
    if (passwordStrength === "medium") return "Trung bình 😐";
    return "Yếu ⚠️";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // ======================
  // SUBMIT
  // ======================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    let newErrors = {};

    const { username, email, password, confirm } = input;

    if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập!";
    if (!email) newErrors.email = "Vui lòng nhập email!";

    const strong =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu!";
    else if (!strong.test(password))
      newErrors.password = "Mật khẩu chưa đủ mạnh!";

    if (confirm !== password)
      newErrors.confirm = "Mật khẩu nhập lại không khớp!";

    if (!captchaToken) newErrors.captcha = "Vui lòng xác minh Captcha!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: username,
          email,
          password,
          captchaToken,
        }),
      });

      const data = await response.json();
      if (data.success) navigate("/login");
      else setErrors({ email: data.message });
    } catch {
      setErrors({ server: "Không thể kết nối server!" });
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // FORM DÙNG CHUNG (popup + full)
  // ======================
  const renderForm = () => (
  <form onSubmit={handleRegister} className="space-y-4">
    {/* USERNAME */}
    <div>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaUser className="text-lg" />
        </span>
        <input
          type="text"
          name="username"
          value={input.username}
          onChange={handleChange}
          placeholder="Tên đăng nhập"
          className={`w-full p-3 pl-10 rounded-xl bg-gray-50 border ${
            errors.username ? "border-red-400" : "border-gray-200"
          } focus:ring-2 focus:ring-purple-500 transition-all`}
        />
      </div>
      {errors.username && (
        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
      )}
    </div>

    {/* EMAIL */}
    <div>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaEnvelope className="text-lg" />
        </span>
        <input
          type="email"
          name="email"
          value={input.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full p-3 pl-10 rounded-xl bg-gray-50 border ${
            errors.email || errors.emailTaken ? "border-red-400" : "border-gray-200"
          } focus:ring-2 focus:ring-purple-500 transition-all`}
        />
      </div>

      {/* THÔNG BÁO EMAIL SAI / EMAIL TỒN TẠI */}
      {(errors.email || errors.emailTaken) && (
        <p className="text-red-500 text-sm mt-1">
          {errors.email || errors.emailTaken}
        </p>
      )}
    </div>

    {/* PASSWORD */}
    <div>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaLock className="text-lg" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={input.password}
          onChange={handleChange}
          placeholder="Mật khẩu"
          className={`w-full p-3 pl-10 pr-10 rounded-xl bg-gray-50 border ${
            errors.password ? "border-red-400" : "border-gray-200"
          } focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* STRENGTH METER */}
      {input.password && (
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full ${getStrengthColor()}`}
              style={{
                width:
                  passwordStrength === "strong"
                    ? "100%"
                    : passwordStrength === "medium"
                    ? "66%"
                    : "33%",
              }}
            ></div>
          </div>
          <p
            className={`text-sm mt-1 ${
              passwordStrength === "strong"
                ? "text-green-600"
                : passwordStrength === "medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            Độ mạnh: {getStrengthLabel()}
          </p>
        </div>
      )}
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
      )}
    </div>

    {/* CONFIRM PASSWORD */}
    <div>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-400">
          <FaLock className="text-lg" />
        </span>
        <input
          type={showConfirm ? "text" : "password"}
          name="confirm"
          value={input.confirm}
          onChange={handleChange}
          placeholder="Xác nhận mật khẩu"
          className={`w-full p-3 pl-10 pr-10 rounded-xl bg-gray-50 border ${
            errors.confirm ? "border-red-400" : "border-gray-200"
          } focus:ring-2 focus:ring-purple-500 transition-all`}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors.confirm && (
        <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
      )}
    </div>

    {/* CAPTCHA */}
    <div className="flex justify-center scale-95">
      <ReCAPTCHA
        sitekey="6Lcw4RAsAAAAAIUhCAP1C5icEQBHf5LkmaUsQnbZ"
        onChange={(t) => setCaptchaToken(t)}
      />
    </div>
    {errors.captcha && (
      <p className="text-red-500 text-sm text-center">{errors.captcha}</p>
    )}

    {/* REGISTER BUTTON */}
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Đang đăng ký...
        </div>
      ) : (
        "Đăng ký tài khoản"
      )}
    </button>

    {/* GENERAL ERROR (email trùng, server lỗi,...) */}
    {errors.server || errors.emailTaken ? (
      <div className="w-full p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm text-center">
        {errors.server || errors.emailTaken}
      </div>
    ) : null}

    {/* SOCIAL LOGIN SEPARATOR */}
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Hoặc đăng ký với</span>
      </div>
    </div>

    {/* SOCIAL LOGIN */}
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

  // ======================
  // 1) MODE POPUP (dùng trong AuthPage)
  // ======================
  if (isPopup) {
    return <div className="w-full p-2">{renderForm()}</div>;
  }

  // ======================
  // 2) MODE FULL PAGE (/register)
  // ======================
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex overflow-hidden">

        {/* LEFT - Registration Form */}
        <div className="w-full md:w-[55%] p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
              Tạo tài khoản
            </h2>
            <p className="text-gray-600 mt-2">
              Đăng ký để bắt đầu bảo vệ email của bạn
            </p>
          </div>
          {renderForm()}
        </div>

        {/* RIGHT - Gradient Panel */}
        <div className="hidden md:flex w-[45%] bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex-col items-center justify-center text-white px-8 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaUser className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Chào mừng!
            </h2>
            <p className="text-blue-100 text-sm mb-6">
              Đã có tài khoản? Đăng nhập ngay
            </p>

            <button
              type="button"
              onClick={goLogin}
              className="px-8 py-3 border-2 border-white/30 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}