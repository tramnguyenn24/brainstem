# Brainstem - Campaign Management System

Hệ thống quản lý chiến dịch marketing và học viên với tính năng tracking kênh truyền thông và tính toán ROI tự động.

## 🚀 Tính năng chính

### ✨ Tính năng mới (Latest Updates)

Xem chi tiết tại [FEATURES.md](./FEATURES.md)

1. **Quản lý Chiến dịch nâng cao**
   - Hỗ trợ nhiều kênh truyền thông cho mỗi chiến dịch
   - Tự động tính ROI: `(revenue - cost) / cost * 100%`
   - Tracking số HVTN và số HV mới theo từng kênh
   - Popup chi tiết với bảng thống kê theo kênh

2. **Quản lý Khóa học**
   - Tạo và quản lý khóa học
   - Tự động tính doanh thu từ khóa học học viên đăng ký
   - Liên kết học viên với khóa học

3. **Form đăng ký thông minh**
   - Tự động hỏi về kênh truyền thông khi tạo form cho chiến dịch
   - Tự động tạo Lead với channelId khi submit form
   - Tracking HVTN theo từng kênh tự động

4. **Metrics tự động**
   - Tính toán số HVTN, số HV mới, doanh thu tự động
   - Breakdown metrics theo từng kênh truyền thông
   - Hiển thị tỉ lệ chuyển đổi

## 📁 Cấu trúc Project

```
brainstem/
├── client/          # Next.js Frontend
│   ├── src/app/
│   │   ├── chiendich/    # Quản lý chiến dịch
│   │   ├── forms/        # Quản lý form
│   │   ├── hocvien/      # Quản lý học viên
│   │   └── hvtiemnang/   # Quản lý học viên tiềm năng
│   └── package.json
│
├── server/          # Express.js Backend
│   ├── controllers/      # API Controllers
│   ├── routes/           # API Routes
│   ├── db/
│   │   ├── entities/    # TypeORM Entities
│   │   └── migrations/   # Database Migrations
│   └── package.json
│
├── FEATURES.md      # 📖 Tài liệu chi tiết các tính năng mới
└── README.md        # File này
```

## 🛠️ Cài đặt và Chạy

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 12
- npm hoặc yarn

### Backend Setup

```bash
cd server
npm install

# Tạo file .env từ env.example
cp env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Chạy migrations
npm run db:migrate:run

# Chạy server
npm run dev
# Server chạy tại http://localhost:3001
```

### Frontend Setup

```bash
cd client
npm install

# Tạo file .env.local (nếu cần)
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Chạy development server
npm run dev
# Client chạy tại http://localhost:3000
```

## 📚 API Documentation

### Campaigns API

- `GET /api/campaigns` - Danh sách chiến dịch
- `GET /api/campaigns/:id` - Chi tiết chiến dịch
- `GET /api/campaigns/:id/details` - Chi tiết với thông tin kênh truyền thông
- `GET /api/campaigns/:id/metrics` - Metrics với breakdown theo kênh
- `POST /api/campaigns` - Tạo chiến dịch mới (hỗ trợ nhiều kênh)
- `PUT /api/campaigns/:id` - Cập nhật chiến dịch
- `DELETE /api/campaigns/:id` - Xóa chiến dịch

### Courses API

- `GET /api/courses` - Danh sách khóa học
- `GET /api/courses/:id` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id` - Cập nhật khóa học
- `DELETE /api/courses/:id` - Xóa khóa học

### Forms API

- `GET /api/forms` - Danh sách form
- `GET /api/forms/:id` - Chi tiết form
- `POST /api/forms` - Tạo form mới (tự động thêm trường hỏi kênh)
- `POST /api/forms/:id/submit` - Submit form (tự động tạo Lead với channelId)
- `PUT /api/forms/:id` - Cập nhật form
- `DELETE /api/forms/:id` - Xóa form

Xem đầy đủ API tại [server/README.md](./server/README.md)

## 🎯 Các tính năng chính

### 1. Quản lý Chiến dịch

- ✅ Tạo chiến dịch với nhiều kênh truyền thông
- ✅ Theo dõi chi phí, doanh thu, ROI tự động
- ✅ Tracking số HVTN và số HV mới
- ✅ Xem metrics chi tiết theo từng kênh

### 2. Quản lý Form

- ✅ Tạo form đăng ký với builder
- ✅ Tự động hỏi về kênh truyền thông
- ✅ Submit form tự động tạo Lead
- ✅ Embed form vào website

### 3. Quản lý Học viên

- ✅ Quản lý học viên tiềm năng (Leads)
- ✅ Quản lý học viên đã đăng ký
- ✅ Liên kết với khóa học để tính doanh thu

### 4. Báo cáo & Thống kê

- ✅ Dashboard với các metrics tổng quan
- ✅ Báo cáo theo chiến dịch
- ✅ Báo cáo theo kênh truyền thông
- ✅ Báo cáo doanh thu

## 📖 Tài liệu chi tiết

- [FEATURES.md](./FEATURES.md) - Tài liệu chi tiết các tính năng mới
- [server/README.md](./server/README.md) - Tài liệu API và Backend
- [client/README.md](./client/README.md) - Tài liệu Frontend

## 🔧 Tech Stack

### Backend
- Express.js
- TypeORM
- PostgreSQL
- Node.js

### Frontend
- Next.js 15
- React 18
- CSS Modules
- React Hot Toast

## 📝 License

MIT

## 👥 Contributors

- tramnguyenn24

## 🔗 Links

- Repository: https://github.com/tramnguyenn24/brainstem.git

