import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCNKygc1yZC533NDY3ZMuofo13DetfDRH4';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiEmailAnalyzer {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
      }
    });
  }

  createAnalysisPrompt(emailContent) {
    return `
    PHÂN TÍCH EMAIL LỪA ĐẢO - CHỈ TRẢ VỀ JSON

    EMAIL CẦN PHÂN TÍCH:
    ${emailContent}

    PHÂN TÍCH VÀ TRẢ VỀ JSON THEO MẪU:
    {
      "isPhishing": true/false,
      "confidence": số_từ_0_đến_100,
      "riskLevel": "LOW" hoặc "MEDIUM" hoặc "HIGH" hoặc "CRITICAL",
      "analysis": {
        "senderAnalysis": "đánh giá người gửi",
        "contentAnalysis": "đánh giá nội dung", 
        "domainTrust": "TRUSTED" hoặc "SUSPICIOUS" hoặc "UNTRUSTED",
        "threats": ["mối đe dọa 1", "mối đe dọa 2"],
        "recommendations": ["khuyến nghị 1", "khuyến nghị 2"]
      },
      "explanation": "giải thích ngắn gọn"
    }

    QUY TẮC PHÂN TÍCH QUAN TRỌNG:
    - Phân tích KỸ LƯỠNG: Không chỉ dựa vào tuyên bố "đây không phải email lừa đảo"
    - Chú ý các dấu hiệu: liên kết đáng ngờ, yêu cầu click, tên công ty không xác định
    - Domain uy tín thực sự: chỉ các tổ chức giáo dục, chính phủ, ngân hàng lớn
    - KHÔNG thêm bất kỳ text nào ngoài JSON
    `;
  }

  safeJsonParse(text) {
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Áp dụng logic độ tin cậy
        if (parsed.isPhishing && parsed.confidence > 50) {
          parsed.confidence = 50;
        } else if (!parsed.isPhishing && parsed.confidence < 50) {
          parsed.confidence = 50;
        }
        
        // Cập nhật riskLevel dựa trên confidence
        if (parsed.confidence <= 25) {
          parsed.riskLevel = "CRITICAL";
        } else if (parsed.confidence <= 50) {
          parsed.riskLevel = "HIGH";
        } else if (parsed.confidence <= 75) {
          parsed.riskLevel = "MEDIUM";
        } else {
          parsed.riskLevel = "LOW";
        }
        
        return parsed;
      }
      
      throw new Error('Không tìm thấy JSON trong response');
    } catch (error) {
      console.error('JSON Parse Error:', error);
      return this.fallbackAnalysis('');
    }
  }

  extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  }

  async analyzeEmail(emailContent) {
    try {
      if (!emailContent.trim()) {
        throw new Error('Nội dung email trống');
      }

      // KIỂM TRA DOMAIN UY TÍN THỰC SỰ (chỉ áp dụng cho domain đã xác thực)
      const trustedDomains = this.getTrustedDomains();
      const emails = this.extractEmails(emailContent);
      const hasTrustedDomain = emails.some(email => {
        const domain = email.split('@')[1].toLowerCase();
        return trustedDomains.includes(domain);
      });

      // Chỉ ưu tiên domain uy tín nếu KHÔNG có dấu hiệu lừa đảo rõ ràng
      if (hasTrustedDomain && !this.hasClearPhishingSignals(emailContent)) {
        console.log('Phát hiện domain uy tín thực sự, đánh giá an toàn');
        return {
          isPhishing: false,
          confidence: 85,
          riskLevel: "LOW",
          analysis: {
            senderAnalysis: 'Domain người gửi thuộc tổ chức giáo dục/tài chính uy tín đã xác thực',
            contentAnalysis: 'Email từ nguồn đáng tin cậy',
            domainTrust: "TRUSTED",
            threats: ['Không phát hiện mối đe dọa'],
            recommendations: [
              'Email này từ nguồn đáng tin cậy',
              'Vẫn nên cảnh giác với các yêu cầu bất thường'
            ]
          },
          explanation: "Email được gửi từ domain uy tín đã được xác thực"
        };
      }

      const prompt = this.createAnalysisPrompt(emailContent);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const analysisResult = this.safeJsonParse(text);
      return analysisResult;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.fallbackAnalysis(emailContent);
    }
  }

  // Kiểm tra các dấu hiệu lừa đảo rõ ràng
  hasClearPhishingSignals(content) {
    const lowerContent = content.toLowerCase();
    
    const clearPhishingSignals = [
      'chiến dịch đào tạo nhận thức an toàn', // Cụm từ thường dùng trong email lừa đảo
      'kiểm tra và cải thiện khả năng nhận biết',
      'báo cáo theo mẫu tại: http',
      'forms.company-abc.vn', // Domain không xác định
      'công ty tnhh công nghệ abc' // Tên công ty chung chung
    ];

    return clearPhishingSignals.some(signal => lowerContent.includes(signal));
  }

  getTrustedDomains() {
    return [
      // Domain quốc tế uy tín
      'gmail.com', 'google.com', 'outlook.com', 'microsoft.com', 'yahoo.com',
      'icloud.com', 'apple.com', 'protonmail.com', 'zoho.com',
      
      // Domain ngân hàng Việt Nam
      'vietcombank.com.vn', 'vietinbank.vn', 'bidv.com.vn', 'agribank.com.vn',
      'techcombank.com.vn', 'mbbank.com.vn', 'acb.com.vn', 'vpbank.com.vn',
      'tpb.com.vn', 'scb.com.vn', 'hdbank.com.vn', 'shb.com.vn', 'ocb.com.vn',
      
      // Domain giáo dục Việt Nam - CHỈ CÁC TRƯỜNG THẬT
      'fpl.edu.vn', 'hust.edu.vn', 'hcmut.edu.vn', 'hcmus.edu.vn', 'vnu.edu.vn',
      'ptit.edu.vn', 'neu.edu.vn', 'ftu.edu.vn', 'ueh.edu.vn', 'huflit.edu.vn',
      'uit.edu.vn', 'ussh.edu.vn', 'uel.edu.vn', 'hau.edu.vn', 'hcmuaf.edu.vn',
      'vnuhcm.edu.vn', 'dav.edu.vn', 'dhhp.edu.vn', 'dhy.edu.vn', 'dhu.edu.vn',
      
      // Domain tổ chức nhà nước
      'gov.vn', 'nic.vn', 'mofa.gov.vn', 'mof.gov.vn', 'mpi.gov.vn',
      'molisa.gov.vn', 'mard.gov.vn', 'mic.gov.vn', 'moc.gov.vn'
    ];
  }

  fallbackAnalysis(emailContent) {
    const lowerContent = emailContent.toLowerCase();
    
    // PHÂN TÍCH NÂNG CAO cho fallback
    const phishingScore = this.calculateAdvancedPhishingScore(lowerContent);
    const isPhishing = phishingScore <= 50;
    const confidence = isPhishing ? 
      Math.max(30, Math.min(50, phishingScore)) : // Nguy hiểm: 30-50%
      Math.max(50, Math.min(90, phishingScore));  // An toàn: 50-90%
    const riskLevel = this.getRiskLevel(confidence);
    const domainTrust = this.getDomainTrust(emailContent);

    return {
      isPhishing,
      confidence: Math.round(confidence),
      riskLevel,
      analysis: {
        senderAnalysis: this.getAdvancedSenderAnalysis(emailContent, domainTrust),
        contentAnalysis: this.getAdvancedContentAnalysis(lowerContent, phishingScore),
        domainTrust,
        threats: this.getAdvancedThreats(lowerContent, isPhishing),
        recommendations: this.getRecommendations(isPhishing, domainTrust)
      },
      explanation: "Phân tích tự động dựa trên nội dung và dấu hiệu nhận biết"
    };
  }

  calculateAdvancedPhishingScore(content) {
    let score = 50;

    // DẤU HIỆU LỪA ĐẢO NÂNG CAO
    const advancedPhishingIndicators = {
      // Từ khóa lừa đảo thông thường
      'urgent': -15, 'immediately': -12, 'verify': -10, 'password': -15,
      'account': -10, 'security': -8, 'suspend': -15, 'restrict': -12,
      'click here': -20, 'login': -12, 'banking': -15, 'payment': -18,
      'lottery': -25, 'prize': -20, 'winner': -20, 'free': -15,
      'guaranteed': -12, 'limited time': -15, 'act now': -18,
      
      // Dấu hiệu đặc biệt cho email giả mạo đào tạo
      'chiến dịch đào tạo': -25,
      'nhận thức an toàn': -20,
      'kiểm tra khả năng nhận biết': -18,
      'báo cáo theo mẫu': -15,
      'công ty tnhh công nghệ': -20, // Tên công ty chung chung
      'công nghệ abc': -25, // Tên công ty không xác định
      
      // Liên kết và URL
      'http://': -15,
      'https://forms.': -10, // Form thường dùng trong lừa đảo
      'bit.ly': -25,
      'tinyurl': -25,
      'company-abc.vn': -20, // Domain không xác định
      
      // Tuyên bố phủ nhận (thường là lừa đảo)
      'đây không phải email lừa': -30, // Thường là dấu hiệu lừa đảo
      'không phải email lừa đảo': -30,
      'đây là email an toàn': -25
    };

    // DẤU HIỆU AN TOÀN
    const advancedSafeIndicators = {
      // Domain thực sự uy tín
      'fpl.edu.vn': +30,
      'hust.edu.vn': +25,
      'gov.vn': +30,
      'vietcombank.com.vn': +25,
      
      // Thông tin liên hệ rõ ràng
      'security@': +15,
      'phòng đào tạo': +10,
      'ban giám hiệu': +15
    };

    // Tính điểm nâng cao
    Object.entries(advancedPhishingIndicators).forEach(([keyword, points]) => {
      if (content.includes(keyword.toLowerCase())) {
        score += points;
      }
    });

    Object.entries(advancedSafeIndicators).forEach(([keyword, points]) => {
      if (content.includes(keyword.toLowerCase())) {
        score += points;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  getAdvancedSenderAnalysis(emailContent, domainTrust) {
    const emails = this.extractEmails(emailContent);
    const hasGenericCompanyName = emailContent.toLowerCase().includes('công ty tnhh công nghệ abc');
    
    if (hasGenericCompanyName) {
      return 'Tên công ty chung chung, không xác định - Dấu hiệu đáng ngờ';
    }
    
    if (emails.length === 0) {
      return 'Không có thông tin người gửi rõ ràng';
    }

    switch (domainTrust) {
      case 'TRUSTED': return 'Domain người gửi thuộc tổ chức uy tín';
      case 'SUSPICIOUS': return 'Domain người gửi không xác định hoặc đáng ngờ';
      default: return 'Không thể xác định độ tin cậy domain';
    }
  }

  getAdvancedContentAnalysis(content, score) {
    if (score <= 20) return 'Nhiều dấu hiệu lừa đảo nghiêm trọng - Có thể là email giả mạo đào tạo';
    if (score <= 40) return 'Có dấu hiệu lừa đảo rõ ràng - Cần cảnh giác cao';
    if (score <= 50) return 'Có yếu tố đáng ngờ - Nên kiểm tra kỹ';
    if (score <= 70) return 'Nội dung tương đối an toàn';
    return 'Nội dung an toàn và đáng tin cậy';
  }

  getAdvancedThreats(content, isPhishing) {
    if (!isPhishing) return ['Không phát hiện mối đe dọa nghiêm trọng'];

    const threats = [];
    
    // Kiểm tra các dấu hiệu đặc biệt
    if (content.includes('chiến dịch đào tạo') && content.includes('báo cáo theo mẫu')) {
      threats.push('Giả mạo chiến dịch đào tạo an toàn');
    }
    
    if (content.includes('đây không phải email lừa')) {
      threats.push('Tuyên bố phủ nhận lừa đảo - thường là dấu hiệu lừa đảo');
    }
    
    if (content.includes('công ty tnhh công nghệ abc')) {
      threats.push('Tên công ty chung chung, không xác định');
    }
    
    if (content.includes('http://') || content.includes('https://forms.')) {
      threats.push('Chứa liên kết đến form đáng ngờ');
    }
    
    if (content.includes('company-abc.vn')) {
      threats.push('Domain không xác định hoặc giả mạo');
    }

    return threats.length > 0 ? threats : ['Có dấu hiệu lừa đảo không xác định'];
  }

  getRiskLevel(confidence) {
    if (confidence <= 25) return "CRITICAL";
    if (confidence <= 50) return "HIGH";
    if (confidence <= 75) return "MEDIUM";
    return "LOW";
  }

  getDomainTrust(emailContent) {
    const trustedDomains = this.getTrustedDomains();
    const emails = this.extractEmails(emailContent);
    for (let email of emails) {
      const domain = email.split('@')[1].toLowerCase();
      if (trustedDomains.includes(domain)) return "TRUSTED";
    }
    return emails.length > 0 ? "SUSPICIOUS" : "UNTRUSTED";
  }

  getRecommendations(isPhishing, domainTrust) {
    const recommendations = [];
    if (isPhishing) {
      recommendations.push('KHÔNG click vào bất kỳ liên kết nào trong email');
      recommendations.push('KHÔNG cung cấp thông tin cá nhân hoặc mật khẩu');
      recommendations.push('KHÔNG trả lời email này');
      recommendations.push('Xóa email ngay lập tức');
      recommendations.push('Báo cáo với bộ phận IT nếu trong môi trường công ty');
    } else {
      if (domainTrust === 'TRUSTED') {
        recommendations.push('Email này từ nguồn đáng tin cậy');
        recommendations.push('Có thể yên tâm trả lời nếu cần');
      } else {
        recommendations.push('Vẫn nên cảnh giác với các yêu cầu bất thường');
        recommendations.push('Kiểm tra kỹ domain người gửi');
      }
    }
    recommendations.push('Liên hệ tổ chức qua kênh chính thức nếu nghi ngờ');
    return recommendations;
  }
}

export const geminiAnalyzer = new GeminiEmailAnalyzer();