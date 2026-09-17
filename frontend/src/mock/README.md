# Frontend mock mode (`VITE_IS_TEST`)

## Bật / tắt mock

| Giá trị `VITE_IS_TEST` | Hành vi |
|---|---|
| `"true"` (đúng chuỗi này) | Mock: **không** có request tới backend. Adapter axios chặn mọi call. |
| `"false"` hoặc không khai báo | Backend thật — logic client giữ nguyên. |

- Biến `VITE_*` được Vite nhúng lúc **build / start**. Đổi `.env` → **bắt buộc restart** `npm run dev`.
- File mẫu: `.env.example`. Dev mặc định: `.env.development` (`true`). Prod: `.env.production` (`false`).
- Override local: tạo `.env.local` (không commit nếu chứa secret).

```bash
# Mock
VITE_IS_TEST=true npm run dev

# Backend thật
VITE_IS_TEST=false npm run dev
```

Cờ được đọc **một lần** tại `src/config/env.js`. Chặn mạng tại **một chỗ**: `src/api/axiosClient.js` (axios `adapter` + dynamic `import('../mock/adapter.js')`).

`VITE_IS_TEST` **chưa từng** được dùng trước task này (đã grep toàn repo) — không xung đột quick-login / bypass auth.

## Tài khoản demo (theo role)

Mật khẩu chung: `abc123456`

| Username | Role | Ghi chú |
|---|---|---|
| `ttb` | USER | Khách — có booking/feedback seed |
| `ptt`, `lhd`, `dth`, `btq`, `cmt`, `nttr`, `hmt` | USER | Khách khác |
| `ntminh` | STAFF | Nhân viên |
| `nva` | ACCOUNTANT | Kế toán |
| `inactive` | USER | **Fixture** — status Inactive → login 401 |

Quick-fill trên AuthModal vẫn dùng `ttb` / `ntminh` / `nva` — khớp mock.

## Seed vs fixture

Nguồn seed: `DB/htms.sql` (không có Java seeder). ID `INT AUTO_INCREMENT` ổn định sau seed.

| Entity | Trong seed SQL | Trong mock | Ghi chú |
|---|---|---|---|
| UserAccount | 10 users | + `inactive` | **Fixture** thêm tài khoản Inactive |
| Room | 10 phòng (101–110) | + **18** phòng tên thật (201–218) | Fixture: không còn "Mock Wing"; ảnh Unsplash unique HTTP 200 |
| RoomImage | 10 | + 18 | Mỗi phòng 1 ảnh main, URL không trùng |
| HotelService | 7 | 7 | Seed |
| Booking | 15 | 15 (+ runtime khi đặt) | Seed |
| Service (booking line) | 6 | 6 | Seed — frontend hiện không gọi |
| PaymentInvoice | 15 | 15 (+ runtime) | Seed; tạo booking mock cũng sinh invoice snapshot |
| Feedback | 5 | 5 | Seed |
| Included / Notification | không có dữ liệu seed | không mock UI | Frontend React hiện không gọi |

**Nhóm chỉ có trong mock (fixture):** 18 phòng tên thật (Palm Courtyard → Infinity Crown Suite), user `inactive`, invoice phát sinh khi đặt phòng trong phiên.

Lý do sinh JSON thủ công từ `DB/htms.sql`: seed dùng ID `INT` tuần tự ổn định — gán ID cố định, tránh `Math.random()` / UUID.

## Những thứ sống qua reload

| Mục | Cơ chế | Lý do |
|---|---|---|
| `localStorage.token` | Auth cũ | AuthContext khôi phục session sau F5 — **không** phải do mock |
| `localStorage.user` | Auth cũ | Cùng trên |
| Cookie session HTTP | **Không dùng** | App dùng Bearer + localStorage, không cookie auth |
| Giỏ hàng guest / coupon | **Không có** | Frontend hiện tại không lưu |
| Dữ liệu nghiệp vụ mock (rooms, bookings…) | In-memory store | Reload → về JSON gốc |
| Upload / object URL | `store.sessionUploads` | Chỉ sống trong phiên; reload mất |

## Upload

Mock chưa có UI upload trên frontend React hiện tại. Nếu gọi endpoint upload chưa handler → **501** + `console.error` (`MOCK_UNHANDLED_501`). File (nếu bổ sung sau) chỉ sống trong phiên (object URL / base64), không ghi localStorage.

## Độ phủ endpoint

