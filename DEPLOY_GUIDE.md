# HƯỚNG DẪN CHI TIẾT ĐẨY CODE LÊN GITHUB VÀ DEPLOY LÊN VERCEL

Tài liệu này hướng dẫn bạn từng bước một để lưu trữ mã nguồn dự án **Gym GMS** lên GitHub và đưa ứng dụng lên internet (deploy) bằng **Vercel** hoàn toàn miễn phí.

---

## MỤC LỤC
1. [Chuẩn Bị Công Cụ](#1-chuẩn-bị-công-cụ)
2. [Bước 1: Khởi Tạo Git Và Commit Lên Máy Cục Bộ](#bước-1-khởi-tạo-git-và-commit-lên-máy-cục-bộ)
3. [Bước 2: Tạo Repository Trên GitHub Và Đẩy Code Lên](#bước-2-tạo-repository-trên-github-và-đẩy-code-lên)
4. [Bước 3: Deploy Frontend Lên Vercel (Demo Chạy Bằng LocalStorage)](#bước-3-deploy-frontend-lên-vercel-demo-chạy-bằng-localstorage)
5. [Quy Trình Cập Nhật Code Sau Này](#quy-trình-cập-nhật-code-sau-này)
6. [Tùy Chọn Nâng Cao: Đưa Cả Backend & Database Lên Cloud](#tùy-chọn-nâng-cao-đưa-cả-backend--database-lên-cloud)

---

## 1. Chuẩn Bị Công Cụ

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
1. **Git**: Nếu chưa cài đặt, hãy tải về và cài đặt tại [git-scm.com](https://git-scm.com/).
2. **Tài khoản GitHub**: Đăng ký miễn phí tại [github.com](https://github.com/).
3. **Tài khoản Vercel**: Đăng ký miễn phí tại [vercel.com](https://vercel.com/) (Khuyên dùng: Đăng ký bằng tài khoản GitHub để liên kết dễ dàng).

---

## Bước 1: Khởi Tạo Git Và Commit Lên Máy Cục Bộ

1. Mở terminal tại thư mục gốc của dự án `gym_gms` (Ví dụ trong VS Code, chọn **Terminal -> New Terminal**).
2. Tắt các server đang chạy bằng cách nhấn tổ hợp phím `Ctrl + C` trong cửa sổ Terminal.
3. Chạy lệnh sau để khởi tạo Git repository cục bộ:
   ```bash
   git init
   ```
4. Kiểm tra trạng thái các file chuẩn bị commit:
   ```bash
   git status
   ```
   *Lưu ý: File `.gitignore` đã được cấu hình để tự động bỏ qua thư mục `node_modules` và file chứa mật khẩu `.env` của backend, giúp bảo mật và nhẹ repo.*
5. Thêm tất cả các file vào danh sách chuẩn bị lưu:
   ```bash
   git add .
   ```
6. Thực hiện commit đầu tiên để lưu trạng thái code:
   ```bash
   git commit -m "Initial commit: Gym Management System"
   ```

---

## Bước 2: Tạo Repository Trên GitHub Và Đẩy Code Lên

1. Truy cập vào trang web [github.com](https://github.com/) và đăng nhập tài khoản của bạn.
2. Tại trang chủ GitHub, nhấn nút **New** (hoặc dấu cộng **+** ở góc trên cùng bên phải -> chọn **New repository**).
3. Điền các thông tin:
   - **Repository name**: Nhập tên dự án (Ví dụ: `gym-gms` hoặc `gym-management-system`).
   - **Public/Private**: Chọn **Public** (nếu muốn chia sẻ công khai) hoặc **Private** (chỉ mình bạn và những người được mời xem được).
   - **Lưu ý quan trọng**: **KHÔNG** tích chọn bất kỳ mục nào trong phần *"Initialize this repository with"* (như Add a README file, Add .gitignore, Choose a license) vì chúng ta đã có các file này ở local rồi.
4. Nhấn nút **Create repository**.
5. Sau khi tạo xong, GitHub sẽ hiển thị một trang hướng dẫn. Tìm mục **"…or push an existing repository from the command line"** và copy các dòng lệnh đó. Các lệnh có dạng như sau:
   ```bash
   # 1. Đổi tên nhánh mặc định thành 'main' (tiêu chuẩn mới)
   git branch -M main

   # 2. Liên kết mã nguồn local với kho chứa trên GitHub (Thay URL bằng link repo của bạn)
   git remote add origin https://github.com/ten-tai-khoan-cua-ban/gym-gms.git

   # 3. Đẩy code lên GitHub
   git push -u origin main
   ```
6. Dán các lệnh trên vào Terminal của bạn và nhấn Enter.
   - *Nếu đây là lần đầu bạn dùng Git trên máy, một cửa sổ đăng nhập GitHub sẽ hiện ra yêu cầu bạn xác thực liên kết (chỉ cần bấm đăng nhập/cho phép bằng trình duyệt).*
7. Khi lệnh chạy xong và hiện thông báo thành công, hãy F5 lại trang GitHub của bạn để thấy toàn bộ code đã được tải lên!

---

## Bước 3: Deploy Frontend Lên Vercel (Demo Chạy Bằng LocalStorage)

Hệ thống Gym GMS được thiết kế thông minh với chế độ **Hybrid Mode**. Khi ứng dụng được deploy lên Vercel mà không kết nối được Backend local của bạn, nó sẽ **tự động chuyển sang chế độ Mock DB (lưu dữ liệu trực tiếp vào LocalStorage của trình duyệt)**. Điều này giúp bất kỳ ai có đường link Vercel đều có thể trải nghiệm đầy đủ các tính năng: Đăng ký gói tập, điểm danh, tạo hội viên, phân công PT,... mà không bị lỗi đơ hay sập web.

### Các bước deploy:
1. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản **GitHub** của bạn.
2. Tại màn hình Dashboard của Vercel, nhấn nút **Add New...** -> chọn **Project**.
3. Tại phần **Import Git Repository**, bạn sẽ thấy danh sách các dự án trên GitHub của mình. Tìm dự án `gym-gms` (hoặc tên repo bạn đặt ở Bước 2) và nhấn nút **Import**.
4. Cấu hình dự án (Configure Project):
   - **Framework Preset**: Vercel sẽ tự nhận diện là **Vite** (nếu không tự nhận diện, hãy chọn **Vite**).
   - **Root Directory**: Giữ nguyên là `./` (thư mục gốc).
   - **Build and Output Settings**: Giữ nguyên mặc định.
   - **Environment Variables** (Biến môi trường):
     *Không cần cấu hình gì cả*. Khi không có biến môi trường kết nối API, Frontend sẽ tự động kích hoạt chế độ LocalStorage Mock DB để chạy thử nghiệm cực mượt.
5. Nhấn nút **Deploy**.
6. Chờ khoảng 1-2 phút để Vercel build dự án. Khi hoàn thành, màn hình sẽ hiển thị pháo hoa chúc mừng cùng ảnh chụp màn hình dự án của bạn.
7. Nhấn vào ảnh chụp màn hình hoặc nút **Visit** để truy cập trang web đã được online. Bạn có thể copy link này và gửi cho bạn bè hoặc thầy cô test thử!

---

## Quy Trình Cập Nhật Code Sau Này

Mỗi lần bạn chỉnh sửa code ở local và muốn trang web trên Vercel tự động cập nhật theo, bạn chỉ cần thực hiện 3 lệnh Git đơn giản sau:
1. Lưu lại các file đã sửa:
   ```bash
   git add .
   ```
2. Ghi chú nội dung thay đổi:
   ```bash
   git commit -m "Mô tả ngắn gọn những gì bạn đã sửa"
   ```
3. Đẩy code lên GitHub:
   ```bash
   git push origin main
   ```
*Ngay sau khi bạn push, Vercel sẽ tự động phát hiện thay đổi trên GitHub, tự động build lại và cập nhật link web của bạn sau 1 phút mà bạn không cần thao tác gì thêm trên trang Vercel.*

---

## Tùy Chọn Nâng Cao: Đưa Cả Backend & Database Lên Cloud

Nếu bạn muốn deploy một hệ thống Client-Server hoàn chỉnh và dữ liệu được lưu trữ tập trung trên Cloud (không bị lưu riêng lẻ trên từng máy khách qua LocalStorage), bạn cần deploy thêm Database và Backend:

### 1. Cloud Database (Neon / Supabase)
- Đăng ký tài khoản miễn phí tại [Neon.tech](https://neon.tech/) hoặc [Supabase.com](https://supabase.com/).
- Tạo một cơ sở dữ liệu PostgreSQL mới.
- Chạy các câu lệnh SQL trong file [schema.sql](file:///d:/H%E1%BB%8Dc%20T%E1%BA%ADp/2025.2/gym_gms/database/schema.sql) và [seed.sql](file:///d:/H%E1%BB%8Dc%20T%E1%BA%ADp/2025.2/gym_gms/database/seed.sql) trên công cụ Query Editor của họ để tạo bảng và dữ liệu mẫu.
- Lấy đường dẫn kết nối cơ sở dữ liệu (Connection String) dạng `postgres://...`

### 2. Deploy Backend (Render / Koyeb / Railway)
- Tạo tài khoản và liên kết GitHub tại [Render.com](https://render.com/).
- Chọn **New Web Service** và import repo `gym-gms`.
- Cấu hình thư mục chạy Backend:
  - **Root Directory**: `backend`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
- Thêm Biến môi trường (Environment Variables) trong tab Env của Render:
  - Key: `DATABASE_URL` -> Value: *Đường dẫn kết nối PostgreSQL của Neon/Supabase đã lấy ở trên*.
  - Key: `PORT` -> Value: `5000`
- Tiến hành deploy dịch vụ Backend và lấy URL Backend do Render cấp (ví dụ: `https://gym-gms-backend.onrender.com`).

### 3. Cập nhật Frontend kết nối Cloud Backend
- Trên Vercel Dashboard, truy cập dự án của bạn -> chọn **Settings** -> **Environment Variables**.
- Thêm biến môi trường sau:
  - Key: `VITE_API_URL`
  - Value: `https://gym-gms-backend.onrender.com` (Đường dẫn Backend trên Cloud của bạn).
- Vào tab **Deployments** trên Vercel, chọn lượt deploy gần nhất và chọn **Redeploy** để áp dụng biến môi trường mới.
