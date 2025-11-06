import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import Footer from '../components/Footer';
import { geminiAnalyzer } from '../services/geminiService';

const EmailAnalyzer = () => {
  const navigate = useNavigate();
  const [emailContent, setEmailContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeEmail = async () => {
    if (!emailContent.trim()) {
      setError('Vui lòng nhập nội dung email để phân tích');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      console.log('Starting analysis...');
      const result = await geminiAnalyzer.analyzeEmail(emailContent);
      console.log('Analysis result:', result);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Hệ thống AI gặp sự cố. Vui lòng thử lại...');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDomainTrustColor = (trustLevel) => {
    switch (trustLevel) {
      case 'TRUSTED': return 'bg-green-100 text-green-800';
      case 'SUSPICIOUS': return 'bg-yellow-100 text-yellow-800';
      case 'UNTRUSTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phân Tích Email
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sử dụng AI để phân tích và phát hiện email lừa đảo
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung email:
          </label>
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Dán toàn bộ nội dung email vào đây..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          
          {error && (
            <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-700">
              ⚠️ {error}
            </div>
          )}
          
          <button
            onClick={analyzeEmail}
            disabled={isLoading}
            className="mt-4 w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang phân tích với AI...
              </>
            ) : (
              'Phân Tích Email'
            )}
          </button>
        </div>

        {/* Results */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Kết Quả Phân Tích
            </h2>
            
            {/* Main Result - ĐÃ BỎ PHẦN TRĂM */}
            <div className={`p-4 rounded-lg mb-6 border-2 ${
              analysisResult.isPhishing 
                ? 'bg-red-100 border-red-300' 
                : 'bg-green-100 border-green-300'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {analysisResult.isPhishing ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <span className="text-xl font-semibold block">
                      {analysisResult.isPhishing ? 'EMAIL NGUY HIỂM' : 'EMAIL AN TOÀN'}
                    </span>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(analysisResult.riskLevel)}`}>
                      Mức độ rủi ro: {analysisResult.riskLevel}
                    </span>
                  </div>
                </div>
                {/* ĐÃ XÓA PHẦN HIỂN THỊ ĐỘ TIN CẬY */}
              </div>
            </div>

            {/* Analysis Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Sender Analysis */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Phân Tích Người Gửi</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {analysisResult.analysis.senderAnalysis}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Độ Tin Cậy Domain</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDomainTrustColor(analysisResult.analysis.domainTrust)}`}>
                    {analysisResult.analysis.domainTrust === 'TRUSTED' ? '✅ UY TÍN' : 
                     analysisResult.analysis.domainTrust === 'SUSPICIOUS' ? '⚠️ ĐÁNG NGỜ' : 
                     '❌ KHÔNG UY TÍN'}
                  </span>
                </div>
              </div>

              {/* Content Analysis */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Phân Tích Nội Dung</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
                  {analysisResult.analysis.contentAnalysis}
                </p>
                
                {/* Threats */}
                {analysisResult.analysis.threats && analysisResult.analysis.threats.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Mối Đe Dọa Phát Hiện:</h4>
                    <ul className="space-y-1">
                      {analysisResult.analysis.threats.map((threat, index) => (
                        <li key={index} className="flex items-start text-sm text-red-600">
                          <span className="mr-2 mt-1">•</span>
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className={`p-4 rounded-lg border ${
              analysisResult.isPhishing 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-semibold mb-3 ${
                analysisResult.isPhishing ? 'text-red-900' : 'text-blue-900'
              }`}>
                {analysisResult.isPhishing ? '⚠️ CẢNH BÁO' : '💡 KHUYẾN NGHỊ'}:
              </h3>
              <div className="space-y-2">
                {analysisResult.analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <span className={`mr-2 mt-1 ${
                      analysisResult.isPhishing ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {analysisResult.isPhishing ? '❌' : '💡'}
                    </span>
                    <span className={
                      analysisResult.isPhishing ? 'text-red-800' : 'text-blue-800'
                    }>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {analysisResult.explanation && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Giải Thích:</h3>
                <p className="text-gray-700">{analysisResult.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Sample Email Templates */}
        <div className="bg-gray-100 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Mẫu Email Để Thử Nghiệm:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className="bg-white p-4 rounded border text-sm text-gray-600 space-y-2 cursor-pointer hover:border-red-300 transition-colors"
              onClick={() => setEmailContent(`From: security@your-bank.com\nSubject: CẢNH BÁO BẢO MẬT TÀI KHOẢN\n\nChào bạn,\nChúng tôi phát hiện hoạt động đăng nhập bất thường. Vui lòng click vào link sau để xác minh: http://fake-bank-verification.com\nNếu không thực hiện, tài khoản sẽ bị khóa trong 24h.`)}
            >
              <p className="font-semibold">📧 Email Lừa Đảo Mẫu</p>
              <p>Chứa liên kết đáng ngờ và yêu cầu khẩn cấp</p>
            </div>
            <div 
              className="bg-white p-4 rounded border text-sm text-gray-600 space-y-2 cursor-pointer hover:border-green-300 transition-colors"
              onClick={() => setEmailContent(`From: support@google.com\nSubject: Thông báo bảo mật tài khoản\n\nChào bạn,\nChúng tôi gửi thông báo cập nhật chính sách bảo mật mới. Vui lòng truy cập https://myaccount.google.com/security để xem chi tiết.\nTrân trọng,\nĐội ngũ Google`)}
            >
              <p className="font-semibold">📧 Email An Toàn Mẫu</p>
              <p>Thông báo chính thức từ domain uy tín</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmailAnalyzer;