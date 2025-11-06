import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    captchaInput: "",
  });

  // 🧩 Sinh mã Captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);
  };

  useEffect(() => generateCaptcha(), []);

  // 🧠 Kiểm tra độ mạnh của mật khẩu
  const checkPasswordStrength = (password) => {
    const regexStrong =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const regexMedium = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

    if (regexStrong.test(password)) return "strong";
    if (regexMedium.test(password)) return "medium";
    return "weak";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });

    if (name === "password") setPasswordStrength(checkPasswordStrength(value));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, confirm, captchaInput } = input;
    const newErrors = {};

    // 🧾 Kiểm tra các điều kiện nhập
    if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập!";
    if (!email) newErrors.email = "Vui lòng nhập email!";

    const strongRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu!";
    else if (!strongRegex.test(password))
      newErrors.password =
        "Mật khẩu yếu! Cần ít nhất 8 ký tự, gồm chữ in hoa, số và ký tự đặc biệt.";

    if (confirm !== password)
      newErrors.confirm = "Mật khẩu nhập lại không khớp!";
    if (!captchaInput) newErrors.captchaInput = "Vui lòng nhập mã xác thực!";
    else if (captchaInput !== captcha)
      newErrors.captchaInput = "Sai mã xác thực!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: username, email, password }),
      });

      const data = await response.json();
      if (data.success) navigate("/login");
      else setErrors({ email: data.message || "Đăng ký thất bại!" });
    } catch (err) {
      console.error(err);
      setErrors({ server: "⚠️ Không thể kết nối server!" });
    }
  };

  // 🎨 Thanh màu độ mạnh mật khẩu
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "strong":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-400";
      default:
        return "bg-red-500";
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case "strong":
        return "Mạnh 💪";
      case "medium":
        return "Trung bình 😐";
      default:
        return "Yếu ⚠️";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-fade-in">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-[400px] p-8 text-white">
        <h2 className="text-center text-2xl font-bold mb-6 tracking-wide">
          Tạo tài khoản <span className="text-yellow-300">SecureMail</span>
        </h2>

        {/* 🧩 Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={input.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={input.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 pr-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              {/* 👁 Hiển thị mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-300 hover:text-yellow-300"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            {/* Thanh báo độ mạnh */}
            {input.password && (
              <div className="mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                ></div>
                <p className="text-sm mt-1 text-gray-200">
                  Độ mạnh mật khẩu: {getStrengthLabel()}
                </p>
              </div>
            )}

            {/* ✅ Ghi chú hướng dẫn mật khẩu */}
            <div className="mt-2 text-sm text-gray-300 bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="font-semibold text-yellow-300 mb-1">
                ✅ Kiểm tra độ mạnh của mật khẩu — phải có:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  Ít nhất <span className="font-bold text-white">8 ký tự</span>
                </li>
                <li>
                  Ít nhất{" "}
                  <span className="font-bold text-white">1 chữ in hoa (A–Z)</span>
                </li>
                <li>
                  Ít nhất <span className="font-bold text-white">1 chữ số (0–9)</span>
                </li>
                <li>
                  Ít nhất{" "}
                  <span className="font-bold text-white">
                    1 ký tự đặc biệt (!@#$%^&*)
                  </span>
                </li>
              </ul>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={input.confirm}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu"
                className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 pr-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-300 hover:text-yellow-300"
              >
                {showConfirm ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Mã xác thực
            </label>
            <div className="flex items-center mb-3">
              <div className="flex-1 text-center py-2 font-bold text-lg rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-md select-none">
                {captcha}
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-2 rounded-lg transition-all shadow-md"
              >
                🔄
              </button>
            </div>

            <input
              type="text"
              name="captchaInput"
              value={input.captchaInput}
              onChange={handleChange}
              placeholder="Nhập mã xác thực"
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {errors.captchaInput && (
              <p className="text-red-400 text-sm mt-1">
                {errors.captchaInput}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-lg hover:scale-[1.03] transition-transform"
          >
            Đăng ký
          </button>

          {errors.server && (
            <p className="text-red-400 text-center text-sm mt-2">
              {errors.server}
            </p>
          )}
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-200">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
