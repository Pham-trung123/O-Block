import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ========================================
  // 1️⃣ Load user từ localStorage khi reload
  // ========================================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (savedUser && loggedIn === "true") {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ========================================
  // 2️⃣ GOOGLE LOGIN CALLBACK
  // ========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_login_success") === "1") {
      const username = params.get("username");

      const googleUser = {
        username,
        email: `${username}@gmail.com`,
        provider: "google",
      };

      localStorage.setItem("user", JSON.stringify(googleUser));
      localStorage.setItem("isLoggedIn", "true");

      setUser(googleUser);

      window.history.replaceState({}, "", "/");
    }
  }, []);

  // ========================================
  // 3️⃣ GITHUB LOGIN CALLBACK
  // ========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login_github") === "1") {
      const username = params.get("username");
      const email = params.get("email");

      const githubUser = {
        username,
        email,
        provider: "github",
      };

      localStorage.setItem("user", JSON.stringify(githubUser));
      localStorage.setItem("isLoggedIn", "true");

      setUser(githubUser);

      window.history.replaceState({}, "", "/");
    }
  }, []);

  // ========================================
  // 4️⃣ FACEBOOK LOGIN CALLBACK
  // ========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login_facebook") === "1") {
      const username = params.get("username");
      const email = params.get("email");

      const facebookUser = {
        username,
        email,
        provider: "facebook",
      };

      localStorage.setItem("user", JSON.stringify(facebookUser));
      localStorage.setItem("isLoggedIn", "true");

      setUser(facebookUser);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // ========================================
  // 5️⃣ LINKEDIN LOGIN CALLBACK
  // ========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login_linkedin") === "1") {
      const username = params.get("username");
      const email = params.get("email");

      const linkedinUser = {
        username,
        email,
        provider: "linkedin",
      };

      localStorage.setItem("user", JSON.stringify(linkedinUser));
      localStorage.setItem("isLoggedIn", "true");

      setUser(linkedinUser);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // ========================================
  // 🔐 LOGIN (email + password)
  // ========================================
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
  };

  // ========================================
  // 🚪 LOGOUT
  // ========================================
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

export const useAuth = () => useContext(AuthContext);
