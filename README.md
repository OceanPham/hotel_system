# 🏨 Hotel Management System (HTMS)

--FE
sudo systemctl restart hotel-ssr
journalctl -u hotel-ssr -f

--BE

# trong thư mục backend (có pom.xml)

.\mvnw.cmd clean package -DskipTests

## 📌 Giới thiệu Dự Án

**HTMS (Hotel Management System)** là một hệ thống phần mềm được xây dựng nhằm **tự động hóa và số hóa toàn bộ quy trình đặt phòng khách sạn**. Hệ thống giúp giảm thiểu thao tác thủ công, tăng hiệu suất vận hành và nâng cao trải nghiệm cho khách hàng.

Với HTMS, khách sạn có thể:

- Quản lý **phòng**, **dịch vụ**, **khách hàng** và **đơn đặt phòng** một cách khoa học, đồng bộ.
- Hỗ trợ **đặt phòng trực tuyến 24/7**, giúp khách hàng dễ dàng tra cứu phòng trống và thanh toán ngay trên website.
- Theo dõi **doanh thu**, **thống kê giao dịch** và xuất **báo cáo tài chính** một cách chính xác, minh bạch.

Hệ thống hỗ trợ đầy đủ chức năng cho 3 vai trò chính:

- **Khách hàng (USER)**: đặt phòng, thanh toán, theo dõi thông tin cá nhân và lịch sử đặt phòng.
- **Nhân viên khách sạn (STAFF)**: quản lý phòng, xử lý đơn đặt, điều phối dịch vụ.
- **Kế toán (ACCOUNTANT)**: theo dõi thống kê doanh thu, xuất báo cáo.

### Cấu trúc hệ thống:

- **Frontend**: xây dựng bằng Angular, giao diện thân thiện, phản hồi nhanh.
- **Backend**: phát triển với Java Spring Boot, sử dụng JWT để xác thực, MyBatis để truy vấn dữ liệu.
- **Database**: MySQL – lưu trữ dữ liệu khách hàng, phòng, đơn đặt và giao dịch.

HTMS hướng đến một giải pháp **tập trung, hiện đại** và **dễ triển khai**, phù hợp với khách sạn vừa và nhỏ đang muốn chuyển đổi số quy trình quản lý của mình.

---

## 🔧 Chức năng Chính

### 👤 Khách hàng (USER)

- Xem phòng, giá, trạng thái trống.
- Đặt phòng, hủy đặt phòng.
- Thanh toán trực tuyến.
- Xem lịch sử đặt phòng.

### 🛎 Nhân viên (STAFF)

- Thêm/sửa/xóa phòng.
- Quản lý dịch vụ: giặt ủi, ăn uống...
- Duyệt và xử lý đơn đặt phòng.
- Chuyển phòng, cập nhật trạng thái.

### 💼 Kế toán (ACCOUNTANT)

- Xem thống kê doanh thu.
- Xuất báo cáo tài chính.
- Kiểm tra thanh toán, giao dịch.

---

## 🛠 Công nghệ Sử dụng

| Thành phần | Công nghệ                          |
| ---------- | ---------------------------------- |
| Backend    | Java 17, Spring Boot, MyBatis, JWT |
| Frontend   | Angular 15+, TypeScript            |
| Database   | MySQL 8.x                          |
| Build Tool | Maven                              |
| IDE        | IntelliJ IDEA, VSCode              |

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1️⃣ Clone mã nguồn

```bash
git clone https://github.com/your-username/htms.git
```

## 2️⃣ Cấu hình Cơ sở Dữ liệu MySQL

### Tạo Database

```sql
CREATE DATABASE htms;
```

## 3️⃣ Chạy Backend (Java Spring Boot)

1. **Mở dự án**: Chọn `File > Open`, chọn thư mục `backend`.

2. **Cấu hình database**:  
   Mở file `application.properties`, sửa thông tin kết nối MySQL:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/htms
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```
3. **Chạy ứng dụng**:
   Tại IntelliJ, click nút ▶️ (Run) hoặc chạy trong terminal:

```bash
./mvnw spring-boot:run
```

## 4️⃣ Chạy Frontend (Angular)

### Cài đặt và chạy ứng dụng:

```properties
cd frontend
npm install       # Cài đặt các package phụ thuộc
ng serve          # Chạy ứng dụng tại http://localhost:4200
```

---

## 💡 Tính năng Kỹ thuật

✅ **JWT Authentication**  
Xác thực người dùng thông qua JSON Web Token. Hệ thống phân quyền theo vai trò (`USER`, `STAFF`, `ACCOUNTANT`) để đảm bảo an toàn và bảo mật dữ liệu.

🔐 **Route Guard (Frontend)**  
Ngăn chặn truy cập trái phép vào các trang giao diện không phù hợp với vai trò người dùng. Tự động điều hướng về trang đúng chức năng.

🛠 **MyBatis (Backend)**  
Sử dụng MyBatis để ánh xạ trực tiếp giữa SQL và Java, giúp truy vấn hiệu suất cao, tối ưu hóa việc bảo trì và mở rộng.

🌐 **RESTful API**  
Backend cung cấp các API chuẩn REST, dễ dàng tích hợp với frontend và các hệ thống khác trong tương lai.

💾 **LocalStorage (Frontend)**  
Lưu trữ thông tin đăng nhập như token, username, role trên trình duyệt để giữ trạng thái phiên làm việc người dùng.

---

## 🔮 Hướng phát triển tương lai

🐳 **Docker Compose**  
Đóng gói toàn bộ hệ thống (backend, frontend, database) để dễ dàng triển khai và chạy ở môi trường server hoặc cloud.

💳 **Tích hợp thanh toán điện tử**  
Thêm chức năng thanh toán qua cổng VNPay, PayPal... phục vụ nhu cầu thanh toán trực tuyến.

📈 **Responsive UI**  
Cải tiến giao diện người dùng thân thiện với thiết bị di động và máy tính bảng (responsive design).

📝 **Đánh giá phòng và dịch vụ**  
Cho phép khách hàng đánh giá chất lượng phòng và dịch vụ sau khi sử dụng, nâng cao trải nghiệm người dùng.

🔔 **Thông báo realtime**  
Sử dụng WebSocket hoặc Firebase để cập nhật trạng thái đơn đặt phòng, nhắc nhở thanh toán và các thông báo nội bộ theo thời gian thực.
