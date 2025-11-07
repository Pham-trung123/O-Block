export default function ChatBot() {
  return (
    <button className="fixed bottom-10 right-10 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full w-16 h-16 text-3xl shadow-lg animate-bounce hover:scale-110 transition">
      <i className="fas fa-robot"></i>
    </button>
  );
}
import { useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");

    // Giả lập phản hồi của chuyên gia
    setTimeout(() => {
      const botReply = {
        sender: "bot",
        text: generateExpertReply(input),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  const generateExpertReply = (message) => {
    message = message.toLowerCase();
    if (message.includes("giá") || message.includes("bao nhiêu"))
      return "Giá sản phẩm sẽ tùy thuộc vào phiên bản và gói bảo hành. Bạn có muốn tôi gửi bảng giá chi tiết không?";
    if (message.includes("bảo hành"))
      return "Sản phẩm của chúng tôi được bảo hành chính hãng 3 năm, hỗ trợ kỹ thuật trọn đời.";
    if (message.includes("liên hệ"))
      return "Bạn có thể liên hệ hotline: 0909-123-456 hoặc nhắn tin trực tiếp tại đây để được hỗ trợ.";
    return "Cảm ơn bạn! Tôi sẽ chuyển câu hỏi của bạn cho chuyên gia để tư vấn chi tiết hơn.";
  };

  return (
    <>
      {/* Nút mở chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-10 right-10 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full w-16 h-16 text-3xl shadow-lg hover:scale-110 transition"
      >
        <i className="fas fa-robot"></i>
      </button>

      {/* Hộp chat */}
      {isOpen && (
        <div className="fixed bottom-28 right-10 w-80 bg-white border border-gray-300 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 text-center font-semibold">
            🤖 Chuyên Gia Hỗ Trợ
          </div>

          <div className="flex-1 p-3 overflow-y-auto h-64 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t flex p-2 bg-gray-50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-500 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-600"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
