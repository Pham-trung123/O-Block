import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-indigo-600 text-2xl font-bold">🔰 SecureMail</span>
        </div>

        {/* Điều hướng */}
        <div className="space-x-4">
          {user ? (
            <div className="relative group inline-block">
              <FaUserCircle
                size={30}
                className="text-indigo-700 cursor-pointer"
              />
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition">
                <p className="px-4 py-2 text-gray-700 font-medium border-b">
                  {user.name}
                </p>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50"
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
