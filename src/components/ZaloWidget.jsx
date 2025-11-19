// components/ZaloWidget.jsx
import React, { useState } from "react";

const ZaloWidget = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  // THAY BẰNG SỐ ZALO THẬT CỦA BẠN
  const yourZaloNumber = "0972807015";
  const zaloLink = `https://zalo.me/${yourZaloNumber}`;

  return (
    <>
      {/* ZALO WIDGET BUTTON */}
      <div className="fixed bottom-24 right-6 z-50">
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center w-14 h-14 relative"
          title="Nhắn tin Zalo với chúng tôi"
        >
          {/* Zalo Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-7h2v7zm4 0h-2v-7h2v7z"/>
          </svg>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Nhắn tin Zalo ngay
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}

          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </a>
      </div>
    </>
  );
};

export default ZaloWidget;