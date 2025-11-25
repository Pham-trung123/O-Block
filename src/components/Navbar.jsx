import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaShieldAlt } from "react-icons/fa";
import { FiLogOut, FiUser, FiChevronDown, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-lg">
            <FaShieldAlt className="text-white text-lg" />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
              SecureMail
            </span>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-300 rounded-full"></div>
          </div>
        </div>

        {/* Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all duration-200"
            >
              {t("navbar.dashboard")}
            </Link>

            <Link
              to="/analyze"
              className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all duration-200"
            >
              {t("navbar.analyze")}
            </Link>

            <Link
              to="/history"
              className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all duration-200"
            >
              {t("navbar.history")}
            </Link>
          </div>
        )}

        {/* Right Menu */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-3 bg-white/50 hover:bg-white border border-gray-300/50 hover:border-purple-300 rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">{t("navbar.profile")}</p>
                  </div>
                </div>
                <FiChevronDown className="text-gray-400 group-hover:text-purple-500 transition-transform group-hover:rotate-180 duration-200" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl border border-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200/60 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                </div>

                {/* Buttons */}
                <div className="p-2">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all duration-150"
                  >
                    <FiUser className="text-gray-400" />
                    <span>{t("navbar.profile")}</span>
                  </button>

                  {/* 🔥 Language Selector */}
                  <div className="px-3 py-2">
                    <label className="text-xs text-gray-500 flex items-center gap-2">
                      <FiGlobe className="text-gray-400" />
                      {t("settings.language")}
                    </label>

                    <select
                      className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-white shadow-sm cursor-pointer hover:border-purple-400 focus:ring-2 focus:ring-purple-500"
                      value={localStorage.getItem("lang") || "vi"}
                      onChange={(e) => {
                        i18n.changeLanguage(e.target.value);
                        localStorage.setItem("lang", e.target.value);
                      }}
                    >
                      <option value="vi">🇻🇳 Tiếng Việt</option>
                      <option value="en">🇺🇸 English</option>
                    </select>
                  </div>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-200/60">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-150"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>{t("navbar.logout")}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-300"
              >
                {t("navbar.login")}
              </Link>

              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-purple-700 hover:to-blue-600"
              >
                {t("navbar.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
