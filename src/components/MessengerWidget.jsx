// src/components/MessengerWidget.jsx (Phiên bản nâng cao)
import React, { useState } from "react";

const MessengerWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // THAY BẰNG LINK THẬT CỦA BẠN
  const messengerLinks = {
    direct: "https://www.facebook.com/share/17CqM4o1Tq/", // Link Messenger trực tiếp
    facebook: "https://www.facebook.com/share/17CqM4o1Tq/", // Link Facebook page
    message: "https://www.facebook.com/share/17CqM4o1Tq/" // Link tin nhắn
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(messengerLinks.facebook);
    alert("Đã sao chép link Facebook!");
  };

  return (
    <>
      {/* MESSENGER WIDGET BUTTON */}
      <div className="fixed bottom-40 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center w-14 h-14 relative"
          title="Chat với chúng tôi qua Messenger"
        >
          {/* Messenger Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.26.57 0 .16-.03.31-.09.45-.24.55-.62 1.33-.98 2.08-.32.66.04 1.45.76 1.66 1.56.45 3.49-.3 4.65-1.42.25-.24.57-.36.9-.36.12 0 .24.02.36.05.82.22 1.69.34 2.59.34 5.64 0 10.2-4.13 10.2-9.7C22 6.13 17.64 2 12 2zm-1.54 12.18l-2.69-2.45-4.45 2.45 4.86-5.18 2.73 2.46 4.41-2.46-4.86 5.18z"/>
          </svg>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Messenger Support
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}

          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

          {/* Messenger wave animation */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
        </button>

        {/* MESSENGER POPUP */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.26.57 0 .16-.03.31-.09.45-.24.55-.62 1.33-.98 2.08-.32.66.04 1.45.76 1.66 1.56.45 3.49-.3 4.65-1.42.25-.24.57-.36.9-.36.12 0 .24.02.36.05.82.22 1.69.34 2.59.34 5.64 0 10.2-4.13 10.2-9.7C22 6.13 17.64 2 12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Messenger Support</p>
                    <p className="text-xs opacity-90">Phản hồi ngay lập tức</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-blue-500 p-1 rounded transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Hỗ trợ qua Facebook Messenger
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online 24/7
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <a
                  href={messengerLinks.direct}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.26.57 0 .16-.03.31-.09.45-.24.55-.62 1.33-.98 2.08-.32.66.04 1.45.76 1.66 1.56.45 3.49-.3 4.65-1.42.25-.24.57-.36.9-.36.12 0 .24.02.36.05.82.22 1.69.34 2.59.34 5.64 0 10.2-4.13 10.2-9.7C22 6.13 17.64 2 12 2z"/>
                  </svg>
                  Mở Messenger
                </a>

                <a
                  href={messengerLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Trang Facebook
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium w-full"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                  Sao chép link
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  💬 Chat trực tiếp với đội ngũ support<br/>
                  ⚡ Phản hồi trong vài phút
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style >{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MessengerWidget;