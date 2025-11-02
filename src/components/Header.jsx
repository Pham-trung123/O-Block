import { Link } from "react-router-dom";
export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-white/30 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text flex items-center">
          <i className="fas fa-shield-alt mr-2 text-blue-600"></i>
          SecureMail
        </div>
        <div className="flex space-x-4">
  <Link
    to="/login"
    className="border-2 border-blue-600 text-blue-600 font-semibold px-5 py-2 rounded-full hover:bg-blue-600 hover:text-white transition"
  >
    Đăng nhập
  </Link>

        <Link
        to="/register"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition"
                >
          Đăng ký
        </Link>
      </div>
      </div>
    </header>
  );
}
