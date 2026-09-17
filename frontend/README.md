# React + Vite — HotelSystem frontend

## Mock data mode

Chi tiết đầy đủ: [`src/mock/README.md`](./src/mock/README.md)

```bash
# Chạy với mock (không cần backend) — mặc định .env.development
npm run dev

# Backend thật
VITE_IS_TEST=false npm run dev

# Self-test mock (không dò cổng TCP)
npm run mock:test
```

Đổi `.env` phải **restart** Vite.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server (port 4200) |
| `npm run build` | Build production |
| `npm run build:real` | Build `VITE_IS_TEST=false` |
| `npm run build:mock` | Build `VITE_IS_TEST=true` |
| `npm run mock:test` | Kiểm thử lớp mock |
| `npm run lint` | Oxlint |

## Expanding the Oxlint configuration

For production apps, prefer TypeScript with type-aware rules. See the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).
