-- KỊCH BẢN NẠP DỮ LIỆU MẪU (SEED DATA FOR POSTGRESQL)
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM - GMS)
--
-- GHI CHÚ QUAN TRỌNG:
-- - Hiện tại dự án đang ở giai đoạn phát triển Frontend với Mock Database (localStorage)
-- - File này chỉ được sử dụng khi triển khai Backend thực tế với PostgreSQL
-- - Dữ liệu mẫu được lưu trữ trong định dạng JSON ở file: seed.json
-- - Hãy chạy file schema.sql trước khi chạy kịch bản này
-- - Tất cả password mẫu hiện tại là 'GMS@1234', nhưng trong production cần hash bằng bcrypt/argon2
--
-- Cách sử dụng:
--   psql -U postgres -d gym_gms_db -f schema.sql
--   psql -U postgres -d gym_gms_db -f seed.sql

-- 1. NẠP DỮ LIỆU BẢNG GÓI DỊCH VỤ (packages)
INSERT INTO packages (id, name, type, price, duration_months, sessions) VALUES
('PKG-001', 'Gói Tập Phổ Thông 1 Tháng', 'classic', 550000.00, 1, NULL),
('PKG-002', 'Gói Tập Phổ Thông 6 Tháng', 'classic', 2700000.00, 6, NULL),
('PKG-003', 'Hội Viên V.I.P 12 Tháng', 'classic', 4800000.00, 12, NULL),
('PKG-PT10', 'Gói Huấn Luyện PT 10 Buổi', 'pt', 3500000.00, 2, 10),
('PKG-PT30', 'Gói Huấn Luyện PT 30 Buổi', 'pt', 9000000.00, 6, 30),
('PKG-YOGA', 'Lớp Yoga Cơ Bản 1 Tháng', 'class', 800000.00, 1, NULL),
('PKG-ZUMBA', 'Lớp Zumba Sôi Động 1 Tháng', 'class', 750000.00, 1, NULL),
('PKG-SWIM', 'Vé Bơi Lội 1 Tháng', 'swimming', 600000.00, 1, NULL);

-- 2. NẠP DỮ LIỆU BẢNG HỘI VIÊN (members)
-- Mật khẩu mẫu lưu dưới dạng text thô 'GMS@1234' (trong hệ thống thực tế sẽ hash bằng bcrypt/argon2)
INSERT INTO members (id, name, phone, email, qr_code, cccd, status, join_date, password_hash) VALUES
('MB-001', 'Nguyễn Hoàng Nam', '0901234567', 'nam.nh@gmail.com', 'QR_MB_001', '012345678901', 'active', '2026-01-15', 'GMS@1234'),
('MB-002', 'Trần Thị Mai', '0912345678', 'mai.tt@gmail.com', 'QR_MB_002', '012345678902', 'active', '2026-03-10', 'GMS@1234'),
('MB-003', 'Lê Minh Tuấn', '0987654321', 'tuan.lm@gmail.com', 'QR_MB_003', '012345678903', 'expired', '2025-12-01', 'GMS@1234'),
('MB-004', 'Phan Văn Minh', '0908777001', 'minh.pv@gmail.com', 'QR_MB_004', '012345678904', 'active', '2026-02-20', 'GMS@1234'),
('MB-005', 'Trần Thị Hồng', '0970616021', 'hong.tt@gmail.com', 'QR_MB_005', '012345678905', 'active', '2026-04-05', 'GMS@1234'),
('MB-006', 'Võ Quốc Bảo', '0933445566', 'bao.vq@gmail.com', 'QR_MB_006', '012345678906', 'active', '2026-01-28', 'GMS@1234'),
('MB-007', 'Nguyễn Thu Hà', '0945112233', 'ha.nt@gmail.com', 'QR_MB_007', '012345678907', 'active', '2026-05-10', 'GMS@1234'),
('MB-008', 'Bùi Trọng Nghĩa', '0911887766', 'nghia.bt@gmail.com', 'QR_MB_008', '012345678908', 'active', '2026-03-22', 'GMS@1234'),
('MB-009', 'Lý Thị Lan', '0922334455', 'lan.lt@gmail.com', 'QR_MB_009', '012345678909', 'expired', '2025-11-15', 'GMS@1234');

