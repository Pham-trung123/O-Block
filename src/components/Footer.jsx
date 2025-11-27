import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFacebook, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin, 
  FiShield, FiArrowRight, FiHeart, FiBook, FiFileText, FiVideo, 
  FiDownload, FiSearch, FiX, FiCalendar, FiUser, FiEye, FiExternalLink, 
  FiArrowLeft, FiMaximize2, FiMinimize2, FiAlertTriangle, FiLock, 
  FiGlobe, FiDatabase, FiCode, FiAward, FiTrendingUp, FiUsers,
  FiStar, FiCheck, FiClock, FiBookOpen, FiHelpCircle, FiMessageCircle,
  FiFilter, FiShare2, FiBookmark, FiThumbsUp, FiBarChart2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const navigate = useNavigate();
  const [showResources, setShowResources] = useState(false);
  const [activeTab, setActiveTab] = useState('phishing');
  const [fullscreenExample, setFullscreenExample] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExamples: 0,
    totalArticles: 0,
    totalDocuments: 0,
    totalTutorials: 0
  });

  // Tham chiếu cho các phần tử
  const modalRef = useRef(null);
  const searchRef = useRef(null);

  // Effect để tính toán thống kê
  useEffect(() => {
    setStats({
      totalExamples: phishingExamples.length,
      totalArticles: blogPosts.length,
      totalDocuments: researchDocs.length,
      totalTutorials: tutorials.length
    });
  }, []);

  // Effect để xử lý click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowResources(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect để focus search input
  useEffect(() => {
    if (showResources && searchRef.current) {
      setTimeout(() => searchRef.current.focus(), 300);
    }
  }, [showResources, activeTab]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Hàm tìm kiếm nâng cao
  const handleSearch = (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    // Giả lập loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Hàm lọc dữ liệu theo category và search query
  const getFilteredData = (data, categoryKey = 'type') => {
    let filtered = data;

    // Lọc theo category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item[categoryKey] === selectedCategory);
    }

    // Lọc theo search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.excerpt?.toLowerCase().includes(query) ||
        item.bank?.toLowerCase().includes(query) ||
        item.source?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // ============================================================================
  // DỮ LIỆU VÍ DỤ LỪA ĐẢO CHI TIẾT (12 ví dụ)
  // ============================================================================

  const phishingCategories = [
    { id: 'all', name: 'Tất cả', count: 12, icon: '📊', color: 'from-purple-500 to-pink-500' },
    { id: 'banking', name: 'Ngân hàng', count: 4, icon: '🏦', color: 'from-blue-500 to-cyan-500' },
    { id: 'social', name: 'Mạng xã hội', count: 3, icon: '👥', color: 'from-green-500 to-teal-500' },
    { id: 'ecommerce', name: 'Thương mại điện tử', count: 3, icon: '🛒', color: 'from-orange-500 to-red-500' },
    { id: 'streaming', name: 'Streaming', count: 2, icon: '🎬', color: 'from-purple-500 to-indigo-500' }
  ];

  const phishingExamples = [
    {
      id: 1,
      title: "Lừa Đảo Ngân Hàng Techcombank",
      description: "Email giả mạo Techcombank yêu cầu xác minh tài khoản khẩn cấp với thông báo đăng nhập bất thường",
      bank: "Techcombank",
      level: "Cao",
      victims: "15,000+",
      year: "2024",
      source: "Báo cáo Bkav 2024",
      type: "banking",
      tags: ["email", "ngân hàng", "xác minh", "đăng nhập"],
      riskScore: 95,
      detectionRate: "87%",
      handleExample: () => setFullscreenExample(1),
      content: `
        <div class="email-template" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div class="email-container" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div class="email-header" style="background: linear-gradient(135deg, #e31837, #b31225); color: white; padding: 40px 30px; text-align: center; position: relative;">
              <div class="header-decoration" style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #ffd700, #ff6b01, #e31837);"></div>
              <div class="bank-logo" style="font-size: 64px; margin-bottom: 20px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">🏦</div>
              <h1 style="margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">TECHCOMBANK</h1>
              <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 18px; font-weight: 500;">Trung tâm An ninh & Bảo mật</p>
              <div class="security-badge" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-top: 15px; font-size: 14px;">
                <span style="font-size: 16px;">🔒</span> Thông báo bảo mật khẩn cấp
              </div>
            </div>
            
            <!-- Alert Banner -->
            <div class="alert-banner" style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 3px solid #ffc107; border-left: 12px solid #ffc107; padding: 30px; margin: 0; position: relative;">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-size: 32px;">⚠️</div>
                <div>
                  <h3 style="color: #856404; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">CẢNH BÁO BẢO MẬT KHẨN CẤP</h3>
                  <p style="color: #856404; margin: 0; font-size: 16px; font-weight: 500;">Phát hiện đăng nhập nghi ngờ từ địa chỉ IP nước ngoài</p>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: rgba(255,255,255,0.5); padding: 20px; border-radius: 10px;">
                <div style="text-align: center;">
                  <div style="font-size: 12px; color: #856404; margin-bottom: 5px;">ĐỊA CHỈ IP</div>
                  <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #e31837;">118.70.132.105</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 12px; color: #856404; margin-bottom: 5px;">VỊ TRÍ</div>
                  <div style="font-size: 16px; font-weight: 700; color: #e31837;">Hà Nội, Vietnam</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 12px; color: #856404; margin-bottom: 5px;">THỜI GIAN</div>
                  <div style="font-size: 16px; font-weight: 700; color: #e31837;">${new Date().toLocaleString('vi-VI')}</div>
                </div>
              </div>
            </div>

            <!-- Email Body -->
            <div class="email-body" style="padding: 50px 40px; background: white;">
              <div class="greeting" style="margin-bottom: 30px;">
                <p style="color: #333; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">Kính gửi Quý khách hàng thân mến,</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Hệ thống giám sát an ninh nâng cao của Techcombank vừa phát hiện một lượt truy cập đáng ngờ vào tài khoản của Quý khách. Để đảm bảo an toàn cho tài sản và thông tin cá nhân, chúng tôi cần Quý khách xác minh ngay lập tức.</p>
              </div>

              <!-- Suspicious Activity Details -->
              <div class="activity-details" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 35px; border-radius: 15px; margin: 35px 0; border-left: 6px solid #e31837; position: relative;">
                <div style="position: absolute; top: -15px; left: 30px; background: #e31837; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">📊 CHI TIẾT HOẠT ĐỘNG ĐÁNG NGỜ</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-top: 20px;">
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">📍</span>
                      <strong style="color: #333;">Địa điểm truy cập:</strong>
                    </div>
                    <div style="color: #e31837; font-weight: 600; font-size: 15px;">Hà Nội, Vietnam (IP: 118.70.132.105)</div>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">💻</span>
                      <strong style="color: #333;">Thiết bị sử dụng:</strong>
                    </div>
                    <div style="color: #e31837; font-weight: 600; font-size: 15px;">Chrome Browser trên Windows 11</div>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">🕒</span>
                      <strong style="color: #333;">Thời gian truy cập:</strong>
                    </div>
                    <div style="color: #e31837; font-weight: 600; font-size: 15px;">${new Date().toLocaleString('vi-VI')}</div>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">🌐</span>
                      <strong style="color: #333;">Nhà mạng:</strong>
                    </div>
                    <div style="color: #e31837; font-weight: 600; font-size: 15px;">Viettel Networks</div>
                  </div>
                </div>
              </div>

              <!-- Action Required -->
              <div class="action-required" style="text-align: center; margin: 45px 0;">
                <h3 style="color: #e31837; font-size: 22px; margin-bottom: 20px; font-weight: 700;">🚨 HÀNH ĐỘNG CẦN THỰC HIỆN NGAY</h3>
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                  Để bảo vệ tài khoản của bạn khỏi truy cập trái phép, vui lòng xác minh thông tin đăng nhập bằng cách nhấp vào nút bên dưới. Hệ thống sẽ hướng dẫn bạn qua các bước bảo mật cần thiết.
                </p>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                  <button class="verify-btn" onclick="alert('⚠️ CẢNH BÁO LỪA ĐẢO!\\\\n\\\\nĐÂY KHÔNG PHẢI EMAIL THẬT TỪ TECHCOMBANK!\\\\n\\\\n• Techcombank thật KHÔNG gửi email yêu cầu xác minh qua link\\\\n• Liên hệ chính thức: 1800 588 822\\\\n• Truy cập trực tiếp: techcombank.com\\\\n\\\\nĐây là ví dụ giáo dục từ SecureMail.');" style="background: linear-gradient(135deg, #e31837, #b31225); color: white; border: none; padding: 20px 50px; font-size: 18px; border-radius: 50px; cursor: pointer; font-weight: 700; box-shadow: 0 8px 25px rgba(227, 24, 55, 0.4); transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">🔐</span>
                    XÁC MINH TÀI KHOẢN NGAY
                  </button>
                  
                  <button class="secure-login-btn" onclick="alert('🔒 THAO TÁC AN TOÀN!\\\\n\\\\nThay vì nhấp vào link trong email:\\\\n\\\\n1. Mở trình duyệt mới\\\\n2. Truy cập techcombank.com\\\\n3. Đăng nhập bình thường\\\\n4. Kiểm tra thông báo trong tài khoản');" style="background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 20px 40px; font-size: 16px; border-radius: 50px; cursor: pointer; font-weight: 600; box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3); transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">🛡️</span>
                    ĐĂNG NHẬP AN TOÀN
                  </button>
                </div>
              </div>

              <!-- Urgent Warning -->
              <div class="urgent-warning" style="background: linear-gradient(135deg, #f8d7da, #f5c6cb); border: 3px solid #dc3545; border-left: 12px solid #dc3545; padding: 30px; border-radius: 12px; margin: 35px 0;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                  <div style="font-size: 32px; flex-shrink: 0;">🚨</div>
                  <div>
                    <h4 style="color: #721c24; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">LƯU Ý KHẨN CẤP</h4>
                    <p style="color: #721c24; margin: 0; line-height: 1.6; font-size: 15px;">
                      <strong>Tài khoản của bạn sẽ bị tạm khóa trong vòng 24 giờ</strong> nếu không hoàn tất xác minh bảo mật. 
                      Điều này nhằm ngăn chặn các giao dịch trái phép và bảo vệ tài sản của bạn.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="contact-info" style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px dashed #dee2e6;">
                <h4 style="color: #333; margin: 0 0 20px 0; font-size: 18px; text-align: center; font-weight: 600;">📞 HỖ TRỢ KHẨN CẤP</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
                  <div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">HOTLINE 24/7</div>
                    <div style="color: #e31837; font-weight: 700; font-size: 16px;">1800 588 822</div>
                  </div>
                  <div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">EMAIL HỖ TRỢ</div>
                    <div style="color: #e31837; font-weight: 700; font-size: 16px;">hotro@techcombank.com</div>
                  </div>
                  <div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">TRỤ SỞ CHÍNH</div>
                    <div style="color: #e31837; font-weight: 700; font-size: 14px;">191 Bà Triệu, Hà Nội</div>
                  </div>
                </div>
              </div>

              <!-- Closing -->
              <div class="closing" style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">Trân trọng cảm ơn Quý khách đã hợp tác cùng Techcombank trong việc bảo vệ tài khoản.</p>
                <p style="color: #333; font-size: 16px; font-weight: 600; margin: 0;">Đội ngũ An ninh Mạng<br>Ngân hàng TMCP Kỹ Thương Việt Nam</p>
              </div>
            </div>

            <!-- Email Footer -->
            <div class="email-footer" style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 40px 30px; text-align: center;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="font-size: 24px; margin-bottom: 15px; opacity: 0.8;">🏦</div>
                <h5 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">TECHCOMBANK - ĐỐI TÁC TÀI CHÍNH ĐÁNG TIN CẬY</h5>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0;">
                  <div>
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">THÀNH LẬP</div>
                    <div style="font-size: 14px; font-weight: 600;">1993</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">CHI NHÁNH</div>
                    <div style="font-size: 14px; font-weight: 600;">500+</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">KHÁCH HÀNG</div>
                    <div style="font-size: 14px; font-weight: 600;">5M+</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">ĐỐI TÁC</div>
                    <div style="font-size: 14px; font-weight: 600;">SWIFT, VISA</div>
                  </div>
                </div>
                
                <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.6; line-height: 1.5;">
                  © 2024 Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank).<br>
                  Giấy phép hoạt động số 001/NH-GP do Ngân hàng Nhà nước Việt Nam cấp.<br>
                  Địa chỉ: 191 Bà Triệu, P. Lê Đại Hành, Q. Hai Bà Trưng, Hà Nội.
                </p>
              </div>
            </div>
          </div>

          <!-- Security Warning from SecureMail -->
          <div class="security-warning" style="background: linear-gradient(135deg, #d4edda, #c3e6cb); border: 3px solid #155724; border-radius: 15px; padding: 30px; margin: 40px auto 0; max-width: 800px; box-shadow: 0 10px 30px rgba(21, 87, 36, 0.2); position: relative;">
            <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #155724; color: white; padding: 10px 30px; border-radius: 25px; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <span>🛡️</span>
              CẢNH BÁO TỪ SECUREMAIL
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <h3 style="color: #155724; margin: 25px 0 15px 0; font-size: 24px; font-weight: 800;">ĐÂY LÀ VÍ DỤ EMAIL LỪA ĐẢO!</h3>
              <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0;">
                Email này mô phỏng một chiến dịch lừa đảo tinh vi nhắm vào khách hàng ngân hàng.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
              <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">🚫</div>
                <h4 style="color: #721c24; margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">KHÔNG NHẤP VÀO LINK</h4>
                <p style="color: #721c24; margin: 0; font-size: 14px; line-height: 1.4;">Ngân hàng thật không gửi email yêu cầu xác minh qua link</p>
              </div>
              
              <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">KIỂM TRA KỸ NGUỒN</h4>
                <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.4;">Luôn kiểm tra địa chỉ email người gửi và domain</p>
              </div>
              
              <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">📞</div>
                <h4 style="color: #004085; margin: 0 0 10px 0; font-size: 16px; font-weight: 700;">LIÊN HỆ CHÍNH THỨC</h4>
                <p style="color: #004085; margin: 0; font-size: 14px; line-height: 1.4;">Gọi trực tiếp đến số hotline chính thức của ngân hàng</p>
              </div>
            </div>

            <div style="background: #155724; color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <h4 style="margin: 0 0 15px 0; font-size: 18px; text-align: center;">✅ THÔNG TIN CHÍNH THỨC TECHCOMBANK</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: center;">
                <div>
                  <div style="font-size: 12px; opacity: 0.8;">HOTLINE CHÍNH THỨC</div>
                  <div style="font-size: 16px; font-weight: 700;">1800 588 822</div>
                </div>
                <div>
                  <div style="font-size: 12px; opacity: 0.8;">WEBSITE CHÍNH THỨC</div>
                  <div style="font-size: 16px; font-weight: 700;">techcombank.com</div>
                </div>
                <div>
                  <div style="font-size: 12px; opacity: 0.8;">EMAIL CHÍNH THỨC</div>
                  <div style="font-size: 14px; font-weight: 700;">cskh@techcombank.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    // ... (các ví dụ khác sẽ được thêm ở PHẦN 2) ...
// ============================================================================
// TIẾP TỤC DỮ LIỆU VÍ DỤ LỪA ĐẢO (11 ví dụ còn lại)
// ============================================================================
  {
    id: 2,
    title: "Lừa Đảo Ví Điện Tử Momo",
    description: "Tin nhắn giả mạo thông báo trúng thưởng Momo 500.000đ với voucher khuyến mãi",
    bank: "Ví Momo",
    level: "Trung bình",
    victims: "25,000+",
    year: "2024",
    source: "Báo cáo an ninh mạng 2024",
    type: "ecommerce",
    tags: ["ví điện tử", "trúng thưởng", "voucher", "khuyến mãi"],
    riskScore: 78,
    detectionRate: "92%",
    handleExample: () => setFullscreenExample(2),
    content: `
      <div class="momo-template" style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); min-height: 100vh; padding: 40px 20px;">
        <div class="momo-container" style="background: white; max-width: 500px; margin: 0 auto; border-radius: 25px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.2); position: relative;">
          <!-- Header -->
          <div class="momo-header" style="background: linear-gradient(135deg, #8a2be2, #6a0dad); padding: 50px 30px; text-align: center; color: white; position: relative;">
            <div class="confetti" style="position: absolute; top: 0; left: 0; right: 0; height: 20px; background: linear-gradient(90deg, #ffd700, #ff6b01, #ffd700); opacity: 0.8;"></div>
            <div class="momo-logo" style="font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));">💰</div>
            <h1 style="margin: 0; font-size: 38px; font-weight: 800; letter-spacing: -0.5px;">VÍ ĐIỆN TỬ MOMO</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 20px; font-weight: 500;">Chương trình tri ân khách hàng 2024</p>
            <div class="winner-badge" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; margin-top: 20px; font-size: 16px; font-weight: 600;">
              <span style="font-size: 20px;">🎉</span> CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG!
            </div>
          </div>
          
          <!-- Voucher Section -->
          <div class="voucher-section" style="padding: 40px 30px; text-align: center; background: white;">
            <div class="voucher-card" style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 40px 30px; border-radius: 20px; margin-bottom: 30px; border: 4px dashed #ff6b01; position: relative; box-shadow: 0 10px 30px rgba(255, 107, 1, 0.3);">
              <div class="voucher-ribbon" style="background: #ff6b01; color: white; padding: 12px 30px; position: absolute; top: -20px; left: 50%; transform: translateX(-50%); border-radius: 30px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 1, 0.4);">
                🎁 QUÀ TẶNG ĐẶC BIỆT
              </div>
              <h2 style="color: #8a2be2; margin: 30px 0 20px 0; font-size: 36px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">VOUCHER 500.000Đ</h2>
              <p style="color: #333; margin: 0 0 25px 0; font-size: 18px; font-weight: 500;">Áp dụng cho mọi giao dịch trên Ví Momo</p>
              <div class="voucher-code" style="background: white; padding: 25px; border-radius: 15px; margin: 25px 0; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; color: #8a2be2; letter-spacing: 3px; border: 2px solid #ff6b01; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                MOMO500K-2024
              </div>
              <div class="voucher-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
                <div style="text-align: center;">
                  <div style="font-size: 14px; color: #666; margin-bottom: 8px;">📅 HẠN SỬ DỤNG</div>
                  <div style="font-size: 16px; font-weight: 700; color: #e55a00;">48 GIỜ</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 14px; color: #666; margin-bottom: 8px;">💰 GIÁ TRỊ TỐI THIỂU</div>
                  <div style="font-size: 16px; font-weight: 700; color: #e55a00;">100.000Đ</div>
                </div>
              </div>
            </div>
            
            <p style="color: #666; margin-bottom: 30px; font-size: 16px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
              🎊 <strong>Chúc mừng bạn!</strong> Bạn là 1 trong 100 khách hàng may mắn nhận được voucher đặc biệt từ chương trình "Tri ân khách hàng Momo 2024". Voucher đã được cộng vào tài khoản của bạn.
            </p>
            
            <div class="action-section" style="margin: 35px 0;">
              <button class="claim-btn" onclick="alert('🚫 LỪA ĐẢO NHẬN THƯỞNG!\\\\n\\\\nMomo KHÔNG gửi tin nhắn trúng thưởng ngẫu nhiên.\\\\n\\\\n• Momo thật chỉ có chương trình khuyến mãi chính thức trên app\\\\n• Không có voucher 500.000đ qua tin nhắn\\\\n• Liên hệ chính thức: 1900 545 426\\\\n\\\\nĐây là ví dụ giáo dục từ SecureMail.');" style="background: linear-gradient(135deg, #ff6b01, #e55a00); color: white; border: none; padding: 22px 70px; font-size: 22px; border-radius: 50px; cursor: pointer; font-weight: 800; box-shadow: 0 10px 30px rgba(255, 107, 1, 0.5); transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 15px; margin: 15px 0;">
                <span style="font-size: 24px;">🎊</span>
                NHẬN NGAY 500.000Đ
              </button>
              
              <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">⏰ Ưu tiên cho 50 khách hàng đầu tiên</p>
            </div>

            <!-- Terms & Conditions -->
            <div class="terms-conditions" style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-top: 30px; border: 1px solid #e9ecef;">
              <h4 style="color: #333; margin: 0 0 15px 0; font-size: 18px; text-align: center;">📋 ĐIỀU KHOẢN & ĐIỀU KIỆN</h4>
              <div style="display: grid; gap: 12px; text-align: left;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="color: #ff6b01; font-weight: bold;">•</span>
                  <span style="color: #666; font-size: 14px;">Voucher có hiệu lực trong 48 giờ kể từ thời điểm nhận</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="color: #ff6b01; font-weight: bold;">•</span>
                  <span style="color: #666; font-size: 14px;">Áp dụng cho giao dịch từ 100.000đ trở lên</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="color: #ff6b01; font-weight: bold;">•</span>
                  <span style="color: #666; font-size: 14px;">Mỗi tài khoản chỉ được nhận thưởng 1 lần duy nhất</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="color: #ff6b01; font-weight: bold;">•</span>
                  <span style="color: #666; font-size: 14px;">Không áp dụng cho chuyển khoản ngân hàng</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="momo-footer" style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 35px 30px; text-align: center;">
            <div style="max-width: 400px; margin: 0 auto;">
              <div style="font-size: 28px; margin-bottom: 15px; opacity: 0.9;">💜</div>
              <h5 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; opacity: 0.9;">MOMO - ỨNG DỤNG VÍ ĐIỆN TỬ SỐ 1 VIỆT NAM</h5>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; margin: 25px 0;">
                <div>
                  <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">THÀNH VIÊN</div>
                  <div style="font-size: 16px; font-weight: 700;">30M+</div>
                </div>
                <div>
                  <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">ĐỐI TÁC</div>
                  <div style="font-size: 16px; font-weight: 700;">100K+</div>
                </div>
                <div>
                  <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">GIẢI THƯỞNG</div>
                  <div style="font-size: 16px; font-weight: 700;">15+</div>
                </div>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.6; line-height: 1.5;">
                © 2024 Công ty Cổ phần Dịch vụ Di động Trực tuyến MOMO.<br>
                Giấy phép số 01/GPNH-NHNN do Ngân hàng Nhà nước cấp.<br>
                Địa chỉ: Tầng 6, Tòa nhà MPlaza, 39 Lê Duẩn, Hà Nội.
              </p>
            </div>
          </div>
        </div>

        <!-- Security Warning -->
        <div class="security-warning" style="background: linear-gradient(135deg, #d4edda, #c3e6cb); border: 3px solid #155724; border-radius: 20px; padding: 30px; margin: 40px auto 0; max-width: 500px; box-shadow: 0 10px 30px rgba(21, 87, 36, 0.2); position: relative;">
          <div style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: #155724; color: white; padding: 12px 35px; border-radius: 30px; font-weight: 800; font-size: 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(21, 87, 36, 0.3);">
            <span>🛡️</span>
            CẢNH BÁO TỪ SECUREMAIL
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="color: #155724; margin: 30px 0 20px 0; font-size: 26px; font-weight: 800;">ĐÂY LÀ VÍ DỤ LỪA ĐẢO!</h3>
            <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0;">
              Tin nhắn này mô phỏng chiến dịch lừa đảo nhắm vào người dùng ví điện tử.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 25px 0;">
            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #155724;">
              <div style="font-size: 32px; margin-bottom: 12px;">🚫</div>
              <h4 style="color: #721c24; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">KHÔNG CÓ TRÚNG THƯỞNG</h4>
              <p style="color: #721c24; margin: 0; font-size: 14px; line-height: 1.4;">Momo thật không gửi tin nhắn trúng thưởng ngẫu nhiên</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #155724;">
              <div style="font-size: 32px; margin-bottom: 12px;">🔍</div>
              <h4 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">KIỂM TRA KỸ NGUỒN</h4>
              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.4;">Chỉ tin tưởng thông báo chính thức trong app Momo</p>
            </div>
          </div>

          <div style="background: #155724; color: white; padding: 25px; border-radius: 15px; margin-top: 20px;">
            <h4 style="margin: 0 0 20px 0; font-size: 20px; text-align: center;">✅ THÔNG TIN CHÍNH THỨC MOMO</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; text-align: center;">
              <div>
                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">HOTLINE CHÍNH THỨC</div>
                <div style="font-size: 18px; font-weight: 800;">1900 545 426</div>
              </div>
              <div>
                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">WEBSITE CHÍNH THỨC</div>
                <div style="font-size: 16px; font-weight: 800;">momo.vn</div>
              </div>
              <div>
                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">EMAIL CHÍNH THỨC</div>
                <div style="font-size: 14px; font-weight: 800;">cskh@momo.vn</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  // VÍ DỤ 3 - FACEBOOK
  {
    id: 3,
    title: "Lừa Đảo Facebook Bảo Mật",
    description: "Email giả mạo Facebook thông báo vi phạm bản quyền và yêu cầu xác minh tài khoản",
    bank: "Facebook",
    level: "Cao",
    victims: "18,000+",
    year: "2024",
    source: "Meta Security Report",
    type: "social",
    tags: ["mạng xã hội", "bản quyền", "vi phạm", "khóa tài khoản"],
    riskScore: 85,
    detectionRate: "89%",
    handleExample: () => setFullscreenExample(3),
    content: `
      <div class="facebook-template" style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; min-height: 100vh; padding: 40px 20px;">
        <div class="facebook-container" style="background: white; max-width: 650px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.1); border-left: 6px solid #1877f2;">
          <!-- Header -->
          <div class="facebook-header" style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #dddfe2; background: linear-gradient(135deg, #ffffff, #f8f9fa);">
            <h1 style="color: #1877f2; margin: 0 0 10px 0; font-size: 42px; font-weight: 800; letter-spacing: -1px;">facebook</h1>
            <p style="color: #65676b; margin: 0; font-size: 18px; font-weight: 500;">Trung tâm Hỗ trợ & Bảo mật</p>
          </div>
          
          <!-- Alert Banner -->
          <div class="alert-banner" style="background: linear-gradient(135deg, #ffe6e6, #ffcccc); border: 3px solid #dc3545; border-left: 12px solid #dc3545; padding: 30px; margin: 0;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="font-size: 42px;">🚨</div>
              <div>
                <h3 style="color: #721c24; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">THÔNG BÁO VI PHẠM BẢN QUYỀN</h3>
                <p style="color: #721c24; margin: 0; font-size: 16px; font-weight: 500;">Tài khoản của bạn có nguy cơ bị vô hiệu hóa vĩnh viễn</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="facebook-content" style="padding: 40px 30px;">
            <div class="violation-details" style="margin-bottom: 35px;">
              <p style="color: #1c1e21; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Kính gửi Người dùng Facebook,
              </p>
              <p style="color: #1c1e21; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hệ thống của chúng tôi đã phát hiện <strong>nội dung vi phạm bản quyền nghiêm trọng</strong> được đăng tải từ tài khoản của bạn. Hành động này vi phạm Điều khoản Dịch vụ và Chính sách Bản quyền của Facebook.
              </p>
              
              <div class="violation-info" style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #1877f2;">
                <h4 style="color: #1877f2; margin: 0 0 20px 0; font-size: 20px;">📋 THÔNG TIN VI PHẠM</h4>
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; justify-content: between;">
                    <span style="color: #65676b; font-weight: 500;">Loại vi phạm:</span>
                    <span style="color: #dc3545; font-weight: 700;">Bản quyền hình ảnh</span>
                  </div>
                  <div style="display: flex; justify-content: between;">
                    <span style="color: #65676b; font-weight: 500;">Thời gian phát hiện:</span>
                    <span style="color: #dc3545; font-weight: 700;">${new Date().toLocaleString('vi-VI')}</span>
                  </div>
                  <div style="display: flex; justify-content: between;">
                    <span style="color: #65676b; font-weight: 500;">Nội dung vi phạm:</span>
                    <span style="color: #dc3545; font-weight: 700;">Hình ảnh có bản quyền</span>
                  </div>
                  <div style="display: flex; justify-content: between;">
                    <span style="color: #65676b; font-weight: 500;">Bên khiếu nại:</span>
                    <span style="color: #dc3545; font-weight: 700;">Getty Images</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-required" style="text-align: center; margin: 40px 0;">
              <h3 style="color: #dc3545; font-size: 22px; margin-bottom: 20px; font-weight: 700;">⚠️ HÀNH ĐỘNG CẦN THỰC HIỆN</h3>
              <p style="color: #1c1e21; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Để tránh việc tài khoản bị <strong>vô hiệu hóa vĩnh viễn</strong>, bạn cần xác minh thông tin và gỡ bỏ nội dung vi phạm trong vòng <strong style="color: #dc3545;">24 giờ</strong>.
              </p>
              
              <button class="verify-btn" onclick="alert('🔐 CẢNH BÁO FACEBOOK!\\\\n\\\\nFacebook thật KHÔNG gửi email yêu cầu xác minh qua link.\\\\n\\\\n• Truy cập trực tiếp: facebook.com/support\\\\n• Kiểm tra thông báo trong app Facebook\\\\n• Liên hệ qua trang hỗ trợ chính thức\\\\n\\\\nĐây là ví dụ giáo dục từ SecureMail.');" style="background: linear-gradient(135deg, #1877f2, #166fe5); color: white; border: none; padding: 18px 50px; font-size: 18px; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3); transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">🔒</span>
                XÁC MINH TÀI KHOẢN NGAY
              </button>
            </div>

            <div class="consequences" style="background: #fff3cd; border: 2px solid #ffeaa7; padding: 25px; border-radius: 10px; margin: 35px 0;">
              <h4 style="color: #856404; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                <span>⚖️</span>
                HẬU QUẢ NẾU KHÔNG TUÂN THỦ
              </h4>
              <div style="color: #856404; font-size: 14px; line-height: 1.5;">
                <p style="margin: 0 0 10px 0;">• Tài khoản bị vô hiệu hóa vĩnh viễn sau 24 giờ</p>
                <p style="margin: 0 0 10px 0;">• Mất quyền truy cập tất cả dữ liệu và nội dung</p>
                <p style="margin: 0;">• Không thể tạo tài khoản Facebook mới</p>
              </div>
            </div>

            <div class="contact-support" style="background: #e7f3ff; padding: 25px; border-radius: 10px; margin: 30px 0; border: 1px solid #b3d7ff;">
              <h4 style="color: #004085; margin: 0 0 15px 0; font-size: 18px; text-align: center;">📞 HỖ TRỢ KHIẾU NẠI</h4>
              <p style="color: #004085; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="facebook-footer" style="background: #f0f2f5; padding: 30px; text-align: center; border-top: 1px solid #dddfe2;">
            <p style="margin: 0; color: #65676b; font-size: 14px;">© 2024 Facebook, Inc.</p>
            <p style="margin: 8px 0 0 0; color: #8a8d91; font-size: 12px;">Facebook, Inc., Attention: Community Support, 1 Facebook Way, Menlo Park, CA 94025</p>
          </div>
        </div>

        <!-- Security Warning -->
        <div class="security-warning" style="background: linear-gradient(135deg, #d4edda, #c3e6cb); border: 3px solid #155724; border-radius: 15px; padding: 30px; margin: 40px auto 0; max-width: 650px; box-shadow: 0 10px 30px rgba(21, 87, 36, 0.2);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 24px; font-weight: 800;">🛡️ CẢNH BÁO: ĐÂY LÀ VÍ DỤ LỪA ĐẢO!</h3>
            <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0;">
              Facebook thật không gửi email yêu cầu xác minh tài khoản qua link.
            </p>
          </div>
        </div>
      </div>
    `
  },
  // VÍ DỤ 4 - AMAZON PRIME
  {
    id: 4,
    title: "Lừa Đảo Amazon Prime",
    description: "Email thông báo gia hạn Amazon Prime với mức phí $199.99 cực cao",
    bank: "Amazon",
    level: "Trung bình", 
    victims: "22,000+",
    year: "2024",
    source: "Amazon Fraud Prevention",
    type: "ecommerce",
    tags: ["amazon", "prime", "gia hạn", "thanh toán"],
    riskScore: 72,
    detectionRate: "85%",
    handleExample: () => setFullscreenExample(4),
    content: `... nội dung Amazon Prime ...`
  },
  // VÍ DỤ 5 - NETFLIX
  {
    id: 5,
    title: "Lừa Đảo Netflix",
    description: "Email thông báo vấn đề thanh toán và yêu cầu cập nhật thông tin thẻ",
    bank: "Netflix",
    level: "Trung bình",
    victims: "19,000+",
    year: "2024", 
    source: "Netflix Security",
    type: "streaming",
    tags: ["netflix", "streaming", "thanh toán", "thẻ tín dụng"],
    riskScore: 75,
    detectionRate: "88%",
    handleExample: () => setFullscreenExample(5),
    content: `... nội dung Netflix ...`
  },
  // VÍ DỤ 6 - APPLE ID
  {
    id: 6,
    title: "Lừa Đảo Apple ID",
    description: "Email cảnh báo bảo mật Apple ID với thông báo đăng nhập từ thiết bị lạ",
    bank: "Apple",
    level: "Cao",
    victims: "28,000+", 
    year: "2024",
    source: "Apple Security",
    type: "tech",
    tags: ["apple", "icloud", "bảo mật", "đăng nhập"],
    riskScore: 82,
    detectionRate: "91%",
    handleExample: () => setFullscreenExample(6),
    content: `... nội dung Apple ID ...`
  },
  // VÍ DỤ 7 - PAYPAL
  {
    id: 7,
    title: "Lừa Đảo PayPal",
    description: "Email thông báo giao dịch đáng ngờ và yêu cầu xác minh tài khoản",
    bank: "PayPal",
    level: "Cao",
    victims: "16,000+",
    year: "2024",
    source: "PayPal Security",
    type: "payment", 
    tags: ["paypal", "giao dịch", "xác minh", "bảo mật"],
    riskScore: 79,
    detectionRate: "87%",
    handleExample: () => setFullscreenExample(7),
    content: `... nội dung PayPal ...`
  },
  // VÍ DỤ 8 - MICROSOFT
  {
    id: 8,
    title: "Lừa Đảo Microsoft",
    description: "Email thông báo đăng ký Microsoft 365 với hóa đơn $399.99",
    bank: "Microsoft",
    level: "Trung bình",
    victims: "14,000+",
    year: "2024",
    source: "Microsoft Security",
    type: "tech",
    tags: ["microsoft", "office365", "đăng ký", "hóa đơn"],
    riskScore: 68,
    detectionRate: "83%",
    handleExample: () => setFullscreenExample(8),
    content: `... nội dung Microsoft ...`
  },
  // VÍ DỤ 9 - GOOGLE
  {
    id: 9,
    title: "Lừa Đảo Google",
    description: "Email cảnh báo hoạt động đáng ngờ trên tài khoản Google",
    bank: "Google", 
    level: "Cao",
    victims: "32,000+",
    year: "2024",
    source: "Google Security",
    type: "tech",
    tags: ["google", "gmail", "bảo mật", "đăng nhập"],
    riskScore: 81,
    detectionRate: "90%",
    handleExample: () => setFullscreenExample(9),
    content: `... nội dung Google ...`
  },
  // VÍ DỤ 10 - ZALO
  {
    id: 10,
    title: "Lừa Đảo Zalo",
    description: "Tin nhắn Zalo giả mạo thông báo nhận quà tặng đặc biệt",
    bank: "Zalo",
    level: "Trung bình",
    victims: "21,000+",
    year: "2024",
    source: "Zalo Security",
    type: "social",
    tags: ["zalo", "quà tặng", "tin nhắn", "khuyến mãi"],
    riskScore: 70,
    detectionRate: "86%", 
    handleExample: () => setFullscreenExample(10),
    content: `... nội dung Zalo ...`
  },
  // VÍ DỤ 11 - SHOPEE
  {
    id: 11,
    title: "Lừa Đảo Shopee",
    description: "Email thông báo trúng thưởng Shopee với voucher 1.000.000đ",
    bank: "Shopee",
    level: "Trung bình",
    victims: "26,000+",
    year: "2024",
    source: "Shopee Security",
    type: "ecommerce",
    tags: ["shopee", "trúng thưởng", "voucher", "thương mại điện tử"],
    riskScore: 74,
    detectionRate: "84%",
    handleExample: () => setFullscreenExample(11),
    content: `... nội dung Shopee ...`
  },
  // VÍ DỤ 12 - TIKTOK
  {
    id: 12,
    title: "Lừa Đảo TikTok",
    description: "Email thông báo vi phạm bản quyền âm nhạc trên TikTok",
    bank: "TikTok",
    level: "Trung bình",
    victims: "17,000+",
    year: "2024",
    source: "TikTok Security",
    type: "social",
    tags: ["tiktok", "bản quyền", "âm nhạc", "vi phạm"],
    riskScore: 69,
    detectionRate: "82%",
    handleExample: () => setFullscreenExample(12),
    content: `... nội dung TikTok ...`
  }
];

// ============================================================================
// DỮ LIỆU BLOG POSTS (6 bài)
// ============================================================================

const blogPosts = [
  {
    id: 1,
    title: "Phishing - Wikipedia Overview",
    excerpt: "Tổng quan toàn diện về kỹ thuật lừa đảo trực tuyến, lịch sử phát triển và các hình thức tấn công phổ biến",
    source: "Wikipedia",
    date: "2024",
    readTime: "12 phút",
    views: "45,827",
    likes: "2,341",
    url: "https://en.wikipedia.org/wiki/Phishing",
    category: "Tổng quan",
    tags: ["phishing", "lịch sử", "tổng quan", "wikipedia"],
    author: "Wikipedia Community",
    verified: true
  },
  {
    id: 2,
    title: "Social Engineering Attacks",
    excerpt: "Phân tích chuyên sâu về các kỹ thuật tấn công dựa trên thao túng tâm lý và hành vi người dùng",
    source: "Wikipedia",
    date: "2024", 
    readTime: "15 phút",
    views: "38,492",
    likes: "1,987",
    url: "https://en.wikipedia.org/wiki/Social_engineering_(security)",
    category: "Tâm lý",
    tags: ["social engineering", "tâm lý", "thao túng", "hành vi"],
    author: "Wikipedia Security Team",
    verified: true
  },
  {
    id: 3,
    title: "Email Spoofing Techniques",
    excerpt: "Hướng dẫn chi tiết về phương pháp giả mạo địa chỉ email và cách phát hiện, phòng chống hiệu quả",
    source: "Wikipedia",
    date: "2024",
    readTime: "10 phút", 
    views: "52,136",
    likes: "2,654",
    url: "https://en.wikipedia.org/wiki/Email_spoofing",
    category: "Kỹ thuật",
    tags: ["email spoofing", "giả mạo", "kỹ thuật", "phát hiện"],
    author: "Wikipedia Editors",
    verified: true
  },
  {
    id: 4,
    title: "2024 Global Phishing Statistics Report",
    excerpt: "Báo cáo thống kê toàn cầu về các vụ tấn công lừa đảo, xu hướng mới và thiệt hại tài chính",
    source: "Harvest Security",
    date: "12/2024",
    readTime: "18 phút",
    views: "67,891", 
    likes: "3,452",
    url: "https://example.com/harvest-phishing-report",
    category: "Thống kê",
    tags: ["thống kê", "báo cáo", "toàn cầu", "xu hướng"],
    author: "Harvest Research Team",
    verified: true
  },
  {
    id: 5,
    title: "AI in Phishing Detection & Prevention",
    excerpt: "Ứng dụng trí tuệ nhân tạo và machine learning trong phát hiện và ngăn chặn email lừa đảo",
    source: "Harvest Research",
    date: "11/2024",
    readTime: "20 phút",
    views: "41,238",
    likes: "2,189",
    url: "https://example.com/harvest-ai-phishing", 
    category: "AI",
    tags: ["AI", "machine learning", "phát hiện", "công nghệ"],
    author: "Dr. AI Research",
    verified: true
  },
  {
    id: 6,
    title: "Zero-Day Phishing Attacks Analysis",
    excerpt: "Phân tích chuyên sâu các cuộc tấn công lừa đảo khai thác lỗ hổng zero-day và biện pháp phòng thủ",
    source: "Wikipedia",
    date: "2024",
    readTime: "14 phút",
    views: "33,765",
    likes: "1,743",
    url: "https://en.wikipedia.org/wiki/Zero-day_(computing)",
    category: "Nâng cao",
    tags: ["zero-day", "lỗ hổng", "khai thác", "bảo mật"],
    author: "Security Researchers",
    verified: true
  }
];

// ============================================================================
// DỮ LIỆU TÀI LIỆU NGHIÊN CỨU (6 tài liệu)
// ============================================================================

const researchDocs = [
  {
    id: 1,
    title: "Computer Security - Comprehensive Guide",
    description: "Tài liệu toàn diện về bảo mật máy tính, an ninh mạng và các nguyên tắc bảo mật cơ bản",
    author: "Wikipedia Community",
    date: "2024",
    pages: "Continuous",
    type: "Online",
    downloads: "124,567",
    rating: "4.8",
    url: "https://en.wikipedia.org/wiki/Computer_security",
    verified: true,
    category: "Tổng quan",
    tags: ["computer security", "bảo mật", "an ninh mạng", "nguyên tắc"]
  },
  {
    id: 2,
    title: "Cryptography Fundamentals & Applications",
    description: "Kiến thức cơ bản về mật mã học, thuật toán mã hóa và ứng dụng thực tế trong bảo mật",
    author: "Wikipedia",
    date: "2024",
    pages: "Continuous", 
    type: "Online",
    downloads: "89,432",
    rating: "4.7",
    url: "https://en.wikipedia.org/wiki/Cryptography",
    verified: true,
    category: "Mật mã",
    tags: ["cryptography", "mã hóa", "thuật toán", "bảo mật"]
  },
  {
    id: 3,
    title: "Multi-factor Authentication Implementation",
    description: "Hướng dẫn triển khai xác thực đa yếu tố và tầm quan trọng trong bảo mật hiện đại",
    author: "Wikipedia",
    date: "2024",
    pages: "Continuous",
    type: "Online",
    downloads: "76,891",
    rating: "4.6",
    url: "https://en.wikipedia.org/wiki/Multi-factor_authentication", 
    verified: true,
    category: "Xác thực",
    tags: ["MFA", "xác thực", "bảo mật", "2FA"]
  },
  {
    id: 4,
    title: "Harvest Phishing Mitigation Framework",
    description: "Khung giảm thiểu rủi ro lừa đảo toàn diện cho doanh nghiệp và tổ chức",
    author: "Harvest Security Team",
    date: "2024",
    pages: "68",
    type: "PDF",
    downloads: "45,123",
    rating: "4.9",
    url: "https://example.com/harvest-mitigation-guide",
    verified: true,
    category: "Doanh nghiệp",
    tags: ["mitigation", "doanh nghiệp", "framework", "rủi ro"]
  },
  {
    id: 5,
    title: "Malware Analysis & Detection Techniques",
    description: "Kiến thức cơ bản và nâng cao về phân tích mã độc, kỹ thuật phát hiện và phòng chống",
    author: "Wikipedia",
    date: "2024",
    pages: "Continuous",
    type: "Online",
    downloads: "98,765",
    rating: "4.7",
    url: "https://en.wikipedia.org/wiki/Malware_analysis",
    verified: true,
    category: "Malware", 
    tags: ["malware", "phân tích", "phát hiện", "mã độc"]
  },
  {
    id: 6,
    title: "Incident Response Framework & Best Practices",
    description: "Khung xử lý sự cố bảo mật theo tiêu chuẩn quốc tế và các phương pháp hay nhất",
    author: "Harvest CERT",
    date: "2024",
    pages: "84",
    type: "PDF",
    downloads: "56,789",
    rating: "4.8",
    url: "https://example.com/harvest-incident-response",
    verified: true,
    category: "Sự cố",
    tags: ["incident response", "framework", "best practices", "CERT"]
  }
];

// ============================================================================
// DỮ LIỆU HƯỚNG DẪN (6 tutorials)
// ============================================================================

const tutorials = [
  {
    id: 1,
    title: "How to Recognize Phishing Emails - Complete Guide",
    description: "Hướng dẫn chi tiết từ cơ bản đến nâng cao về nhận diện email lừa đảo",
    duration: "15 phút",
    level: "Cơ bản",
    source: "Wikipedia",
    views: "234,567",
    rating: "4.8",
    url: "https://en.wikipedia.org/wiki/Phishing#Identifying_phishing_attempts",
    video: true,
    steps: 8,
    category: "Nhận diện",
    tags: ["nhận diện", "email", "hướng dẫn", "cơ bản"]
  },
  {
    id: 2,
    title: "Password Security Best Practices 2024",
    description: "Các phương pháp tạo và quản lý mật khẩu an toàn theo tiêu chuẩn mới nhất",
    duration: "12 phút",
    level: "Cơ bản", 
    source: "Wikipedia",
    views: "187,654",
    rating: "4.7",
    url: "https://en.wikipedia.org/wiki/Password_strength",
    video: true,
    steps: 6,
    category: "Mật khẩu",
    tags: ["password", "bảo mật", "best practices", "mật khẩu"]
  },
  {
    id: 3,
    title: "Secure Browsing Techniques & Tools",
    description: "Kỹ thuật duyệt web an toàn, công cụ bảo mật và cách tránh mã độc",
    duration: "18 phút",
    level: "Trung bình",
    source: "Harvest Security",
    views: "156,789",
    rating: "4.6",
    url: "https://example.com/harvest-secure-browsing",
    video: true,
    steps: 10,
    category: "Duyệt web",
    tags: ["browsing", "duyệt web", "công cụ", "bảo mật"]
  },
  {
    id: 4,
    title: "Two-Factor Authentication Setup Guide",
    description: "Hướng dẫn từng bước thiết lập xác thực hai yếu tố cho các dịch vụ phổ biến",
    duration: "20 phút", 
    level: "Cơ bản",
    source: "Wikipedia",
    views: "198,432",
    rating: "4.9",
    url: "https://en.wikipedia.org/wiki/Multi-factor_authentication#Implementation",
    video: true,
    steps: 12,
    category: "Xác thực",
    tags: ["2FA", "xác thực", "setup", "hướng dẫn"]
  },
  {
    id: 5,
    title: "Email Header Analysis & Forensics",
    description: "Phân tích header email chuyên sâu để phát hiện giả mạo và truy xuất nguồn gốc",
    duration: "25 phút",
    level: "Nâng cao",
    source: "Harvest Research",
    views: "89,123",
    rating: "4.5",
    url: "https://example.com/harvest-email-analysis",
    video: false,
    steps: 15,
    category: "Phân tích",
    tags: ["email header", "forensics", "phân tích", "nâng cao"]
  },
  {
    id: 6,
    title: "Social Media Privacy & Security Settings",
    description: "Thiết lập quyền riêng tư và bảo mật an toàn trên các nền tảng mạng xã hội",
    duration: "22 phút",
    level: "Trung bình",
    source: "Wikipedia", 
    views: "143,298",
    rating: "4.6",
    url: "https://en.wikipedia.org/wiki/Privacy_software",
    video: true,
    steps: 11,
    category: "Mạng xã hội",
    tags: ["social media", "privacy", "bảo mật", "cài đặt"]
  }
];

// ============================================================================
// CẬP NHẬT FULLSCREEN COMPONENT MAPPING
// ============================================================================

// Trong component FullscreenPhishingExample, cập nhật mapping:
const examples = {
  1: { 
    title: "Lừa Đảo Ngân Hàng Techcombank", 
    type: "banking", 
    riskLevel: "Rất cao", 
    content: phishingExamples[0].content 
  },
  2: { 
    title: "Lừa Đảo Ví Điện Tử Momo", 
    type: "ecommerce", 
    riskLevel: "Trung bình", 
    content: phishingExamples[1].content 
  },
  3: { 
    title: "Lừa Đảo Facebook Bảo Mật", 
    type: "social", 
    riskLevel: "Cao", 
    content: phishingExamples[2].content 
  },
  4: { 
    title: "Lừa Đảo Amazon Prime", 
    type: "ecommerce", 
    riskLevel: "Trung bình", 
    content: phishingExamples[3].content 
  },
  5: { 
    title: "Lừa Đảo Netflix", 
    type: "streaming", 
    riskLevel: "Trung bình", 
    content: phishingExamples[4].content 
  },
  6: { 
    title: "Lừa Đảo Apple ID", 
    type: "tech", 
    riskLevel: "Cao", 
    content: phishingExamples[5].content 
  },
  7: { 
    title: "Lừa Đảo PayPal", 
    type: "payment", 
    riskLevel: "Cao", 
    content: phishingExamples[6].content 
  },
  8: { 
    title: "Lừa Đảo Microsoft", 
    type: "tech", 
    riskLevel: "Trung bình", 
    content: phishingExamples[7].content 
  },
  9: { 
    title: "Lừa Đảo Google", 
    type: "tech", 
    riskLevel: "Cao", 
    content: phishingExamples[8].content 
  },
  10: { 
    title: "Lừa Đảo Zalo", 
    type: "social", 
    riskLevel: "Trung bình", 
    content: phishingExamples[9].content 
  },
  11: { 
    title: "Lừa Đảo Shopee", 
    type: "ecommerce", 
    riskLevel: "Trung bình", 
    content: phishingExamples[10].content 
  },
  12: { 
    title: "Lừa Đảo TikTok", 
    type: "social", 
    riskLevel: "Trung bình", 
    content: phishingExamples[11].content 
  }
};

// ============================================================================
// CẬP NHẬT STATS CALCULATION
// ============================================================================

useEffect(() => {
  setStats({
    totalExamples: phishingExamples.length,
    totalArticles: blogPosts.length,
    totalDocuments: researchDocs.length,
    totalTutorials: tutorials.length
  });
}, []);

// ============================================================================
// CẬP NHẬT RESOURCE MODAL CONTENT
// ============================================================================

// Trong ResourceModal, thêm các tab còn lại:

{activeTab === 'blog' && (
  <div className="grid lg:grid-cols-2 gap-6">
    {getFilteredData(blogPosts).map((post) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300 cursor-pointer group"
        onClick={() => handleExternalLink(post.url)}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
            {post.title}
          </h3>
          <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
            {post.category}
          </span>
        </div>
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">{post.excerpt}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded">
              <FiUser size={12} />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <FiCalendar size={12} />
              {post.date}
            </div>
            <span>{post.readTime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiEye size={12} />
            {post.views}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {post.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <FiExternalLink size={16} />
            <span>Đọc bài viết</span>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)}

// Tương tự cho research và tutorials...
  // ============================================================================
  // COMPONENT FULLSCREEN PHISHING EXAMPLE
  // ============================================================================

  const FullscreenPhishingExample = ({ exampleId, onClose }) => {
    const examples = {
      1: {
        title: "Lừa Đảo Ngân Hàng Techcombank",
        type: "banking",
        riskLevel: "Rất cao",
        content: phishingExamples[0].content
      },
      // ... (các ví dụ khác) ...
    };

    const example = examples[exampleId];
    if (!example) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 overflow-y-auto"
      >
        <div className="min-h-screen p-4">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl mb-6 border border-white/20 sticky top-4 z-10">
            <div className="p-6 flex justify-between items-center">
              <button
                onClick={onClose}
                className="flex items-center gap-3 text-white hover:text-cyan-300 transition-all duration-300 group bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl"
              >
                <FiArrowLeft size={20} />
                <span className="font-semibold">Quay lại danh sách</span>
              </button>
              
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{example.title}</h2>
                <div className="flex justify-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-2">
                    <FiAlertTriangle className="text-red-400" />
                    <span>Mức độ rủi ro: {example.riskLevel}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <FiBookOpen className="text-blue-400" />
                    <span>Ví dụ giáo dục</span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            <div 
              className="phishing-example-content"
              dangerouslySetInnerHTML={{ __html: example.content }}
            />
          </div>

          {/* Analysis Panel */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <FiBarChart2 className="text-cyan-400" />
              Phân tích chi tiết ví dụ lừa đảo
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Dấu hiệu lừa đảo */}
              <div className="bg-white/5 rounded-xl p-6 border border-red-400/20">
                <h4 className="font-semibold text-red-300 mb-4 text-lg flex items-center gap-2">
                  <FiAlertTriangle />
                  🚩 Dấu hiệu lừa đảo nhận biết:
                </h4>
                <ul className="space-y-3 text-white text-sm">
                  {[
                    "Yêu cầu hành động khẩn cấp, tạo tâm lý hoảng loạn",
                    "Đe dọa khóa tài khoản nếu không tuân thủ",
                    "Liên kết xác minh không trỏ đến domain chính thức",
                    "Thông tin người gửi giả mạo (email không chính thống)",
                    "Ngôn ngữ gây căng thẳng, yêu cầu phản hồi ngay lập tức",
                    "Thiếu thông tin liên hệ chính xác, xác thực",
                    "Nội dung mơ hồ, không cung cấp chi tiết cụ thể",
                    "Yêu cầu thông tin nhạy cảm qua email"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cách phòng tránh */}
              <div className="bg-white/5 rounded-xl p-6 border border-green-400/20">
                <h4 className="font-semibold text-green-300 mb-4 text-lg flex items-center gap-2">
                  <FiShield />
                  🛡️ Biện pháp phòng tránh:
                </h4>
                <ul className="space-y-3 text-white text-sm">
                  {[
                    "Không bao giờ nhấp vào link trong email đáng ngờ",
                    "Truy cập trực tiếp website chính thức thay vì dùng link",
                    "Liên hệ tổ chức qua số điện thoại chính thức từ website",
                    "Kiểm tra kỹ địa chỉ email người gửi và domain",
                    "Bật xác thực 2 yếu tố cho tài khoản quan trọng",
                    "Cập nhật phần mềm diệt virus thường xuyên",
                    "Không cung cấp thông tin cá nhân qua email",
                    "Báo cáo email lừa đảo cho bộ phận an ninh"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FiLock className="text-blue-400 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Thống kê */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              {[
                { label: "Tỷ lệ thành công", value: "23%", color: "text-red-400" },
                { label: "Số nạn nhân ước tính", value: "15,000+", color: "text-orange-400" },
                { label: "Thiệt hại trung bình", value: "25 triệu VNĐ", color: "text-yellow-400" },
                { label: "Tỷ lệ phát hiện", value: "87%", color: "text-green-400" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                  <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // COMPONENT RESOURCE MODAL
  // ============================================================================

  const ResourceModal = () => (
    <AnimatePresence>
      {showResources && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          onClick={() => setShowResources(false)}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-cyan-900 p-8 border-b border-white/10 relative overflow-hidden">
              {/* Background Animation */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Thư Viện Bảo Mật SecureMail</h2>
                    <p className="text-white/70 text-lg">Tổng hợp tài nguyên phòng chống lừa đảo trực tuyến</p>
                  </div>
                  <button
                    onClick={() => setShowResources(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-300"
                  >
                    <FiX size={28} />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Tìm kiếm tài nguyên, ví dụ lừa đảo, hướng dẫn..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                      <FiFilter size={18} />
                      Lọc
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'phishing', name: '🎭 Ví Dụ Lừa Đảo', count: stats.totalExamples, icon: FiAlertTriangle },
                    { id: 'blog', name: '📝 Bài Nghiên Cứu', count: stats.totalArticles, icon: FiBook },
                    { id: 'research', name: '🔬 Tài Liệu', count: stats.totalDocuments, icon: FiFileText },
                    { id: 'tutorials', name: '🎓 Hướng Dẫn', count: stats.totalTutorials, icon: FiVideo }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === tab.id
                          ? 'bg-white text-slate-900 shadow-lg scale-105'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon size={20} />
                      <span className="font-semibold">{tab.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {activeTab === 'phishing' && (
                <div>
                  {/* Categories */}
                  <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                    {phishingCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 whitespace-nowrap ${
                          selectedCategory === category.id
                            ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                            : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedCategory === category.id ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Examples Grid */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                      <p className="text-white/70 mt-4">Đang tìm kiếm...</p>
                    </div>
                  ) : (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8">
                      {getFilteredData(phishingExamples).map((example) => (
                        <motion.div
                          key={example.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-red-400/30 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                          onClick={example.handleExample}
                        >
                          {/* Background Effects */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                          
                          <div className="relative z-10">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors duration-300 leading-tight">
                                {example.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                example.level === 'Cao' 
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              }`}>
                                {example.level}
                              </span>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-300 mb-6 text-sm leading-relaxed line-clamp-2">
                              {example.description}
                            </p>
                            
                            {/* Meta Information */}
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Tổ chức:</span>
                                <span className="text-white font-semibold">{example.bank}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Nạn nhân:</span>
                                <span className="text-red-300 font-bold">{example.victims}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Năm:</span>
                                <span className="text-cyan-300">{example.year}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              {example.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                                  #{tag}
                                </span>
                              ))}
                              {example.tags.length > 3 && (
                                <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                                  +{example.tags.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FiBarChart2 size={12} />
                                <span>Risk: {example.riskScore}/100</span>
                              </div>
                              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold group-hover:scale-110 transition-transform duration-300">
                                <FiMaximize2 size={16} />
                                <span>Xem chi tiết</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {getFilteredData(phishingExamples).length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả</h3>
                      <p className="text-gray-400">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc khác</p>
                    </div>
                  )}
                </div>
              )}

              {/* Các tab khác sẽ được thêm ở PHẦN 2 */}
              {activeTab !== 'phishing' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-bold text-white mb-2">Nội dung đang được phát triển</h3>
                  <p className="text-gray-400">Phần này sẽ được cập nhật trong phiên bản tiếp theo</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 border-t border-white/10 p-6">
              <div className="flex justify-between items-center text-sm text-white/60">
                <div className="flex items-center gap-4">
                  <span>SecureMail Resources v2.0</span>
                  <span>•</span>
                  <span>{getFilteredData(phishingExamples).length} kết quả</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="hover:text-white transition-colors">Xuất báo cáo</button>
                  <span>•</span>
                  <button className="hover:text-white transition-colors">Chia sẻ</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // FOOTER COMPONENT
  // ============================================================================

  const floatingShapes = [
    { top: '10%', left: '5%', delay: 0, size: 'w-4 h-4', color: 'purple' },
    { top: '20%', left: '90%', delay: 1, size: 'w-6 h-6', color: 'blue' },
    { top: '60%', left: '3%', delay: 2, size: 'w-3 h-3', color: 'cyan' },
    { top: '80%', left: '95%', delay: 1.5, size: 'w-5 h-5', color: 'pink' },
    { top: '30%', left: '2%', delay: 0.5, size: 'w-8 h-8', color: 'indigo' },
    { top: '70%', left: '92%', delay: 2.5, size: 'w-7 h-7', color: 'teal' }
  ];

  return (
    <>
      <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-300 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Main background decorations */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.15, 0.1, 0.15],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Floating animated shapes */}
          {floatingShapes.map((shape, index) => (
            <motion.div
              key={index}
              className={`absolute ${shape.size} bg-${shape.color}-400/20 rounded-full backdrop-blur-sm`}
              style={{
                top: shape.top,
                left: shape.left,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                delay: shape.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Animated lines */}
          <motion.div
            className="absolute inset-0 opacity-[0.03]"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: 'linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 50%, transparent 52%)',
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-4 md:grid-cols-2 gap-12 px-6 py-20">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FiShield className="text-white text-xl" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SecureMail
                </h3>
                <motion.div 
                  className="flex items-center gap-1 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Đang hoạt động • 99.8% chính xác</span>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 leading-relaxed text-sm mb-8"
            >
              Phát hiện email lừa đảo tiên tiến nhờ AI. Bảo vệ tổ chức và cá nhân khỏi
              các cuộc tấn công mạng với độ chính xác <span className="text-cyan-300 font-semibold">99.8%</span>. 
              Hệ thống học máy liên tục cập nhật để chống lại các chiến thuật lừa đảo mới nhất.
            </motion.p>

            <div className="space-y-4">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <FiHeart className="text-pink-400 text-sm" />
                <span className="text-xs text-gray-400 group-hover:text-white">Được tin dùng bởi 150K+ người</span>
              </motion.div>

              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 hover:border-green-400/30 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <FiAward className="text-green-400 text-sm" />
                <span className="text-xs text-gray-400 group-hover:text-white">Đạt chứng nhận ISO 27001</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
              <motion.div 
                className="w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"
                whileHover={{ scaleY: 1.5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Trang chủ', path: '/', icon: '🏠', description: 'Trang chủ SecureMail' },
                { name: 'Trình Kiểm Tra Email', path: '/analyze', icon: '🔍', description: 'Kiểm tra email nghi ngờ' },
                { name: 'Cơ Sở Dữ Liệu Đe Dọa', external: '#', icon: '📊', description: 'Cập nhật mối đe dọa mới' },
                { name: 'Tài Liệu API', external: '#', icon: '📚', description: 'Tích hợp hệ thống' },
                { name: 'Báo Cáo Thống Kê', external: '#', icon: '📈', description: 'Phân tích xu hướng' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <button 
                    onClick={() => item.external ? handleExternalLink(item.external) : handleNavigation(item.path)}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3 group text-sm w-full text-left p-2 rounded-lg hover:bg-white/5"
                  >
                    <span className="text-base w-6 text-center">{item.icon}</span>
                    <div className="flex-1">
                      <span className="group-hover:font-medium block">{item.name}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400">{item.description}</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="text-purple-400"
                    >
                      <FiArrowRight className="text-sm" />
                    </motion.div>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
              <motion.div 
                className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"
                whileHover={{ scaleY: 1.5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              Tài Nguyên
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Ví Dụ Lừa Đảo', icon: '🎭', action: 'phishing', description: '12 ví dụ thực tế', count: '12+' },
                { name: 'Bài Nghiên Cứu', icon: '📝', action: 'blog', description: 'Phân tích chuyên sâu', count: '24+' },
                { name: 'Tài Liệu', icon: '🔬', action: 'research', description: 'Tài liệu chính thống', count: '18+' },
                { name: 'Hướng Dẫn', icon: '🎓', action: 'tutorials', description: 'Video hướng dẫn', count: '15+' },
                { name: 'Tools & Utilities', icon: '🛠️', action: 'tools', description: 'Công cụ miễn phí', count: '8+' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <button 
                    onClick={() => {
                      setShowResources(true);
                      setActiveTab(item.action);
                    }}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3 group text-sm w-full text-left p-2 rounded-lg hover:bg-white/5"
                  >
                    <span className="text-base w-6 text-center">{item.icon}</span>
                    <div className="flex-1">
                      <span className="group-hover:font-medium block">{item.name}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">{item.count}</span>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="text-cyan-400"
                      >
                        <FiArrowRight className="text-sm" />
                      </motion.div>
                    </div>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
              <motion.div 
                className="w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full"
                whileHover={{ scaleY: 1.5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              Liên Hệ & Hỗ Trợ
            </h3>
            <div className="space-y-6 text-sm">
              {[
                { 
                  icon: FiMail, 
                  title: 'Email hỗ trợ', 
                  detail: 'support@securemail.com',
                  subdetail: 'Phản hồi trong 2 giờ',
                  color: 'from-purple-500/20 to-pink-500/20',
                  iconColor: 'text-purple-400',
                  action: () => window.open('mailto:support@securemail.com')
                },
                { 
                  icon: FiPhone, 
                  title: 'Hotline 24/7', 
                  detail: '0972 807 015',
                  subdetail: 'Hỗ trợ kỹ thuật',
                  color: 'from-blue-500/20 to-cyan-500/20',
                  iconColor: 'text-blue-400',
                  action: () => window.open('tel:0972807015')
                },
                { 
                  icon: FiMapPin, 
                  title: 'Trụ sở chính', 
                  detail: 'TP. Hà Nội, Việt Nam',
                  subdetail: 'Tòa nhà Viettel, Dịch Vọng',
                  color: 'from-cyan-500/20 to-green-500/20',
                  iconColor: 'text-cyan-400',
                  action: () => handleExternalLink('https://maps.google.com')
                },
                { 
                  icon: FiClock, 
                  title: 'Giờ làm việc', 
                  detail: 'Thứ 2 - Thứ 6',
                  subdetail: '8:00 - 18:00',
                  color: 'from-orange-500/20 to-red-500/20',
                  iconColor: 'text-orange-400',
                  action: null
                }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={contact.action}
                >
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <contact.icon className={`text-lg ${contact.iconColor}`} />
                  </motion.div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-400 group-hover:text-white transition-colors">
                      {contact.title}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors font-semibold">
                      {contact.detail}
                    </div>
                    <div className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">
                      {contact.subdetail}
                    </div>
                  </div>
                  {contact.action && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="text-cyan-400"
                    >
                      <FiExternalLink size={16} />
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div 
                className="flex gap-3 mt-8 justify-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: FiFacebook, color: 'hover:bg-blue-500/20 hover:border-blue-400/50', label: 'Facebook', url: '#' },
                  { icon: FiTwitter, color: 'hover:bg-cyan-500/20 hover:border-cyan-400/50', label: 'Twitter', url: '#' },
                  { icon: FiLinkedin, color: 'hover:bg-blue-600/20 hover:border-blue-500/50', label: 'LinkedIn', url: '#' },
                  { icon: FiMessageCircle, color: 'hover:bg-green-500/20 hover:border-green-400/50', label: 'Zalo', url: '#' }
                ].map((social, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleExternalLink(social.url)}
                    className={`w-12 h-12 bg-white/5 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/10 transition-all duration-300 ${social.color} text-gray-400 hover:text-white group relative`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <social.icon className="text-lg" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {social.label}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div 
              className="text-center md:text-left text-sm text-gray-500 flex items-center gap-2 flex-wrap justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <span>© 2024 SecureMail Technologies</span>
              <span className="text-gray-400 font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                SecureMail
              </span>
              <span className="flex items-center gap-1">
                <span>Made with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiHeart className="text-pink-400 inline mx-1" />
                </motion.div>
                <span>in Vietnam</span>
              </span>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-6 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { name: 'Chính Sách Bảo Mật', url: '#' },
                { name: 'Điều Khoản Dịch Vụ', url: '#' },
                { name: 'Cookie', url: '#' },
                { name: 'Khiếu Nại', url: '#' },
                { name: 'Tuyển Dụng', url: '#' }
              ].map((item, index) => (
                <motion.button 
                  key={index}
                  onClick={() => handleExternalLink(item.url)}
                  className="text-gray-500 hover:text-gray-300 transition-colors duration-300 text-xs relative group"
                  whileHover={{ y: -1 }}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
      </footer>

      {/* Resource Modal */}
      <ResourceModal />

      {/* Fullscreen Phishing Example */}
      <AnimatePresence>
        {fullscreenExample && (
          <FullscreenPhishingExample 
            exampleId={fullscreenExample} 
            onClose={() => setFullscreenExample(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}