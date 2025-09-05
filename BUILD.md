Dưới đây là **2 README** tách riêng cho hai project .jar của bạn. Copy nội dung mỗi khối vào file tương ứng (ví dụ `README_hotel_api.md` và `README_uni_intern_api.md`) trong VPS/repo của từng dự án.

---

# README – Hotel System Backend (port 8081)

````markdown
# Hotel System Backend – Run JAR with PM2 (port 8081)

## 1) Yêu cầu môi trường

- Java Runtime: **JDK/JRE 17+** (khuyên dùng 21)
- PM2 (cài global bằng npm): `npm i -g pm2`
- Nginx (nếu public domain)
- Tên miền: **api.hotelsystem.oceanmind.id.vn** phải có bản ghi DNS A trỏ về IP VPS

## 2) Cấu trúc & đường dẫn

- Thư mục: `/home/hotel_system/backend`
- File JAR: `HTMS-0.0.1-SNAPSHOT.jar`
- (Khuyên dùng) symlink cho dễ update:
  ```bash
  ln -sfn /home/hotel_system/backend/HTMS-0.0.1-SNAPSHOT.jar /home/hotel_system/backend/app.jar
  ```
````

## 3) Start bằng PM2

```bash
cd /home/hotel_system/backend

# Chạy server port 8081 (chỉnh profile nếu cần)
pm2 start java --name hotel-be --interpreter none -- \
  -jar /home/hotel_system/backend/app.jar \
  --server.port=8081 \
  --spring.profiles.active=dev     # hoặc bỏ dòng này nếu dùng application.yml mặc định

# Tự khởi động khi reboot
pm2 save
pm2 startup
```

> Tuỳ máy có thể thêm giới hạn RAM cho JVM: `-Xms256m -Xmx512m` (đặt trước `-jar`).

## 4) Kiểm tra nhanh

```bash
pm2 list
pm2 logs hotel-be
curl -I http://127.0.0.1:8081
```

## 5) Nginx reverse proxy (HTTPS)

```
server {
  server_name api.hotelsystem.oceanmind.id.vn;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }

  listen 443 ssl;
  ssl_certificate     /etc/letsencrypt/live/api.hotelsystem.oceanmind.id.vn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.hotelsystem.oceanmind.id.vn/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {
  listen 80;
  server_name api.hotelsystem.oceanmind.id.vn;
  return 301 https://$host$request_uri;
}
```

Áp dụng:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6) Cập nhật JAR (deploy version mới)

```bash
cd /home/hotel_system/backend

# Upload file JAR mới, ví dụ HTMS-0.0.2.jar
ln -sfn /home/hotel_system/backend/HTMS-0.0.2.jar /home/hotel_system/backend/app.jar

# Reload không downtime
pm2 reload hotel-be

# Kiểm tra
pm2 logs hotel-be
```

## 7) Lệnh hữu ích

```bash
pm2 stop hotel-be
pm2 restart hotel-be
pm2 delete hotel-be
pm2 flush hotel-be      # xóa log cũ
sudo ss -lntp | grep 8081
tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 8) Lưu ý

- Nếu app cần ghi vào thư mục (uploads/logs), đảm bảo quyền sở hữu phù hợp:
  `sudo chown -R ocean:ocean /home/hotel_system/backend`
- Nếu gọi API từ trình duyệt bị CORS, cấu hình CORS trong Spring Security hoặc trong profile `application-*.yml`.

```

---
```