### Đã mock (dùng bởi `src/api/*` hoặc backend cùng nhóm)

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/users/login` | |
| POST | `/api/users` | register |
| POST | `/api/users/logout` | |
| GET | `/api/users` | STAFF |
| GET | `/api/users/search` | LIKE bỏ dấu |
| GET | `/api/users?userIds=` | |
| GET | `/api/users/:username` | USER chỉ xem mình → 403 |
| PUT | `/api/users/:username` | |
| POST | `/api/users/:username/change-password` | |
| GET | `/api/v1/rooms` | public; **không** phân trang server |
| GET | `/api/v1/rooms/search` | cùng filter list |
| GET | `/api/v1/rooms/:id` | |
| POST/PUT/DELETE | `/api/v1/rooms...` | STAFF |
| PUT | `/api/v1/rooms/:id/deactivate` | STAFF |
| GET | `/api/v1/hotel-services` | STAFF/ACCOUNTANT |
| GET/POST/PUT/DELETE | `/api/v1/hotel-services...` | |
| GET | `/api/v1/feedbacks` | cần auth |
| GET | `/api/v1/feedbacks/room/:id` | public |
| GET | `/api/v1/feedbacks/room/:id/average-rating` | |
| GET | `/api/v1/feedbacks/booking/:id` | USER |
| POST/PUT/DELETE | `/api/v1/feedbacks...` | |
| GET | `/api/bookings` | STAFF |
| GET | `/api/bookings/my` | USER |
| GET | `/api/bookings/search` | STAFF |
| GET/POST/PUT/DELETE | `/api/bookings...` | |
| PUT | `/api/bookings/:id/cancel` | cancel lần 2 → 400 |

### Cố ý không mock (kèm lý do)

| Path nhóm | Lý do |
|---|---|
| `/api/v1/payment-invoices/**` | Frontend React hiện **không** gọi |
| `/api/v1/notifications/**` | Không gọi |
| `/api/v1/includeds/**` | Không gọi; bảng không có trong seed UI |
| `/api/v1/room-images/**` | Ảnh nhúng qua Room DTO; không gọi riêng |
| `/api/common/**`, `/health` | Không gọi từ app React |
| `/notification` (MVC view) | Không phải API JSON của SPA |

Gọi nhầm → **501** + log `MOCK_UNHANDLED_501 METHOD /path` (default-deny, không fallthrough mạng).

### Không tồn tại trên backend

| Path | Ghi chú |
|---|---|
| `/api/users/me` | Không có — frontend dùng localStorage user |
| `/api/users/refresh` | Không có — interceptor không refresh |
| `/api/users/register` | Security permit path này nhưng controller là `POST /api/users` |

## Cách thêm endpoint mock mới

1. Thêm handler trong `src/mock/handlers/<domain>.js`, return `{ status, data }` hoặc `null`.
2. Đăng ký trong `src/mock/handlers/index.js`.
3. Mirror đúng shape `Result` / `ResultData` và mã HTTP backend.
4. Thêm case vào `scripts/mock-selftest.mjs`.
5. Cập nhật bảng độ phủ trong README này.

## Đồng bộ JSON khi seed backend đổi

1. Diff `DB/htms.sql` với `src/mock/data/*.json`.
2. Cập nhật JSON tương ứng; giữ nguyên ID ổn định.
3. Fixture chỉ có ở mock → `src/mock/fixtures/`.
4. Chạy `npm run mock:test`.

## Quan sát về backend (quirk đã mirror)

1. **`Result("Success"|"SUCCESS", ...)`** ≠ hằng `Result.SUCCESS` (`"success"`) → `retCode` thường null; frontend đọc `data`, không phụ thuộc `retCode`.
2. **Tạo booking lấy `userId` theo `fullName`** (`equalsIgnoreCase`), không theo JWT — mirror đúng; đổi tên form có thể gán nhầm user.
3. **`GET /api/v1/rooms` không LIMIT** dù `RoomCriteria` extends `Page` — mock cũng bỏ qua `page`/`pageSize`.
4. **Collation thật:** `utf8mb4_unicode_ci` — case-insensitive và (trên MySQL 8 máy này) so khớp bỏ dấu (`Nguyen` = `Nguyễn`). Mock: NFD + strip + `includes`, **không** `RegExp(keyword)`.
5. **Cancel SQL** dùng `'confirmed'`/`'cancelled'` lowercase; ENUM DB là `Confirmed`/`Cancelled` — so sánh ignore-case; cancel lần hai → 400.
6. **Login sai → 401**; frontend **không** có refresh — không kích hoạt refresh.
7. **UserDTO.Resp trả cả `password` (hash)** — mirror.
8. **`GET /api/v1/feedbacks`** cần role; HomePage gọi khi chưa login → 403 (Promise.allSettled nuốt lỗi) — mirror.
9. **`GET /api/v1/hotel-services`** chỉ STAFF/ACCOUNTANT; ServicesPage hiện **hardcode**, không gọi API.
10. Giá booking: mock tính lại từ `room.basePrice × nights + 10% tax`, snapshot vào `PaymentInvoice` — đơn cũ không đổi khi giá phòng đổi.

## Scripts

```bash
npm run mock:test      # self-test (không cần backend / không dò TCP)
npm run build:mock     # bundle mode development (IS_TEST=true)
npm run build:real     # bundle production (IS_TEST=false)
```

## Cấu trúc

```
src/config/env.js          # IS_TEST
src/api/axiosClient.js     # adapter khi IS_TEST
src/mock/
  adapter.js               # delay 200–400ms, deep clone, axios shape
  store.js                 # in-memory
  auth.js                  # JWT 3 đoạn + exp
  handlers/                # users, rooms, bookings, feedbacks, hotelServices
  data/                    # seed JSON
  fixtures/                # dữ liệu chỉ có ở mock
```
