import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-indigo-600 text-2xl font-bold">🔰 SecureMail</span>
        </div>

        {/* Nút điều hướng */}
        <div className="space-x-4">
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
        </div>
      </div>
    </nav>
  );
}
