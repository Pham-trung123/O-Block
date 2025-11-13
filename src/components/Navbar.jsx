import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span className="text-indigo-600 text-2xl font-bold">
            🔰 SecureMail
          </span>
        </div>

        {/* Menu bên phải */}
        <div className="space-x-4">
          {user ? (
            <div className="relative group inline-block">
              <FaUserCircle
                size={32}
                className="text-indigo-700 cursor-pointer hover:text-indigo-900 transition"
              />

              {/* Menu thả xuống */}
              <div className="absolute right-0 mt-2 w-44 bg-white/95 shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition transform scale-95 group-hover:scale-100 origin-top-right border border-gray-200">
                <p className="px-4 py-2 text-gray-800 font-medium border-b border-gray-200 truncate">
                  {user.username || user.fullname || "Người dùng"}
                </p>

                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                >
                  Hồ sơ cá nhân
                </button>

                {/* 🔴 Nút Đăng xuất luôn màu đỏ */}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-b-lg hover:bg-red-600 hover:scale-[1.02] transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-700 border border-indigo-700 rounded-full hover:bg-indigo-100 transition"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
