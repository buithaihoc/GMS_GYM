# Hướng Dẫn Cài Đặt và Khởi Chạy Hệ Thống Quản Lý Phòng Gym (Gym GMS)

Chào mừng bạn đến với dự án **Hệ thống Quản lý Phòng Gym (Gym GMS)**. Dự án hiện đã hỗ trợ chạy ở hai chế độ song song: **Mock Database (LocalStorage)** và **PostgreSQL Database** thông qua một máy chủ Backend trung gian.

---

## 🛠 Stack Công Nghệ & Kiến Trúc
* **Frontend**: React 19 + Vite 8 + Lucide Icons + Tailwind CSS / Custom CSS
* **Backend**: Node.js + Express API Server
* **Database**: PostgreSQL 18 (Quan hệ thực tế) hoặc LocalStorage (Để test nhanh offline)

---

## 🚀 Hướng Dẫn Triển Khai & Khởi Chạy Từng Bước

### Bước 1: Chuẩn Bị & Nạp Cơ Sở Dữ Liệu PostgreSQL

1. Đảm bảo máy tính của bạn đã cài đặt **PostgreSQL** (khuyên dùng phiên bản 16 trở lên, mặc định trong hướng dẫn là phiên bản 18).
2. Tạo một cơ sở dữ liệu trống có tên là `gym_gms_db`. Bạn có thể tạo qua pgAdmin hoặc mở terminal chạy dòng lệnh:
   ```bash
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE gym_gms_db;"
   ```
3. Di chuyển terminal vào thư mục `database/` của dự án:
   ```bash
   cd database
   ```
4. Thiết lập encoding UTF-8 để không bị lỗi font chữ tiếng Việt và nạp cấu trúc bảng cùng dữ liệu mẫu:
   ```bash
   $env:PGCLIENTENCODING="utf-8"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d gym_gms_db -f schema.sql
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d gym_gms_db -f seed.sql
   ```
   *(Nhập mật khẩu tài khoản `postgres` của bạn khi hệ thống yêu cầu)*.

---

### Bước 2: Cấu Hình & Khởi Chạy Backend Server

1. Mở một cửa sổ Terminal mới và chuyển vào thư mục `backend/`:
   ```bash
   cd backend
   ```
2. Mở file [backend/.env](file:///d:/Học Tập/2025.2/gym_gms/backend/.env) bằng trình soạn thảo mã nguồn và cập nhật mật khẩu PostgreSQL chính xác của bạn tại biến `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://postgres:MAT_KHAU_CUA_BAN@localhost:5432/gym_gms_db
   ```
3. Cài đặt các thư viện dependencies cần thiết:
   ```bash
   npm install
   ```
4. Khởi chạy Server ở chế độ phát triển (sử dụng nodemon tự động restart khi lưu file):
   ```bash
   npm run dev
   ```
   *Khi thành công, server sẽ chạy tại cổng `5000` và hiển thị thông báo kết nối DB thành công.*

---

### Bước 3: Khởi Chạy Frontend React

1. Mở một cửa sổ Terminal mới tại thư mục gốc của dự án (`gym_gms`):
   ```bash
   cd "d:\Học Tập\2025.2\gym_gms"
   ```
2. Khởi chạy ứng dụng client:
   ```bash
   npm run dev
   ```
3. Truy cập đường dẫn hiển thị trên trình duyệt (thường là `http://localhost:5173`).

---

## 🔄 Chế Độ Chuyển Đổi Kép (Hybrid Database Mode)

Để bảo đảm hệ thống hoạt động ổn định và có thể thử nghiệm an toàn:
* **Mặc định**: Ứng dụng React sẽ lưu trữ và tương tác trực tiếp qua **Mock DB (LocalStorage)**. Chế độ này có nút màu cam **"Mock DB"** trên Header.
* **Chuyển sang PostgreSQL**: Bấm vào nút màu cam **"Mock DB"** trên Header $\rightarrow$ nút chuyển thành màu xanh lá **"PostgreSQL"**. Lúc này, toàn bộ dữ liệu sẽ được đọc/ghi thông qua REST API kết nối trực tiếp với PostgreSQL.
* **Tính năng tự động Fallback (Cứu hộ)**: Nếu Server Backend hoặc PostgreSQL gặp sự cố mất kết nối, hệ thống sẽ tự động hiển thị thông báo và chuyển chế độ về **Mock DB** để người dùng tiếp tục thao tác không bị gián đoạn.
