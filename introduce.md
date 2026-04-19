# HTMS — Hệ Thống Quản Lý Khách Sạn

**HTMS** (Hotel Management System) là ứng dụng web full-stack quản lý toàn bộ vận hành khách sạn — đặt phòng, thanh toán, dịch vụ, thông báo thời gian thực — với phân quyền 3 vai trò rõ ràng. Giao diện Angular 19 SSR kết hợp backend Spring Boot 3 cho hiệu năng cao và SEO tốt.

---

## Vai Trò & Quyền Truy Cập

| Role | Mô Tả |
|---|---|
| **USER** (Khách hàng) | Đặt phòng, thêm dịch vụ, thanh toán, xem lịch sử, đánh giá phòng sau khi hoàn tất lưu trú |
| **STAFF** (Nhân viên) | Quản lý phòng + hình ảnh, xem/xử lý toàn bộ đặt phòng, quản lý danh mục dịch vụ, xem feedback |
| **ACCOUNTANT** (Kế toán) | Xem hóa đơn, doanh thu, báo cáo tài chính; không chỉnh sửa dữ liệu nghiệp vụ |

> Phân quyền được áp dụng cả ở API (`@PreAuthorize`) lẫn Angular route guards — người dùng chỉ truy cập được đúng dữ liệu của mình.

---

## Tính Năng Nổi Bật

### Đặt Phòng & Quản Lý Phòng
- Phòng chia 3 hạng: Standard, Deluxe, Suite; lọc theo loại, giá, trạng thái
- Gallery nhiều ảnh mỗi phòng, hỗ trợ Cloudinary URL + upload file cục bộ
- Đặt phòng theo ngày hoặc theo đêm, kèm ghi chú yêu cầu đặc biệt
- Vòng đời đặt phòng: Confirmed → Completed / Cancelled

### Dịch Vụ Bổ Sung
- Danh mục dịch vụ sẵn có: Breakfast, Spa, Laundry, Airport Shuttle, Dinner, Bicycle Rental, Afternoon Tea
- Thêm nhiều dịch vụ vào cùng một đặt phòng với số lượng tùy chọn
- Hỗ trợ ghi đè đơn giá per-booking (price override)

### Thanh Toán & Hóa Đơn
- Hóa đơn chi tiết: tiền phòng + dịch vụ + thuế = tổng
- Theo dõi phương thức thanh toán (tiền mặt / chuyển khoản) và trạng thái (Paid / Unpaid)
- Kế toán xem báo cáo doanh thu tổng hợp; export PDF và Excel ngay trên trình duyệt
- Biểu đồ thống kê tích hợp Chart.js

### Đánh Giá & Phản Hồi
- Khách chỉ đánh giá được sau khi đặt phòng ở trạng thái Completed — tránh spam
- Rating 1–5 sao + bình luận văn bản
- Hiển thị điểm trung bình mỗi phòng (public, không cần đăng nhập)
- Khách sửa/xóa đánh giá của chính mình

### Thông Báo Thời Gian Thực
- WebSocket (STOMP + SockJS): nhận thông báo ngay lập tức không cần reload
- Gửi thông báo đơn lẻ hoặc broadcast hàng loạt
- Lưu thông báo vào DB, đánh dấu đã đọc / đọc tất cả
- Email tự động gửi bất đồng bộ qua Gmail SMTP (`@Async`)

### Quản Trị & Báo Cáo
- Dashboard riêng theo từng role
- Tìm kiếm user nâng cao: lọc theo role, status, tên, email, số điện thoại
- Export báo cáo đặt phòng / hóa đơn ra PDF (html2canvas + jsPDF) và Excel (XLSX)

### Kiến Trúc & Bảo Mật
- JWT HS512, token 24h, stateless — không lưu session phía server
- BCrypt strength 10 cho mật khẩu
- Angular SSR (Server-Side Rendering) — thân thiện SEO, tốc độ tải trang đầu nhanh
- Swagger/OpenAPI tự động từ annotation, sẵn sàng cho dev/test

---

## Công Nghệ Sử Dụng

| Tầng | Công Nghệ |
|---|---|
| **Frontend** | Angular 19.2, TypeScript 5.7, RxJS 7.8, Angular Universal SSR |
| **HTTP Client** | Axios 1.10 |
| **Charts & Export** | Chart.js 4.5, jsPDF 3 + autotable, html2canvas 1.4, XLSX 0.18 |
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, Spring WebSocket |
| **ORM / SQL** | MyBatis 3.0.4 |
| **Auth** | JJWT 0.11.5 (HS512), BCrypt |
| **Email** | Spring Mail + Gmail SMTP |
| **Database** | MySQL 8.x |
| **API Docs** | SpringDoc OpenAPI 2.8.5 (Swagger UI) |
| **Build** | Maven (backend), npm / Node.js (frontend) |
| **Deploy** | PM2, Nginx, systemctl (Angular SSR service) |
| **Media** | Cloudinary CDN / local file upload |

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu
- Java 21+, Maven 3.8+
- Node.js 20+, npm 10+
- MySQL 8.x

### 1. Database

```sql
-- Tạo database và import schema
CREATE DATABASE htms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql -u root -p htms < DB/htms.sql
```

### 2. Backend

```bash
cd backend

# Cấu hình kết nối DB trong src/main/resources/application.yml
# spring.datasource.url / username / password

mvn clean package -DskipTests
java -jar target/HTMS-0.0.1-SNAPSHOT.jar
# Mặc định chạy port 8081
```

### 3. Frontend

```bash
cd frontend

npm install

# Cấu hình API URL trong src/constants.ts
# export const API_URL = 'http://localhost:8081'

# Development
npm run start          # http://localhost:4200

# Production build (SSR)
npm run build
npm run serve:ssr:frontend
```

### 4. Tài Khoản Mặc Định (từ DB seed)

| Username | Password | Role |
|---|---|---|
| `admin` | `123456` | STAFF |
| `accountant` | `123456` | ACCOUNTANT |
| `user1` | `123456` | USER |

> Đổi mật khẩu ngay sau khi triển khai lên môi trường production.

---

## Cấu Hình Nhanh

```yaml
# backend/src/main/resources/application.yml (các giá trị cần thay)
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/htms
    username: YOUR_DB_USER
    password: YOUR_DB_PASSWORD
  mail:
    username: YOUR_GMAIL
    password: YOUR_APP_PASSWORD

app:
  jwt:
    secret: YOUR_BASE64_SECRET_MIN_64_BYTES
```

```typescript
// frontend/src/constants.ts
export const API_URL = 'http://localhost:8081';      // hoặc domain production
export const CLOUDINARY_BASE = 'https://res.cloudinary.com/YOUR_CLOUD/...';
```

---

*HTMS — Giải pháp quản lý khách sạn hoàn chỉnh, sẵn sàng tùy biến và mở rộng.*
