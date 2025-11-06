import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Gửi yêu cầu đăng nhập đến server...");

      const response = await fetch("  ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);

      const data = await response.json();
      alert(data.message);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      }
    } catch (err) {
      console.error("💥 Lỗi khi kết nối tới server:", err);
      alert("❌ Không thể kết nối đến server! Kiểm tra console để xem chi tiết.");
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
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

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
