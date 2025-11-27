import { createContext, useContext, useState, useEffect } from "react";

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  // lưu mọi state toàn hệ thống
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("APP_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // tự động lưu khi state thay đổi
  useEffect(() => {
    localStorage.setItem("APP_STATE", JSON.stringify(state));
  }, [state]);

  const updateState = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppStateContext.Provider value={{ state, updateState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
