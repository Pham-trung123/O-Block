import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState("");
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    captchaInput: "",
  });

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);
  };

  useEffect(() => generateCaptcha(), []);

  const handleChange = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, confirm, captchaInput } = input;

    if (!username || !email || !password || !confirm || !captchaInput)
      return alert("⚠️ Vui lòng điền đầy đủ thông tin!");
    if (password !== confirm)
      return alert("❌ Mật khẩu nhập lại không khớp!");
    if (password.length < 6)
      return alert("❌ Mật khẩu phải có ít nhất 6 ký tự!");
    if (captchaInput !== captcha) {
      alert("❌ Sai mã xác thực!");
      generateCaptcha();
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: username, email, password }),
      });
      const data = await response.json();
      alert(data.message);
      if (data.success) setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      alert("⚠️ Không thể kết nối server!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-fade-in">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-[400px] p-8 text-white">
        {/* Header */}
        <h2 className="text-center text-2xl font-bold mb-6 tracking-wide">
          Tạo tài khoản <span className="text-yellow-300">SecureMail</span>
        </h2>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
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
          </div>

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
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={input.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              name="confirm"
              value={input.confirm}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu"
              className="w-full bg-white/20 border border-gray-300/30 rounded-lg p-3 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
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
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg shadow-lg hover:scale-[1.03] transition-transform"
          >
            Đăng ký
          </button>
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