-- 3. NẠP DỮ LIỆU BẢNG NHÂN SỰ VÀ HLV (staff)
INSERT INTO staff (id, name, email, phone, role, password_hash, specialty, shift) VALUES
('PT-001', 'HLV Hoàng Long (Gym/Cardio)', 'long.pt@gym.com', '0966111222', 'pt', 'GMS@1234', 'Giảm mỡ, tăng cơ', 'Ca Sáng (06:00 - 14:00)'),
('PT-002', 'HLV Minh Anh (Yoga/Pilates)', 'anh.pt@gym.com', '0966333444', 'pt', 'GMS@1234', 'Kéo giãn cơ, Yoga trị liệu', 'Ca Chiều (14:00 - 22:00)'),
('ST-001', 'Nguyễn Lễ Tân', 'receptionist@gym.com', '0900111222', 'receptionist', 'GMS@1234', NULL, 'Ca Sáng (06:00 - 14:00)'),
('ST-002', 'Trần Lễ Tân', 'receptionist2@gym.com', '0900333444', 'receptionist', 'GMS@1234', NULL, 'Ca Chiều (14:00 - 22:00)'),
('AD-001', 'Nguyễn Minh Quản Lý', 'admin@gym.com', '0911222333', 'admin', 'GMS@1234', NULL, 'Toàn Thời Gian');

-- 4. NẠP DỮ LIỆU ĐĂNG KÝ GÓI TẬP (member_packages)
INSERT INTO member_packages (id, member_id, package_id, start_date, end_date, remaining_sessions, status) VALUES
('MP-001', 'MB-001', 'PKG-002', '2026-03-10', '2026-09-10', NULL, 'active'),
('MP-002', 'MB-001', 'PKG-PT10', '2026-06-01', '2026-08-01', 8, 'active'),
('MP-003', 'MB-002', 'PKG-001', '2026-06-01', '2026-07-01', NULL, 'active'),
('MP-004', 'MB-003', 'PKG-001', '2025-12-01', '2026-01-01', NULL, 'expired'),
('MP-005', 'MB-004', 'PKG-003', '2026-02-20', '2027-02-20', NULL, 'active'),
('MP-006', 'MB-004', 'PKG-PT30', '2026-03-01', '2026-09-01', 22, 'active'),
('MP-007', 'MB-005', 'PKG-YOGA', '2026-06-05', '2026-07-05', NULL, 'active'),
('MP-008', 'MB-006', 'PKG-002', '2026-01-28', '2026-07-28', NULL, 'active'),
('MP-009', 'MB-007', 'PKG-ZUMBA', '2026-06-10', '2026-07-10', NULL, 'active'),
('MP-010', 'MB-008', 'PKG-PT10', '2026-06-22', '2026-08-22', 3, 'active'),
('MP-011', 'MB-009', 'PKG-001', '2025-11-15', '2025-12-15', NULL, 'expired');

-- 5. NẠP LỊCH SỬ CHECK-IN (check_ins)
INSERT INTO check_ins (id, member_id, timestamp, type, guest_name, guest_phone) VALUES
('CI-001', 'MB-001', '2026-06-10 08:15:00+07', 'auto', NULL, NULL),
('CI-002', 'MB-002', '2026-06-10 17:30:00+07', 'manual', NULL, NULL),
('CI-003', 'MB-001', '2026-06-11 09:00:00+07', 'auto', NULL, NULL),
('CI-004', 'MB-004', '2026-06-10 07:45:00+07', 'auto', NULL, NULL),
('CI-005', 'MB-005', '2026-06-10 06:05:00+07', 'auto', NULL, NULL),
('CI-006', 'MB-006', '2026-06-11 08:30:00+07', 'manual', NULL, NULL),
('CI-007', 'MB-007', '2026-06-11 19:10:00+07', 'auto', NULL, NULL),
('CI-008', 'MB-008', '2026-06-09 07:00:00+07', 'auto', NULL, NULL),
('CI-009', 'MB-004', '2026-06-11 07:50:00+07', 'auto', NULL, NULL),
('CI-010', 'MB-008', '2026-06-11 07:05:00+07', 'auto', NULL, NULL),
('CI-011', 'MB-007', '2026-06-12 19:00:00+07', 'auto', NULL, NULL);

