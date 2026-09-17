# Marketing images — HTMS

Viewport mặc định: **1440 × 900**, `fullPage: false`. Chụp từ frontend mock (`http://localhost:4200`).

| File | Trang / nội dung |
|------|------------------|
| `01-home-hero.png` | Trang chủ — Hero + thanh tìm phòng nhanh |
| `02-home-story.png` | Trang chủ — Câu chuyện thương hiệu |
| `03-home-rooms.png` | Trang chủ — Bộ sưu tập phòng & bộ lọc hạng |
| `04-home-services.png` | Trang chủ — Khối dịch vụ 5 sao |
| `05-home-feedbacks.png` | Trang chủ — Đánh giá khách hàng |
| `06-home-cta.png` | Trang chủ — Banner kêu gọi đặt phòng |
| `07-rooms-list.png` | Danh sách phòng (`/rooms`) |
| `08-rooms-filters.png` | Bộ lọc tìm kiếm / hạng / giá trên `/rooms` |
| `09-room-detail.png` | Chi tiết phòng (`/rooms/:id`) |
| `10-services-page.png` | Trang dịch vụ (`/services`) |
| `11-service-booking.png` | Modal đăng ký trải nghiệm dịch vụ |
| `12-contact-page.png` | Liên hệ & FAQ (`/contact`) |
| `13-auth-login.png` | Modal đăng nhập / đăng ký |
| `14-booking-modal.png` | Modal đặt phòng trực tuyến |
| `15-booking-history.png` | Lịch sử đặt phòng (khách đã đăng nhập) |
| `16-quick-booking.png` | Thanh tìm phòng nhanh trên hero |

## Chụp lại

```bash
# Terminal 1: frontend mock
cd frontend && npm run dev

# Terminal 2
cd marketing
npm i
npx playwright install chromium
node capture.mjs
# Nếu cần riêng lịch sử đặt phòng:
node capture-history.mjs
```

**Ghi chú:** Frontend React hiện tại là **storefront công khai** (không có màn quản trị STAFF/ACCOUNTANT trên UI). Ảnh tập trung hành trình khách.
