// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ⚠️ Tắt StrictMode để tránh useEffect chạy hai lần trong dev mode
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