-- 6. NẠP BUỔI TẬP PT CÁ NHÂN (sessions)
INSERT INTO sessions (id, member_id, pt_id, date_time, status, booking_type) VALUES
('SS-001', 'MB-001', 'PT-001', '2026-06-05 07:00:00', 'completed', 'ondemand'),
('SS-002', 'MB-001', 'PT-001', '2026-06-08 07:00:00', 'completed', 'ondemand'),
('SS-003', 'MB-001', 'PT-001', '2026-06-16 07:00:00', 'confirmed', 'ondemand'),
('SS-004', 'MB-004', 'PT-001', '2026-06-10 09:00:00', 'completed', 'fixed'),
('SS-005', 'MB-004', 'PT-001', '2026-06-12 09:00:00', 'confirmed', 'fixed'),
('SS-006', 'MB-004', 'PT-001', '2026-06-14 09:00:00', 'confirmed', 'fixed'),
('SS-007', 'MB-004', 'PT-001', '2026-06-17 09:00:00', 'confirmed', 'fixed'),
('SS-008', 'MB-004', 'PT-001', '2026-06-19 09:00:00', 'confirmed', 'fixed'),
('SS-009', 'MB-004', 'PT-001', '2026-06-21 09:00:00', 'confirmed', 'fixed'),
('SS-010', 'MB-004', 'PT-001', '2026-06-24 09:00:00', 'confirmed', 'fixed'),
('SS-011', 'MB-004', 'PT-001', '2026-06-26 09:00:00', 'confirmed', 'fixed'),
('SS-012', 'MB-004', 'PT-001', '2026-06-28 09:00:00', 'confirmed', 'fixed'),
('SS-013', 'MB-008', 'PT-001', '2026-06-13 07:30:00', 'confirmed', 'ondemand'),
('SS-014', 'MB-008', 'PT-001', '2026-06-20 07:30:00', 'confirmed', 'ondemand'),
('SS-015', 'MB-008', 'PT-001', '2026-06-27 07:30:00', 'confirmed', 'ondemand');

-- 7. NẠP CHỈ SỐ SINH TRẮC HỌC (biometrics)
INSERT INTO biometrics (id, member_id, date, weight, body_fat, muscle_mass, waist) VALUES
('BM-001', 'MB-001', '2026-05-01', 78.5, 22.4, 33.2, 88),
('BM-002', 'MB-001', '2026-05-15', 77.2, 21.0, 33.8, 86),
('BM-003', 'MB-001', '2026-06-01', 76.0, 19.8, 34.2, 84),
('BM-004', 'MB-002', '2026-06-01', 52.0, 26.5, 20.1, 68),
('BM-005', 'MB-004', '2026-03-01', 92.0, 28.0, 38.5, 98),
('BM-006', 'MB-004', '2026-04-15', 89.5, 25.8, 39.2, 95),
('BM-007', 'MB-004', '2026-06-01', 86.2, 23.1, 40.1, 92),
('BM-008', 'MB-005', '2026-06-01', 55.0, 24.0, 22.5, 70),
('BM-009', 'MB-006', '2026-02-10', 70.0, 18.5, 31.0, 82),
('BM-010', 'MB-006', '2026-05-10', 68.5, 17.2, 32.0, 80),
('BM-011', 'MB-008', '2026-04-01', 83.0, 21.0, 36.5, 90),
('BM-012', 'MB-008', '2026-06-01', 81.0, 19.5, 37.5, 88);

