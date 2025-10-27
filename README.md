🎓 Hệ thống học tập trực tuyến dựa trên quyền truy cập Zero Trust
Được phát triển bởi Nhóm ZTATeam6 — An toàn. Có khả năng mở rộng. Thông minh.

🧩 Tổng quan
Dự án này triển khai Mô hình Truy cập Zero Trust (ZTNA) cho Nền tảng Học tập Trực tuyến , đảm bảo không có thực thể nào — người dùng, thiết bị hoặc dịch vụ — được mặc định tin cậy.
Mỗi yêu cầu truy cập đều được xác thực, ủy quyền và giám sát liên tục.

Hệ thống có tính năng kiểm soát truy cập phân cấp theo vai trò , giám sát thời gian thực và phân tích bảo mật , cung cấp môi trường học tập thông minh và an toàn cho mọi người dùng.

🚀 Các tính năng chính
🔐 Xác thực Zero Trust – Mọi yêu cầu truy cập đều được xác minh (JWT / OAuth2)
👥 Quản lý vai trò và phân cấp – Quyền đa cấp (Học viên → Giảng viên → Trưởng nhóm → Quản trị viên)
🧑‍🏫 Quản lý khóa học và nội dung – Tải lên, chỉnh sửa và quản lý tài liệu học tập
📊 Bảng điều khiển thời gian thực – Theo dõi số liệu về người dùng, phiên và hoạt động
🕵️ Ghi nhật ký và kiểm tra hoạt động – Theo dõi hoạt động và sự kiện của người dùng chi tiết
⚠️ Phát hiện bất thường – Xác định các mẫu đăng nhập bất thường và IP bất thường
📡 API an toàn – Được bảo vệ bởi HTTPS, WAF và giới hạn tốc độ
🔧 Công cụ quản trị – Quản lý người dùng, chỉ định vai trò và theo dõi hiệu suất
🧱 Kiến trúc Zero Trust
🔑 Nguyên tắc bảo mật cốt lõi
Không bao giờ tin tưởng, luôn xác minh – Xác thực tại mọi điểm truy cập
Quyền truy cập ít đặc quyền nhất – Giới hạn quyền chỉ đối với những quyền cần thiết
Phân đoạn vi mô – Phân lập tài nguyên và dịch vụ theo vùng bảo mật
Giám sát liên tục – Nhật ký kiểm tra thời gian thực và theo dõi sự kiện
Mô hình hệ thống
┌─────────────────────────────┐
│       🧑‍💻 Client Layer       │
│  (Web Browser / Mobile App) │
└──────────────┬──────────────┘
               │ HTTPS / REST API
               ▼
┌─────────────────────────────┐
│  🚪 API Gateway / Auth Service │
│ - Handles authentication & tokens  │
│ - Enforces Zero Trust policies     │
│ - Routes verified requests         │
└──────────────┬──────────────┘
               │ Internal secure channel
               ▼
┌─────────────────────────────┐
│ ⚙️ Service Layer (Business Logic) │
│ - Processes learning operations     │
│ - Applies RBAC & validation rules   │
│ - Interacts with database securely  │
└──────────────┬──────────────┘
               │ SQL / NoSQL queries + audit logs
               ▼
┌─────────────────────────────┐
│ 🗄️ Data & Monitoring Layer   │
│ - Database (MySQL / MongoDB) │
│ - Audit logs & event records │
│ - Monitoring (Grafana, ELK)  │
└─────────────────────────────┘
🧰 Công nghệ Stack
Thành phần	Công nghệ
Giao diện người dùng	Phản ứng (Vite)
Phần cuối	Node.js (Express)
Cơ sở dữ liệu	MongoDB
Xác thực	JWT / OAuth2
DevOps / CI-CD	GitHub
Giao thức bảo mật	HTTPS, MFA, WAF
⚙️ Cài đặt & Thiết lập
1️⃣ Yêu cầu hệ thống
Node.js ≥ 18
Java ≥ 17 (nếu là Spring Boot backend)
MongoDB ≥ 6.0
🔮 Cải tiến trong tương lai 🤖 Kiểm soát truy cập thích ứng dựa trên AI

💬 Công cụ trò chuyện và cộng tác thời gian thực

🌐 Triển khai đa thuê bao cho các tổ chức

🔐 Tích hợp với hệ thống Zero Trust Network Access (ZTNA)
