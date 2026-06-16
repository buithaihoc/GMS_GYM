-- SCHEMA KHỞI TẠO CƠ SỞ DỮ LIỆU QUAN HỆ (POSTGRESQL)
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM - GMS)
--
-- GHI CHÚ: Hiện tại dự án đang ở giai đoạn phát triển Frontend sử dụng Mock Database (localStorage)
-- Schema này được lưu trữ cho mục đích tham khảo và sẽ được sử dụng khi triển khai Backend (Node.js + PostgreSQL)
-- 
-- Dữ liệu seed hiện tại được lưu trong file: seed.json
-- Để khởi tạo cơ sở dữ liệu thực tế, hãy chạy:
--   psql -U postgres -d gym_gms_db -f schema.sql
--   psql -U postgres -d gym_gms_db -f seed.sql (khi seed.sql được cập nhật từ seed.json)

-- 1. BẢNG HỘI VIÊN (members)
CREATE TABLE members (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    qr_code VARCHAR(50) UNIQUE NOT NULL,
    cccd VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. BẢNG GÓI DỊCH VỤ (packages)
CREATE TABLE packages (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('classic', 'pt', 'class', 'swimming')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    duration_months INT NOT NULL CHECK (duration_months > 0),
    sessions INT CHECK (sessions > 0 OR sessions IS NULL)
);

-- 3. BẢNG NHÂN SỰ VÀ HUẤN LUYỆN VIÊN (staff)
-- Gộp chung nhân viên hành chính và PT (HLV) để quản lý đồng nhất tài khoản và phân quyền
CREATE TABLE staff (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'receptionist', 'pt')),
    password_hash VARCHAR(255) NOT NULL,
    specialty VARCHAR(200), -- Chỉ áp dụng cho role = 'pt'
    shift VARCHAR(100) NOT NULL DEFAULT 'Ca Sáng (06:00 - 14:00)'
);

-- 4. BẢNG ĐĂNG KÝ GÓI TẬP CỦA HỘI VIÊN (member_packages)
CREATE TABLE member_packages (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    package_id VARCHAR(20) NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    remaining_sessions INT CHECK (remaining_sessions >= 0 OR remaining_sessions IS NULL),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    CONSTRAINT check_date_range CHECK (end_date >= start_date)
);

-- 5. BẢNG LỊCH SỬ CHECK-IN (check_ins)
CREATE TABLE check_ins (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) REFERENCES members(id) ON DELETE SET NULL, -- NULL đối với khách vãng lai
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) NOT NULL CHECK (type IN ('auto', 'manual', 'dropin')),
    guest_name VARCHAR(100), -- Chỉ dùng cho type = 'dropin'
    guest_phone VARCHAR(15)  -- Chỉ dùng cho type = 'dropin'
);

-- 6. BẢNG BUỔI TẬP PT CÁ NHÂN (sessions)
CREATE TABLE sessions (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    pt_id VARCHAR(20) NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    date_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    booking_type VARCHAR(20) NOT NULL DEFAULT 'ondemand' CHECK (booking_type IN ('ondemand', 'fixed'))
);

-- 7. BẢNG CHỈ SỐ SINH TRẮC HỌC (biometrics)
CREATE TABLE biometrics (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5, 2) NOT NULL CHECK (weight > 0),
    body_fat NUMERIC(4, 1) CHECK (body_fat >= 0 AND body_fat <= 100),
    muscle_mass NUMERIC(5, 2) CHECK (muscle_mass >= 0),
    waist NUMERIC(5, 2) CHECK (waist >= 0)
);

-- 8. BẢNG GIAO DỊCH VÀ HÓA ĐƠN (transactions)
CREATE TABLE transactions (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) REFERENCES members(id) ON DELETE SET NULL, -- NULL cho khách vãng lai (dropin)
    guest_details VARCHAR(200), -- Chi tiết khách vãng lai nếu member_id = NULL
    package_name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'dropin')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('banking', 'cash', 'card')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'reversed'))
);

-- 9. BẢNG ĐĂNG KÝ HOÀN GIAO DỊCH / ĐẢO GIAO DỊCH (reversals)
CREATE TABLE reversals (
    id VARCHAR(20) PRIMARY KEY,
    transaction_id VARCHAR(20) NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG LỚP HỌC NHÓM (group_classes)
CREATE TABLE group_classes (
    id VARCHAR(20) PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    trainer_id VARCHAR(20) NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    day_of_week VARCHAR(20) NOT NULL,
    time VARCHAR(50) NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0)
);

-- 11. BẢNG ĐĂNG KÝ LỚP HỌC NHÓM (group_class_bookings)
CREATE TABLE group_class_bookings (
    id VARCHAR(20) PRIMARY KEY,
    member_id VARCHAR(20) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    class_id VARCHAR(20) NOT NULL REFERENCES group_classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'attended', 'cancelled')),
    CONSTRAINT unique_member_class_date UNIQUE (member_id, class_id, date)
);

-- 12. BẢNG KHÁCH HÀNG TIỀM NĂNG (leads)
CREATE TABLE leads (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    note TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE
);


-- TẠO CÁC INDEX TỐI ƯU TRUY VẤN
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_check_ins_member ON check_ins(member_id);
CREATE INDEX idx_check_ins_timestamp ON check_ins(timestamp);
CREATE INDEX idx_sessions_pt_date ON sessions(pt_id, date_time);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_group_bookings_date ON group_class_bookings(date);