-- 8. NẠP GIAO DỊCH VÀ HÓA ĐƠN (transactions)
INSERT INTO transactions (id, member_id, guest_details, package_name, amount, type, payment_method, timestamp, status) VALUES
('TX-001', 'MB-001', NULL, 'Gói Tập Phổ Thông 6 Tháng', 2700000.00, 'sale', 'banking', '2026-03-10 10:00:00+07', 'completed'),
('TX-002', 'MB-001', NULL, 'Gói Huấn Luyện PT 10 Buổi', 3500000.00, 'sale', 'banking', '2026-06-01 14:30:00+07', 'completed'),
('TX-003', 'MB-002', NULL, 'Gói Tập Phổ Thông 1 Tháng', 550000.00, 'sale', 'cash', '2026-06-01 09:15:00+07', 'completed'),
('TX-004', 'MB-003', NULL, 'Gói Tập Phổ Thông 1 Tháng', 550000.00, 'sale', 'cash', '2025-12-01 10:00:00+07', 'completed'),
('TX-005', 'MB-004', NULL, 'Hội Viên V.I.P 12 Tháng', 4800000.00, 'sale', 'banking', '2026-02-20 11:00:00+07', 'completed'),
('TX-006', 'MB-004', NULL, 'Gói Huấn Luyện PT 30 Buổi', 9000000.00, 'sale', 'banking', '2026-03-01 10:00:00+07', 'completed'),
('TX-007', 'MB-005', NULL, 'Lớp Yoga Cơ Bản 1 Tháng', 800000.00, 'sale', 'cash', '2026-06-05 08:00:00+07', 'completed'),
('TX-008', 'MB-006', NULL, 'Gói Tập Phổ Thông 6 Tháng', 2700000.00, 'sale', 'banking', '2026-01-28 14:00:00+07', 'completed'),
('TX-009', 'MB-007', NULL, 'Lớp Zumba Sôi Động 1 Tháng', 750000.00, 'sale', 'cash', '2026-06-10 09:00:00+07', 'completed'),
('TX-010', 'MB-008', NULL, 'Gói Huấn Luyện PT 10 Buổi', 3500000.00, 'sale', 'banking', '2026-06-22 13:00:00+07', 'completed'),
('TX-011', 'MB-009', NULL, 'Gói Tập Phổ Thông 1 Tháng', 550000.00, 'sale', 'cash', '2025-11-15 10:00:00+07', 'completed');

-- 9. NẠP LỚP HỌC NHÓM (group_classes)
INSERT INTO group_classes (id, class_name, trainer_id, day_of_week, time, max_capacity) VALUES
('GC-001', 'Lớp Yoga Bình Minh', 'PT-002', 'Thứ 2', '06:00 - 07:30', 15),
('GC-002', 'Lớp Yoga Trị Liệu', 'PT-002', 'Thứ 4', '18:00 - 19:30', 15),
('GC-003', 'Lớp Zumba Sôi Động', 'PT-002', 'Thứ 6', '19:00 - 20:30', 20);

-- 10. NẠP ĐẶT CHỖ LỚP HỌC NHÓM (group_class_bookings)
INSERT INTO group_class_bookings (id, member_id, class_id, date, status) VALUES
('GB-001', 'MB-005', 'GC-001', '2026-06-09', 'attended'),
('GB-002', 'MB-005', 'GC-001', '2026-06-16', 'booked'),
('GB-003', 'MB-005', 'GC-002', '2026-06-11', 'attended'),
('GB-004', 'MB-007', 'GC-003', '2026-06-13', 'booked'),
('GB-005', 'MB-007', 'GC-003', '2026-06-20', 'booked');


-- 11. NẠP KHÁCH HÀNG TIỀM NĂNG (leads)
INSERT INTO leads (id, name, phone, email, note, date) VALUES
('LD-001', 'Phạm Tiến Dũng', '0909888999', 'dung.pt@gmail.com', 'Quan tâm gói 12 tháng + PT', '2026-06-10'),
('LD-002', 'Hoàng Thanh Thủy', '0988777666', 'thuy.ht@gmail.com', 'Đăng ký tập thử gói Yoga', '2026-06-11');

