# Tính năng mới - Campaign Management System

Tài liệu này mô tả các tính năng mới đã được thêm vào hệ thống quản lý chiến dịch.

## 📋 Mục lục

1. [Quản lý Chiến dịch (Campaign Management)](#1-quản-lý-chiến-dịch-campaign-management)
2. [Quản lý Khóa học (Course Management)](#2-quản-lý-khóa-học-course-management)
3. [Kênh Truyền thông (Communication Channels)](#3-kênh-truyền-thông-communication-channels)
4. [Form đăng ký Chiến dịch](#4-form-đăng-ký-chiến-dịch)
5. [Tính toán Metrics tự động](#5-tính-toán-metrics-tự-động)

---

## 1. Quản lý Chiến dịch (Campaign Management)

### 1.1. Các trường mới trong Campaign

**Vị trí:** `server/db/entities/Campaign.js`, `client/src/app/chiendich/`

**Các trường đã thêm:**
- `revenue` (Doanh thu): Tự động tính từ khóa học học viên đăng ký
- `cost` (Chi phí): Tổng chi phí từ tất cả các kênh truyền thông
- `potentialStudentsCount` (Số HVTN): Số học viên tiềm năng từ form đăng ký
- `newStudentsCount` (Số HV mới): Số học viên mới đã đăng ký khóa học

**Tính năng:**
- ✅ Tự động tính ROI: `(revenue - cost) / cost * 100%`
- ✅ Hiển thị tỉ lệ HV mới trên số người đăng ký chiến dịch
- ✅ Hỗ trợ nhiều kênh truyền thông cho mỗi chiến dịch

### 1.2. UI Thêm/Sửa Chiến dịch

**Vị trí:** `client/src/app/chiendich/add/page.jsx`

**Tính năng mới:**
- ✅ Form hỗ trợ thêm nhiều kênh truyền thông
- ✅ Tự động tính tổng chi phí từ các kênh
- ✅ Nhập doanh thu (sẽ được tính tự động từ khóa học)
- ✅ Hiển thị các trường: Doanh thu, Chi phí, Số HVTN, Số HV mới

**Cách sử dụng:**
1. Vào trang `/chiendich/add`
2. Điền thông tin chiến dịch
3. Nhấn "Thêm kênh" để thêm các kênh truyền thông
4. Nhập chi phí cho từng kênh (tự động tính tổng)
5. Nhập doanh thu (hoặc để hệ thống tự tính từ khóa học)

### 1.3. Popup Chi tiết Chiến dịch

**Vị trí:** `client/src/app/chiendich/page.jsx`

**Tính năng:**
- ✅ Hiển thị đầy đủ thông tin chiến dịch
- ✅ Bảng thống kê theo từng kênh truyền thông:
  - Tên kênh
  - Chi phí
  - Số HVTN từ kênh đó
  - Số HV mới từ kênh đó
  - Doanh thu từ kênh đó
- ✅ Hiển thị tỉ lệ HV mới

**Cách xem:**
- Nhấn nút "Xem" trên bất kỳ chiến dịch nào trong danh sách

---

## 2. Quản lý Khóa học (Course Management)

### 2.1. Database Schema

**Vị trí:** `server/db/entities/Course.js`, `server/db/migrations/1700000000002-AddCampaignFeatures.js`

**Bảng `courses`:**
- `id`: ID khóa học
- `name`: Tên khóa học
- `description`: Mô tả
- `price`: Giá khóa học (để tính doanh thu)
- `status`: Trạng thái (active/inactive)

**Bảng `students`:**
- Thêm trường `course_id`: Liên kết học viên với khóa học

### 2.2. API Endpoints

**Vị trí:** `server/controllers/coursesController.js`, `server/routes/courses.js`

**Endpoints:**
- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Lấy chi tiết khóa học
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id` - Cập nhật khóa học
- `DELETE /api/courses/:id` - Xóa khóa học

### 2.3. Tính doanh thu tự động

**Vị trí:** `server/controllers/campaignsController.js` - hàm `calculateCampaignMetrics()`

**Cách hoạt động:**
- Khi học viên đăng ký khóa học, hệ thống tự động tính doanh thu
- Doanh thu = tổng giá các khóa học mà học viên đã đăng ký trong chiến dịch đó

---

## 3. Kênh Truyền thông (Communication Channels)

### 3.1. Hỗ trợ nhiều kênh cho mỗi chiến dịch

**Vị trí:** `server/db/entities/CampaignChannel.js`

**Bảng `campaign_channels`:**
- Quan hệ nhiều-nhiều giữa Campaign và Channel
- Mỗi kênh có chi phí riêng
- Tự động tính tổng chi phí từ tất cả kênh

### 3.2. Metrics theo từng kênh

**Vị trí:** `server/controllers/campaignsController.js` - hàm `getCampaignChannels()`

**Tính năng:**
- Đếm số HVTN từ từng kênh (dựa vào `leads.channelId`)
- Đếm số HV mới từ từng kênh (dựa vào `students.channelId` và `newStudent = true`)
- Tính doanh thu từ từng kênh (dựa vào khóa học học viên đăng ký)

**API:**
- `GET /api/campaigns/:id/details` - Lấy chi tiết chiến dịch với thông tin kênh
- `GET /api/campaigns/:id/metrics` - Lấy metrics với breakdown theo kênh

---

## 4. Form đăng ký Chiến dịch

### 4.1. Tự động hỏi về kênh truyền thông

**Vị trí:** 
- `server/controllers/formsController.js` - hàm `create()` và `update()`
- `client/src/app/forms/page.jsx`

**Tính năng:**
- ✅ Khi tạo form mới và chọn chiến dịch, hệ thống tự động thêm trường:
  - **Câu hỏi:** "Bạn biết chiến dịch qua kênh nào?"
  - **Loại:** Dropdown (select)
  - **Options:** Tự động lấy từ danh sách kênh trong database
- ✅ Form builder hỗ trợ nhập options cho trường select

**Cách sử dụng:**
1. Vào trang `/forms`
2. Nhấn "Tạo Form mới"
3. Chọn chiến dịch → Trường hỏi về kênh tự động xuất hiện
4. Có thể chỉnh sửa options hoặc thêm trường khác

### 4.2. API Submit Form

**Vị trí:** `server/controllers/formsController.js` - hàm `submitForm()`

**Endpoint:** `POST /api/forms/:id/submit`

**Tính năng:**
- ✅ Tự động tạo Lead từ form submission
- ✅ Tự động map kênh truyền thông từ form data sang `channelId`
- ✅ Hỗ trợ nhiều định dạng tên trường (channel, channelId, kenh, kenhtruyenthong)
- ✅ Tự động tính HVTN cho kênh đó

**Request body:**
```json
{
  "data": {
    "fullName": "Nguyễn Văn A",
    "email": "email@example.com",
    "phone": "0123456789",
    "kenhtruyenthong": "FB ads"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "leadId": 123
}
```

---

## 5. Tính toán Metrics tự động

### 5.1. ROI tự động

**Vị trí:** `server/controllers/campaignsController.js` - hàm `calculateROI()`

**Công thức:** `ROI = (revenue - cost) / cost * 100%`

**Tính năng:**
- ✅ Tự động tính khi tạo/cập nhật chiến dịch
- ✅ Tự động cập nhật khi metrics thay đổi
- ✅ Hiển thị dạng phần trăm (%)

### 5.2. Metrics Campaign

**Vị trí:** `server/controllers/campaignsController.js` - hàm `calculateCampaignMetrics()`

**Tính toán tự động:**
- **Số HVTN:** Đếm số leads có `campaignId` = ID chiến dịch
- **Số HV mới:** Đếm số students có `campaignId` và `newStudent = true`
- **Doanh thu:** Tổng giá các khóa học mà học viên đã đăng ký

**API:** `GET /api/campaigns/:id/metrics`

**Response:**
```json
{
  "id": 1,
  "potentialStudentsCount": 150,
  "newStudentsCount": 45,
  "revenue": 45000000,
  "cost": 10000000,
  "roi": 350.0,
  "conversionRate": 30.0,
  "channels": [
    {
      "channelId": 1,
      "channelName": "FB ads",
      "cost": 5000000,
      "potentialStudentsCount": 80,
      "newStudentsCount": 25,
      "revenue": 25000000
    }
  ]
}
```

---

## 📁 Cấu trúc File

### Backend (Server)

```
server/
├── db/
│   ├── entities/
│   │   ├── Campaign.js          # ✅ Đã cập nhật: thêm revenue, cost, potentialStudentsCount, newStudentsCount
│   │   ├── CampaignChannel.js   # ✅ MỚI: Quan hệ nhiều-nhiều Campaign-Channel
│   │   ├── Course.js            # ✅ MỚI: Entity quản lý khóa học
│   │   └── Student.js           # ✅ Đã cập nhật: thêm courseId
│   └── migrations/
│       └── 1700000000002-AddCampaignFeatures.js  # ✅ MỚI: Migration cho các tính năng mới
├── controllers/
│   ├── campaignsController.js    # ✅ Đã cập nhật: tính ROI, metrics theo kênh
│   ├── coursesController.js     # ✅ MỚI: Controller quản lý khóa học
│   └── formsController.js       # ✅ Đã cập nhật: tự động hỏi kênh, submit form
└── routes/
    ├── campaigns.js             # ✅ Đã cập nhật: thêm endpoint /details
    └── courses.js               # ✅ MỚI: Routes cho courses
```

### Frontend (Client)

```
client/src/app/
├── chiendich/
│   ├── add/
│   │   └── page.jsx             # ✅ Đã cập nhật: hỗ trợ nhiều kênh, các trường mới
│   └── page.jsx                 # ✅ Đã cập nhật: popup chi tiết với bảng kênh
├── forms/
│   └── page.jsx                 # ✅ Đã cập nhật: tự động thêm trường kênh, hỗ trợ options
└── api/
    └── campaign/
        └── campaignService.js   # ✅ Đã cập nhật: thêm getCampaignDetails()
```

---

## 🚀 Cách sử dụng

### 1. Chạy Migration

```bash
cd server
npm run db:migrate:run
```

Migration sẽ tạo:
- Bảng `courses`
- Bảng `campaign_channels`
- Thêm các cột mới vào `campaigns`
- Thêm `course_id` vào `students`

### 2. Tạo Khóa học

```bash
POST /api/courses
{
  "name": "IELTS Foundation",
  "description": "Khóa học IELTS cơ bản",
  "price": 5000000,
  "status": "active"
}
```

### 3. Tạo Chiến dịch với nhiều kênh

```bash
POST /api/campaigns
{
  "name": "Chiến dịch mùa hè 2024",
  "status": "running",
  "channels": [
    { "channelId": 1, "cost": 5000000 },
    { "channelId": 2, "cost": 3000000 }
  ]
}
```

### 4. Tạo Form đăng ký

- Vào `/forms` → Tạo form mới
- Chọn chiến dịch → Trường hỏi về kênh tự động xuất hiện
- Form sẽ tự động có trường dropdown với danh sách kênh

### 5. Submit Form

```bash
POST /api/forms/:id/submit
{
  "data": {
    "fullName": "Nguyễn Văn A",
    "email": "email@example.com",
    "phone": "0123456789",
    "kenhtruyenthong": "FB ads"
  }
}
```

→ Tự động tạo Lead với `channelId` tương ứng

### 6. Xem Metrics

```bash
GET /api/campaigns/:id/metrics
```

→ Trả về metrics với breakdown theo từng kênh

---

## 📊 Luồng hoạt động

1. **Tạo chiến dịch** → Thêm các kênh truyền thông với chi phí
2. **Tạo form** → Tự động có trường hỏi về kênh
3. **Khách hàng điền form** → Chọn kênh truyền thông
4. **Submit form** → Tạo Lead với `channelId` → Tính là HVTN cho kênh đó
5. **Học viên đăng ký khóa học** → Gán `courseId` → Tính doanh thu tự động
6. **Xem chi tiết chiến dịch** → Hiển thị metrics theo từng kênh, ROI tự động

---

## ✅ Checklist tính năng

- [x] Tạo bảng courses và entity Course
- [x] Tạo bảng campaign_channels (nhiều kênh cho mỗi chiến dịch)
- [x] Thêm các trường: revenue, cost, potentialStudentsCount, newStudentsCount
- [x] Tự động tính ROI: (revenue - cost)/cost * 100%
- [x] Cập nhật UI thêm/sửa chiến dịch để hỗ trợ nhiều kênh
- [x] Tạo popup hiển thị chi tiết chiến dịch với thông tin kênh
- [x] Cập nhật API để tính toán và hiển thị metrics theo từng kênh
- [x] Form đăng ký tự động hỏi về kênh truyền thông
- [x] API submit form tự động tạo lead với channelId
- [x] Tính doanh thu tự động từ khóa học học viên đăng ký

---

## 📝 Ghi chú

- Tất cả metrics được tính tự động và cập nhật real-time
- ROI được tính theo công thức chuẩn: `(revenue - cost) / cost * 100%`
- Form tự động thêm trường hỏi về kênh khi có `campaignId`
- Hệ thống hỗ trợ nhiều định dạng tên trường để tìm kênh trong form data

