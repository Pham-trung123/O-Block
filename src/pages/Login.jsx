import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁 Icon mắt

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Regex kiểm tra định dạng Gmail
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    // 🧠 Kiểm tra dữ liệu
    if (!email) newErrors.email = "Vui lòng nhập email!";
    else if (!emailRegex.test(email))
      newErrors.email = "Email không hợp lệ! Vui lòng nhập đúng định dạng Gmail.";

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

      if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        // ✅ Lưu thông tin user
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-fade-in">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-[380px] px-8 py-10 text-white">
        {/* Header */}
        <h2 className="text-center text-2xl font-bold mb-8">
          Đăng nhập{" "}
          <span className="text-yellow-300 font-extrabold">SecureMail</span>
        </h2>

        {/* Form */}
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
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white/20 border ${
                  errors.password ? "border-red-400" : "border-gray-300/30"
                } rounded-lg p-3 pr-10 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none`}
              />
              {/* 👁 Nút bật/tắt hiển thị mật khẩu */}
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

          {/* General error */}
          {errors.general && (
            <p className="text-red-400 text-center text-sm mt-2">
              {errors.general}
            </p>
          )}

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-lg hover:scale-[1.03] transition-transform"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-200">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
