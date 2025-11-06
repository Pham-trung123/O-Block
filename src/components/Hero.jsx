import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleTryAnalysis = () => {
    navigate('/analyze');
  };

  return (
    <section className="pt-28 pb-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-400 text-center text-white">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Hệ Thống Phát Hiện Email Lừa Đảo
        </h1>
        <p className="text-lg opacity-90 mb-8">
          Bảo vệ bạn khỏi các trò lừa đảo qua email với hệ thống AI phân tích thông minh
          và cảnh báo mối đe dọa trực tuyến.
        </p>
        <button 
          onClick={handleTryAnalysis}
          className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-indigo-50 transition-colors duration-300"
        >
          Thử Phân Tích Demo
        </button>
      </div>
    </section>
  );
}