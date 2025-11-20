import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
    if (passwordStrength === "strong") return "bg-green-500";
    if (passwordStrength === "medium") return "bg-yellow-400";
    return "bg-red-500";
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
    }
  };

  // ======================
  // FORM DÙNG CHUNG (popup + full)
  // ======================
  const renderForm = () => (
    <form onSubmit={handleRegister} className="space-y-4 mt-4">
      {/* USERNAME */}
      <input
        type="text"
        name="username"
        value={input.username}
        onChange={handleChange}
        placeholder="Username"
        className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
      />
      {errors.username && (
        <p className="text-red-500 text-sm">{errors.username}</p>
      )}

      {/* EMAIL */}
      <input
        type="email"
        name="email"
        value={input.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email}</p>
      )}

      {/* PASSWORD */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={input.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 pr-10 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-600"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* STRENGTH */}
      {input.password && (
        <div>
          <div className={`h-2 rounded-full ${getStrengthColor()}`} />
          <p className="text-sm text-gray-600 mt-1">
            Độ mạnh: {getStrengthLabel()}
          </p>
        </div>
      )}

      {/* CONFIRM */}
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          name="confirm"
          value={input.confirm}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full p-3 pr-10 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-3 text-gray-600"
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors.confirm && (
        <p className="text-red-500 text-sm">{errors.confirm}</p>
      )}

      {/* CAPTCHA */}
      <div className="flex justify-center scale-[0.9]">
        <ReCAPTCHA
          sitekey="6Lcw4RAsAAAAAIUhCAP1C5icEQBHf5LkmaUsQnbZ"
          onChange={(t) => setCaptchaToken(t)}
        />
      </div>
      {errors.captcha && (
        <p className="text-red-500 text-sm text-center">
          {errors.captcha}
        </p>
      )}

      {/* REGISTER BUTTON */}
      <button
        type="submit"
        className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-blue-800 to-cyan-400 shadow-md hover:opacity-90 transition"
      >
        Register
      </button>

      {/* SOCIAL TITLE */}
      <p className="text-gray-700 text-sm text-center mt-2">
        or register with social platforms
      </p>

      {/* SOCIAL LOGIN */}
      <p className="text-center text-gray-600 text-sm mt-4">
        or login with social platforms
      </p>

      <div className="flex justify-center items-center space-x-4 mt-2">
        <button
          onClick={() =>
            (window.location.href = "http://localhost:3000/auth/google/login")
          }
          className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100"
        >
          <i className="fa-brands fa-google text-xl"></i>
        </button>

        <button
          onClick={() =>
            (window.location.href =
              "http://localhost:3000/auth/facebook/login")
          }
          className="w-12 h-12 border rounded-xl flex items-center justify-center hover:bg-gray-100"
        >
          <i className="fa-brands fa-facebook text-xl"></i>
        </button>

        <button
          onClick={() =>
            (window.location.href =
              "http://localhost:3000/auth/github/login")
          }
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

  // ======================
  // 1) MODE POPUP (dùng trong AuthPage)
  // ======================
  if (isPopup) {
    return <div className="w-full">{renderForm()}</div>;
  }

  // ======================
  // 2) MODE FULL PAGE (/register) – giao diện đẹp như cũ
  // ======================
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 p-6">
      <div className="w-[850px] bg-white rounded-3xl shadow-2xl flex overflow-hidden relative">

        {/* LEFT – Registration Form */}
        <div className="w-[55%] bg-white p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Registration
          </h2>
          {renderForm()}
        </div>

        {/* RIGHT – Blue curved panel */}
        <div className="w-[45%] bg-gradient-to-br from-blue-900 to-blue-700 text-white flex flex-col justify-center items-center p-10 rounded-l-[250px]">
          <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
          <p className="text-center mt-6 text-sm text-gray-200">
            Đã có tài khoản?
          </p>
          <button
            type="button"
            onClick={goLogin}
            className="mt-4 px-6 py-2 border border-white rounded-full 
              text-white font-semibold hover:bg-white hover:text-blue-700
              transition-all duration-300"
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
}
