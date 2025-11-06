import { createContext, useState, useContext, useEffect } from "react";

// 1️⃣ Tạo context
const AuthContext = createContext();

// 2️⃣ Hàm Provider bọc toàn bộ app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔁 Khi load lại trang → kiểm tra localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 🔐 Đăng nhập → lưu vào state + localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
  };

  // 🚪 Đăng xuất → xóa cả state + localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3️⃣ Custom hook tiện dùng
export const useAuth = () => useContext(AuthContext);
