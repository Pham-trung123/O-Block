# 🎓 Hệ thống Học tập Trực tuyến Dựa trên Mô hình Zero Trust

**Được phát triển bởi nhóm ZTATeam6 — An toàn. Có khả năng mở rộng. Thông minh.**

---

## 🧩 Tổng quan

Dự án triển khai **Mô hình Truy cập Zero Trust (ZTNA)** cho nền tảng học tập trực tuyến, đảm bảo **mọi người dùng, thiết bị và dịch vụ đều không được mặc định tin cậy**.  
Mỗi yêu cầu truy cập đều được **xác thực, ủy quyền và giám sát liên tục** trước khi được cấp quyền.

Hệ thống cung cấp:
- Kiểm soát truy cập phân cấp theo vai trò  
- Giám sát hoạt động thời gian thực  
- Phân tích bảo mật tự động  
→ Mang đến một môi trường học tập thông minh, an toàn và tuân thủ nguyên tắc bảo mật hiện đại.

---

## 🚀 Tính năng chính

- 🔐 **Xác thực Zero Trust:** Mọi yêu cầu truy cập được xác minh bằng **JWT / OAuth2**
- 👥 **Quản lý vai trò & phân cấp:** Từ **Học viên → Giảng viên → Trưởng nhóm → Quản trị viên**
- 🧑‍🏫 **Quản lý khóa học & nội dung:** Tải lên, chỉnh sửa, và quản trị tài liệu học tập
- 📊 **Bảng điều khiển thời gian thực:** Theo dõi người dùng, phiên, và hoạt động
- 🕵️ **Nhật ký và kiểm tra:** Ghi lại mọi hành động người dùng và sự kiện hệ thống
- ⚠️ **Phát hiện bất thường:** Nhận diện IP lạ, hành vi đăng nhập nghi vấn
- 📡 **API an toàn:** Bảo vệ bằng **HTTPS, WAF**, và giới hạn tốc độ truy cập
- 🔧 **Công cụ quản trị:** Quản lý người dùng, chỉ định vai trò, xem hiệu suất hệ thống

---

## 🧱 Kiến trúc Zero Trust

### 🔑 Nguyên tắc bảo mật cốt lõi
- **Không bao giờ tin tưởng, luôn xác minh**  
  → Mọi truy cập đều phải qua xác thực và kiểm tra định danh.
- **Quyền truy cập ít đặc quyền nhất**  
  → Người dùng chỉ có quyền đúng với vai trò.
- **Phân đoạn vi mô (Micro-segmentation)**  
  → Tách biệt tài nguyên theo vùng bảo mật.
- **Giám sát liên tục**  
  → Ghi log, phân tích và cảnh báo hoạt động bất thường theo thời gian thực.

---

## 🧠 Mô hình hệ thống


---

## 🧰 Công nghệ Stack

| Thành phần | Công nghệ sử dụng |
|-------------|-------------------|
| **Giao diện người dùng** | React (Vite) |
| **Backend / API** | Node.js (Express) |
| **Cơ sở dữ liệu** | MongoDB |
| **Xác thực & Ủy quyền** | JWT / OAuth2 |
| **DevOps / CI-CD** | GitHub Actions |
| **Bảo mật** | HTTPS, MFA, WAF, Role-based Access |

---

## ⚙️ Cài đặt & Thiết lập
┌─────────────────────────────┐
│ 🧑‍💻 Client Layer │
│ (Web Browser / Mobile App) │
└──────────────┬──────────────┘
│ HTTPS / REST API
▼
┌─────────────────────────────┐
│ 🚪 API Gateway / Auth Service │
│ - Xác thực & cấp token (JWT/OAuth2) │
│ - Áp dụng chính sách Zero Trust │
│ - Kiểm tra và chuyển tiếp yêu cầu hợp lệ │
└──────────────┬──────────────┘
│ Secure Internal Channel
▼
┌─────────────────────────────┐
│ ⚙️ Service Layer (Business Logic) │
│ - Xử lý nghiệp vụ học tập │
│ - Áp dụng RBAC & Validation │
│ - Kết nối database qua channel an toàn │
└──────────────┬──────────────┘
│ SQL / NoSQL + Audit Logs
▼
┌─────────────────────────────┐
│ 🗄️ Data & Monitoring Layer │
│ - Database (MongoDB / MySQL) │
│ - Audit Logs & Event Records │
│ - Monitoring (Grafana / ELK) │
└─────────────────────────────┘

### 1️⃣ Yêu cầu hệ thống
- Node.js ≥ 18  
- MongoDB ≥ 6.0  
- (Tùy chọn) Java ≥ 17 nếu triển khai backend song song bằng Spring Boot  

### 2️⃣ Cài đặt
```bash
# Clone dự án
git clone https://github.com/<username>/ZT-Learning-System.git
cd ZT-Learning-System

# Cài đặt dependencies
npm install
