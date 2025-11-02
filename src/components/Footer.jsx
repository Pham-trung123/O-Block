export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-3">SecureMail</h3>
          <p>
            Phát hiện email lừa đảo tiên tiến nhờ AI. Bảo vệ tổ chức và cá nhân khỏi
            các cuộc tấn công mạng.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Liên Kết Nhanh</h3>
          <ul className="space-y-1">
            <li>Trang chủ</li>
            <li>Trình Kiểm Tra Email</li>
            <li>Cơ Sở Dữ Liệu Đe Dọa</li>
            <li>Tài Liệu API</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Tài Nguyên</h3>
          <ul className="space-y-1">
            <li>Ví Dụ Lừa Đảo</li>
            <li>Blog Bảo Mật</li>
            <li>Tài Liệu Nghiên Cứu</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Liên Hệ</h3>
          <p>📧 support@securemail.com</p>
          <p>📞 +84 123 456 789</p>
          <p>📍 TP. Hồ Chí Minh</p>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-8">
        © 2025 SecureMail. Tất cả các quyền được bảo lưu.
      </div>
    </footer>
  );
}
