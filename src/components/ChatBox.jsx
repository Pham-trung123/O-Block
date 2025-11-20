// components/ChatBox.jsx
import React, { useState, useRef, useEffect } from "react";

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [lastQuestionWasPhishing, setLastQuestionWasPhishing] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState(new Set());
  const messagesEndRef = useRef(null);

  // --- DATABASE MỞ RỘNG VỚI NGUỒN WIKIPEDIA VÀ HARVEST ---
  const knowledgeBase = [
    { 
      q: ["phishing email là gì", "phishing là gì", "email lừa đảo là gì"], 
      a: "📧 **Phishing Email** là hình thức tấn công mạng thông qua email, trong đó kẻ tấn công giả mạo các tổ chức uy tín (ngân hàng, công ty công nghệ, mạng xã hội) để:\n• Đánh cắp thông tin đăng nhập\n• Chiếm đoạt dữ liệu cá nhân\n• Phát tán mã độc\n• Thực hiện các hành vi lừa đảo tài chính",
      sources: [
        { name: "Wikipedia - Phishing", url: "https://en.wikipedia.org/wiki/Phishing" },
        { name: "HARVEST - Phishing Research", url: "https://dl.acm.org/doi/10.1145/3546068" }
      ]
    },
    { 
      q: ["hình thức phishing email", "các loại phishing", "dạng phishing email", "kiểu tấn công phishing"], 
      a: [
        "🔸 **Phishing giả mạo doanh nghiệp** - Giả danh công ty hợp pháp",
        "🔸 **Spear Phishing** - Tấn công có chủ đích vào cá nhân/tổ chức cụ thể",
        "🔸 **Whaling** - Nhắm vào lãnh đạo cấp cao",
        "🔸 **Phishing đặt hàng/hóa đơn** - Giả mạo giao dịch thương mại",
        "🔸 **Phishing thông báo bảo mật** - Cảnh báo giả về vấn đề bảo mật",
        "🔸 **Phishing mã độc** - Đính kèm file chứa malware"
      ],
      sources: [
        { name: "Wikipedia - Phishing Types", url: "https://en.wikipedia.org/wiki/Phishing#Techniques" },
        { name: "HARVEST - Spear Phishing Study", url: "https://ieeexplore.ieee.org/document/8880005" }
      ]
    },
    { 
      q: ["cách đối phó", "làm sao để đối phó", "phòng chống phishing", "ngăn ngừa email lừa đảo", "biện pháp phòng tránh"], 
      a: [
        "🛡️ **Đào tạo nhận thức bảo mật** - Huấn luyện nhân viên nhận biết dấu hiệu phishing",
        "🛡️ **Xác thực đa yếu tố (2FA/MFA)** - Bảo vệ tài khoản ngay cả khi bị lộ mật khẩu",
        "🛡️ **Sử dụng phần mềm bảo mật** - Antivirus, anti-phishing, email filtering",
        "🛡️ **Kiểm tra kỹ địa chỉ email người gửi** - Phát hiện domain giả mạo",
        "🛡️ **Không click link hoặc mở file đính kèm đáng ngờ**",
        "🛡️ **Báo cáo email khả nghi** cho bộ phận IT ngay lập tức",
        "🛡️ **Cập nhật phần mềm thường xuyên** - Patch các lỗ hổng bảo mật"
      ],
      sources: [
        { name: "Wikipedia - Computer Security", url: "https://en.wikipedia.org/wiki/Computer_security" },
        { name: "HARVEST - Phishing Prevention", url: "https://www.sciencedirect.com/science/article/pii/S0167404821001992" }
      ]
    },
    { 
      q: ["dấu hiệu nhận biết", "cách nhận biết phishing", "email đáng ngờ", "dấu hiệu cảnh báo"], 
      a: [
        "⚠️ **Lỗi chính tả và ngữ pháp** - Thường thấy trong email lừa đảo",
        "⚠️ **Yêu cầu khẩn cấp** - Tạo cảm giác phải hành động ngay",
        "⚠️ **Địa chỉ email người gửi không chính thức** - Domain giả mạo",
        "⚠️ **Link không trùng khớp** - Hover thấy URL khác với text hiển thị",
        "⚠️ **Yêu cầu thông tin nhạy cảm** - Mật khẩu, số thẻ tín dụng, OTP",
        "⚠️ **File đính kèm đáng ngờ** - .exe, .scr, file macro"
      ],
      sources: [
        { name: "Wikipedia - Email Spoofing", url: "https://en.wikipedia.org/wiki/Email_spoofing" },
        { name: "HARVEST - Phishing Detection", url: "https://link.springer.com/article/10.1007/s10207-020-00520-9" }
      ]
    },
    { 
      q: ["xử lý khi bị tấn công", "làm gì khi click link lừa đảo", "bị phishing phải làm sao"], 
      a: "🚨 **Khi nghi ngờ bị tấn công phishing**:\n1. Ngắt kết nối internet ngay lập tức\n2. Thay đổi mật khẩu khẩn cấp\n3. Quét virus toàn hệ thống\n4. Liên hệ bộ phận IT/Bảo mật\n5. Theo dõi tài khoản ngân hàng (nếu liên quan)\n6. Báo cáo sự cố cho cơ quan chức năng",
      sources: [
        { name: "Wikipedia - Incident Response", url: "https://en.wikipedia.org/wiki/Incident_response" },
        { name: "HARVEST - Cyber Attack Response", url: "https://www.tandfonline.com/doi/abs/10.1080/19393555.2020.1838356" }
      ]
    }
  ];

  // --- SUGGESTED QUESTIONS ---
  const suggestedQuestions = [
    "Phishing Email là gì?",
    "Các hình thức phishing email?",
    "Làm sao để đối phó phishing email?",
    "Dấu hiệu nhận biết email lừa đảo?",
    "Xử lý thế nào khi bị tấn công?"
  ];

  // Lấy các câu hỏi gợi ý chưa được hỏi
  const getUnaskedSuggestedQuestions = () => {
    return suggestedQuestions.filter(question => !askedQuestions.has(question));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // KIỂM TRA CÂU HỎI CÓ PHẢI VỀ PHISHING KHÔNG
  const isPhishingQuestion = (question) => {
    const lowerQuestion = question.toLowerCase().trim();
    const phishingKeywords = [
      'phishing', 'lừa đảo', 'email giả mạo', 'spam', 'malware', 
      'virus', 'hacker', 'tấn công', 'bảo mật', 'an ninh',
      'mã độc', 'trojan', 'ransomware', 'mật khẩu', 'đăng nhập',
      'thông tin cá nhân', 'tài khoản', 'ngân hàng', 'thẻ tín dụng'
    ];
    
    return phishingKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  // CẢI THIỆN HÀM TÌM KIẾM - SO KHỚP THÔNG MINH HƠN
  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Tìm câu trả lời khớp nhất
    for (const item of knowledgeBase) {
      for (const keyword of item.q) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          return { answer: item.a, isPhishing: true, sources: item.sources };
        }
      }
    }
    
    // Tìm kiếm mở rộng với các từ khóa phổ biến
    const commonKeywords = {
      'gì': 'phishing email là gì',
      'hình thức': 'hình thức phishing email', 
      'đối phó': 'cách đối phó',
      'phòng chống': 'cách đối phó',
      'nhận biết': 'dấu hiệu nhận biết',
      'xử lý': 'xử lý khi bị tấn công'
    };
    
    for (const [word, topic] of Object.entries(commonKeywords)) {
      if (lowerQuestion.includes(word)) {
        const found = knowledgeBase.find(item => item.q.includes(topic));
        if (found) return { answer: found.a, isPhishing: true, sources: found.sources };
      }
    }
    
    // Kiểm tra nếu là câu hỏi về phishing nhưng không có trong database
    if (isPhishingQuestion(question)) {
      return { 
        answer: "🤔 Tôi hiểu bạn đang hỏi về bảo mật email. Hiện tôi chuyên về phishing email. Bạn có thể hỏi:\n• 'Phishing email là gì?'\n• 'Cách nhận biết email lừa đảo?'\n• 'Biện pháp phòng chống phishing?'", 
        isPhishing: true,
        sources: []
      };
    }
    
    return { answer: null, isPhishing: false, sources: [] };
  };

  // Gửi tin nhắn
  const handleSend = (customText = null) => {
    const text = customText || input;

    if (!text.trim() || isTyping) return;

    setShowSuggestions(false);
    setShowFollowUp(false);
    
    // Thêm câu hỏi vào danh sách đã hỏi nếu là câu gợi ý
    if (customText && suggestedQuestions.includes(customText)) {
      setAskedQuestions(prev => new Set([...prev, customText]));
    }

    const userMsg = { sender: "user", text: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { answer, isPhishing, sources } = findAnswer(text);

      const botMsg = {
        sender: "bot",
        text: answer || "❓ Tôi là trợ lý chuyên về phishing email. Hiện tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về:\n• Các loại phishing email\n• Cách nhận biết email lừa đảo\n• Biện pháp phòng chống\n• Xử lý khi bị tấn công",
        sources: sources
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // HIỆN FOLLOW-UP CHO MỌI CÂU HỎI VỀ PHISHING
      if (isPhishing) {
        setShowFollowUp(true);
        setLastQuestionWasPhishing(true);
      } else {
        setLastQuestionWasPhishing(false);
      }
    }, 1000);
  };

  const handleFollowUp = (wantMore) => {
    if (wantMore) {
      // Hiển thị lại suggested questions (chỉ những câu chưa hỏi)
      setShowSuggestions(true);
    }
    setShowFollowUp(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
    setShowSuggestions(true);
    setShowFollowUp(false);
    setLastQuestionWasPhishing(false);
    setAskedQuestions(new Set());
  };

  const unaskedQuestions = getUnaskedSuggestedQuestions();

  // Component hiển thị nguồn tham khảo
  const SourceLinks = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">📚 <strong>Tài liệu tham khảo:</strong></p>
        <div className="space-y-1">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              • {source.name}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* BUTTON OPEN CHAT */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center w-14 h-14"
            title="Chat với trợ lý an ninh"
          >
            <span className="text-lg">💬</span>
          </button>
        </div>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClose} 
                className="hover:bg-blue-500 p-1 rounded transition-colors"
                title="Thu nhỏ"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <span className="font-semibold">Trợ lý An ninh</span>
            </div>
            <button 
              onClick={handleClose} 
              className="hover:bg-blue-500 p-1 rounded transition-colors"
              title="Đóng"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-4">
                <p className="mb-2">🛡️ Xin chào! Tôi là trợ lý an ninh</p>
                <p className="text-xs text-gray-400 mb-2">Tôi có thể giúp bạn về:</p>
                <div className="text-xs text-gray-400">
                  • Phishing email & cách nhận biết<br/>
                  • Biện pháp phòng chống<br/>
                  • Xử lý sự cố bảo mật
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-3`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none shadow-sm"
                  }`}
                >
                  {Array.isArray(msg.text) ? (
                    <ul className="list-disc ml-4 space-y-1">
                      {msg.text.map((line, idx) => (
                        <li key={idx} className="text-sm">{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="whitespace-pre-line text-sm">{msg.text}</span>
                  )}
                  
                  {/* HIỂN THỊ NGUỒN THAM KHẢO CHO TIN NHẮN BOT */}
                  {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                    <SourceLinks sources={msg.sources} />
                  )}
                </div>
              </div>
            ))}

            {/* FOLLOW-UP SUGGESTION - HIỆN CHO MỌI CÂU HỎI VỀ PHISHING */}
            {showFollowUp && lastQuestionWasPhishing && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[85%]">
                  <p className="text-sm text-gray-700 mb-2">Bạn muốn gợi ý câu hỏi khác không?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFollowUp(true)}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Có
                    </button>
                    <button
                      onClick={() => handleFollowUp(false)}
                      className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Không
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED QUESTIONS - CHỈ HIỆN CÂU CHƯA HỎI */}
          {showSuggestions && unaskedQuestions.length > 0 && (
            <div className="p-3 border-t bg-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                {messages.length === 0 ? "💡 Câu hỏi thường gặp:" : "💡 Câu hỏi gợi ý:"}
              </div>
              <div className="flex flex-col gap-2">
                {unaskedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-left text-sm bg-white border px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors hover:border-blue-300 text-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* THÔNG BÁO KHI ĐÃ HỎI HẾT CÂU GỢI Ý */}
          {showSuggestions && unaskedQuestions.length === 0 && askedQuestions.size > 0 && (
            <div className="p-3 border-t bg-gray-100">
              <div className="text-xs text-gray-500 text-center">
                ✅ Bạn đã xem hết các câu hỏi gợi ý!
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.trim() !== "") setShowSuggestions(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi về phishing email..."
                className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  !input.trim() || isTyping
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}