// DB version – increment this whenever DEFAULT_DB structure changes significantly
// so that stale localStorage data is auto-replaced with fresh seed data.
const DB_VERSION = 5;

const DEFAULT_DB = {
  // ==== MEMBERS ====
  members: [
    { id: "MB-001", name: "Nguyễn Hoàng Nam",  phone: "0901234567", email: "nam.nh@gmail.com",   qrCode: "QR_MB_001", cccd: "012345678901", status: "active",  joinDate: "2026-01-15", password: "GMS@1234" },
    { id: "MB-002", name: "Trần Thị Mai",       phone: "0912345678", email: "mai.tt@gmail.com",   qrCode: "QR_MB_002", cccd: "012345678902", status: "active",  joinDate: "2026-03-10", password: "GMS@1234" },
    { id: "MB-003", name: "Lê Minh Tuấn",       phone: "0987654321", email: "tuan.lm@gmail.com",  qrCode: "QR_MB_003", cccd: "012345678903", status: "expired", joinDate: "2025-12-01", password: "GMS@1234" },
    { id: "MB-004", name: "Phan Văn Minh",       phone: "0908777001", email: "minh.pv@gmail.com",  qrCode: "QR_MB_004", cccd: "012345678904", status: "active",  joinDate: "2026-02-20", password: "GMS@1234" },
    { id: "MB-005", name: "Trần Thị Hồng",       phone: "0970616021", email: "hong.tt@gmail.com",  qrCode: "QR_MB_005", cccd: "012345678905", status: "active",  joinDate: "2026-04-05", password: "GMS@1234" },
    { id: "MB-006", name: "Võ Quốc Bảo",         phone: "0933445566", email: "bao.vq@gmail.com",   qrCode: "QR_MB_006", cccd: "012345678906", status: "active",  joinDate: "2026-01-28", password: "GMS@1234" },
    { id: "MB-007", name: "Nguyễn Thu Hà",        phone: "0945112233", email: "ha.nt@gmail.com",    qrCode: "QR_MB_007", cccd: "012345678907", status: "active",  joinDate: "2026-05-10", password: "GMS@1234" },
    { id: "MB-008", name: "Bùi Trọng Nghĩa",      phone: "0911887766", email: "nghia.bt@gmail.com", qrCode: "QR_MB_008", cccd: "012345678908", status: "active",  joinDate: "2026-03-22", password: "GMS@1234" },
    { id: "MB-009", name: "Lý Thị Lan",           phone: "0922334455", email: "lan.lt@gmail.com",   qrCode: "QR_MB_009", cccd: "012345678909", status: "expired", joinDate: "2025-11-15", password: "GMS@1234" }
  ],
  packages: [
    { id: "PKG-001",  name: "Gói Tập Phổ Thông 1 Tháng",    type: "classic",   price: 550000,  durationMonths: 1,  sessions: null },
    { id: "PKG-002",  name: "Gói Tập Phổ Thông 6 Tháng",    type: "classic",   price: 2700000, durationMonths: 6,  sessions: null },
    { id: "PKG-003",  name: "Hội Viên V.I.P 12 Tháng",      type: "classic",   price: 4800000, durationMonths: 12, sessions: null },
    { id: "PKG-PT10", name: "Gói Huấn Luyện PT 10 Buổi",    type: "pt",        price: 3500000, durationMonths: 2,  sessions: 10 },
    { id: "PKG-PT30", name: "Gói Huấn Luyện PT 30 Buổi",    type: "pt",        price: 9000000, durationMonths: 6,  sessions: 30 },
    { id: "PKG-YOGA", name: "Lớp Yoga Cơ Bản 1 Tháng",      type: "class",     price: 800000,  durationMonths: 1,  sessions: null },
    { id: "PKG-ZUMBA",name: "Lớp Zumba Sôi Động 1 Tháng",   type: "class",     price: 750000,  durationMonths: 1,  sessions: null },
    { id: "PKG-SWIM", name: "Vé Bơi Lội 1 Tháng",           type: "swimming",  price: 600000,  durationMonths: 1,  sessions: null }
  ],
  // ==== MEMBER PACKAGES ====
  // MB-001: Phổ thông 6T (active) + PT10 (active, 8 buổi còn)
  // MB-002: Phổ thông 1T (active) — chỉ vào tập tự do, không có PT
  // MB-003: Phổ thông 1T (expired)
  // MB-004: VIP 12T (active) + PT30 (active, 22 buổi còn)
  // MB-005: Yoga 1T (active)
  // MB-006: Phổ thông 6T (active)
  // MB-007: Zumba 1T (active — sửa startDate/endDate hợp lý)
  // MB-008: PT10 (active — sửa endDate: còn hạn đến 2026-08-22, 3 buổi còn)
  // MB-009: Phổ thông 1T (expired)
  memberPackages: [
    { id: "MP-001", memberId: "MB-001", packageId: "PKG-002",  startDate: "2026-03-10", endDate: "2026-09-10", remainingSessions: null, status: "active" },
    { id: "MP-002", memberId: "MB-001", packageId: "PKG-PT10", startDate: "2026-06-01", endDate: "2026-08-01", remainingSessions: 8,    status: "active" },
    { id: "MP-003", memberId: "MB-002", packageId: "PKG-001",  startDate: "2026-06-01", endDate: "2026-06-20", remainingSessions: null, status: "active" },
    { id: "MP-004", memberId: "MB-003", packageId: "PKG-001",  startDate: "2025-12-01", endDate: "2026-01-01", remainingSessions: null, status: "expired" },
    { id: "MP-005", memberId: "MB-004", packageId: "PKG-003",  startDate: "2026-02-20", endDate: "2027-02-20", remainingSessions: null, status: "active" },
    { id: "MP-006", memberId: "MB-004", packageId: "PKG-PT30", startDate: "2026-03-01", endDate: "2026-09-01", remainingSessions: 22,   status: "active" },
    { id: "MP-007", memberId: "MB-005", packageId: "PKG-YOGA", startDate: "2026-06-05", endDate: "2026-07-05", remainingSessions: null, status: "active" },
    { id: "MP-008", memberId: "MB-006", packageId: "PKG-002",  startDate: "2026-01-28", endDate: "2026-07-28", remainingSessions: null, status: "active" },
    { id: "MP-009", memberId: "MB-007", packageId: "PKG-ZUMBA",startDate: "2026-06-10", endDate: "2026-07-10", remainingSessions: null, status: "active" },
    { id: "MP-010", memberId: "MB-008", packageId: "PKG-PT10", startDate: "2026-06-22", endDate: "2026-08-22", remainingSessions: 3,    status: "active" },
    { id: "MP-011", memberId: "MB-009", packageId: "PKG-001",  startDate: "2025-11-15", endDate: "2025-12-15", remainingSessions: null, status: "expired" }
  ],
  pts: [
    { id: "PT-001", name: "HLV Hoàng Long (Gym/Cardio)",   email: "long.pt@gym.com", phone: "0966111222", specialty: "Giảm mỡ, tăng cơ",          password: "GMS@1234", role: "pt", shift: "Ca Sáng (06:00 - 14:00)" },
    { id: "PT-002", name: "HLV Minh Anh (Yoga/Pilates)",   email: "anh.pt@gym.com",  phone: "0966333444", specialty: "Kéo giãn cơ, Yoga trị liệu", password: "GMS@1234", role: "pt", shift: "Ca Chiều (14:00 - 22:00)" }
  ],
  // ==== CHECK-INS ====
  checkIns: [
    { id: "CI-001", memberId: "MB-001", timestamp: "2026-06-10T08:15:00.000Z", type: "auto" },
    { id: "CI-002", memberId: "MB-002", timestamp: "2026-06-10T17:30:00.000Z", type: "manual" },
    { id: "CI-003", memberId: "MB-001", timestamp: "2026-06-11T09:00:00.000Z", type: "auto" },
    { id: "CI-004", memberId: "MB-004", timestamp: "2026-06-10T07:45:00.000Z", type: "auto" },
    { id: "CI-005", memberId: "MB-005", timestamp: "2026-06-10T06:05:00.000Z", type: "auto" },
    { id: "CI-006", memberId: "MB-006", timestamp: "2026-06-11T08:30:00.000Z", type: "manual" },
    { id: "CI-007", memberId: "MB-007", timestamp: "2026-06-11T19:10:00.000Z", type: "auto" },
    { id: "CI-008", memberId: "MB-008", timestamp: "2026-06-09T07:00:00.000Z", type: "auto" },
    { id: "CI-009", memberId: "MB-004", timestamp: "2026-06-11T07:50:00.000Z", type: "auto" },
    { id: "CI-010", memberId: "MB-008", timestamp: "2026-06-11T07:05:00.000Z", type: "auto" },
    { id: "CI-011", memberId: "MB-007", timestamp: "2026-06-12T19:00:00.000Z", type: "auto" }
  ],
  // ==== PT SESSIONS ====
  // Quy tắc:
  //   - Chỉ hội viên có gói PT active mới có sessions
  //   - MB-001 (MP-002 PT10, ptId PT-001): 8 buổi còn (đã dùng 2 buổi completed)
  //   - MB-004 (MP-006 PT30, ptId PT-001): 22 buổi còn, lịch cố định SR-002 đã approved
  //     → sinh sessions T3+T5+T7 09:00 từ tuần 2026-06-09
  //   - MB-008 (MP-010 PT10, ptId PT-001): 3 buổi còn
  //   - KHÔNG có session của MB-002, MB-003, MB-005, MB-006, MB-007, MB-009
  sessions: [
    // MB-001 — on-demand với PT-001
    { id: "SS-001", memberId: "MB-001", ptId: "PT-001", dateTime: "2026-06-05T07:00", bookingType: "ondemand", status: "completed" },
    { id: "SS-002", memberId: "MB-001", ptId: "PT-001", dateTime: "2026-06-08T07:00", bookingType: "ondemand", status: "completed" },
    { id: "SS-003", memberId: "MB-001", ptId: "PT-001", dateTime: "2026-06-16T07:00", bookingType: "ondemand", status: "confirmed" },
    // MB-004 — lịch cố định T3+T5+T7 09:00 từ SR-002 (approved)
    { id: "SS-004", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-10T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "completed" },
    { id: "SS-005", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-12T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-006", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-14T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-007", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-17T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-008", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-19T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-009", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-21T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-010", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-24T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-011", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-26T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    { id: "SS-012", memberId: "MB-004", ptId: "PT-001", dateTime: "2026-06-28T09:00", bookingType: "fixed", scheduleRequestId: "SR-002", status: "confirmed" },
    // MB-008 — on-demand với PT-001 (3 buổi còn lại)
    { id: "SS-013", memberId: "MB-008", ptId: "PT-001", dateTime: "2026-06-13T07:30", bookingType: "ondemand", status: "confirmed" },
    { id: "SS-014", memberId: "MB-008", ptId: "PT-001", dateTime: "2026-06-20T07:30", bookingType: "ondemand", status: "confirmed" },
    { id: "SS-015", memberId: "MB-008", ptId: "PT-001", dateTime: "2026-06-27T07:30", bookingType: "ondemand", status: "confirmed" }
  ],
  biometrics: [
    // MB-001
    { id: "BM-001", memberId: "MB-001", date: "2026-05-01", weight: 78.5, bodyFat: 22.4, muscleMass: 33.2, waist: 88 },
    { id: "BM-002", memberId: "MB-001", date: "2026-05-15", weight: 77.2, bodyFat: 21.0, muscleMass: 33.8, waist: 86 },
    { id: "BM-003", memberId: "MB-001", date: "2026-06-01", weight: 76.0, bodyFat: 19.8, muscleMass: 34.2, waist: 84 },
    // MB-002
    { id: "BM-004", memberId: "MB-002", date: "2026-06-01", weight: 52.0, bodyFat: 26.5, muscleMass: 20.1, waist: 68 },
    // MB-004
    { id: "BM-005", memberId: "MB-004", date: "2026-03-01", weight: 92.0, bodyFat: 28.0, muscleMass: 38.5, waist: 98 },
    { id: "BM-006", memberId: "MB-004", date: "2026-04-15", weight: 89.5, bodyFat: 25.8, muscleMass: 39.2, waist: 95 },
    { id: "BM-007", memberId: "MB-004", date: "2026-06-01", weight: 86.2, bodyFat: 23.1, muscleMass: 40.1, waist: 92 },
    // MB-005
    { id: "BM-008", memberId: "MB-005", date: "2026-06-01", weight: 55.0, bodyFat: 24.0, muscleMass: 22.5, waist: 70 },
    // MB-006
    { id: "BM-009", memberId: "MB-006", date: "2026-02-10", weight: 70.0, bodyFat: 18.5, muscleMass: 31.0, waist: 82 },
    { id: "BM-010", memberId: "MB-006", date: "2026-05-10", weight: 68.5, bodyFat: 17.2, muscleMass: 32.0, waist: 80 },
    // MB-008
    { id: "BM-011", memberId: "MB-008", date: "2026-04-01", weight: 83.0, bodyFat: 21.0, muscleMass: 36.5, waist: 90 },
    { id: "BM-012", memberId: "MB-008", date: "2026-06-01", weight: 81.0, bodyFat: 19.5, muscleMass: 37.5, waist: 88 }
  ],
  // ==== TRANSACTIONS (mỗi memberPackage có 1 transaction tương ứng) ====
  transactions: [
    { id: "TX-001", memberId: "MB-001", memberName: "Nguyễn Hoàng Nam", packageName: "Gói Tập Phổ Thông 6 Tháng",   amount: 2700000, type: "sale", paymentMethod: "banking", timestamp: "2026-03-10T10:00:00.000Z", status: "completed" },
    { id: "TX-002", memberId: "MB-001", memberName: "Nguyễn Hoàng Nam", packageName: "Gói Huấn Luyện PT 10 Buổi",  amount: 3500000, type: "sale", paymentMethod: "banking", timestamp: "2026-06-01T14:30:00.000Z", status: "completed" },
    { id: "TX-003", memberId: "MB-002", memberName: "Trần Thị Mai",      packageName: "Gói Tập Phổ Thông 1 Tháng",  amount: 550000,  type: "sale", paymentMethod: "cash",    timestamp: "2026-06-01T09:15:00.000Z", status: "completed" },
    { id: "TX-004", memberId: "MB-003", memberName: "Lê Minh Tuấn",      packageName: "Gói Tập Phổ Thông 1 Tháng",  amount: 550000,  type: "sale", paymentMethod: "cash",    timestamp: "2025-12-01T10:00:00.000Z", status: "completed" },
    { id: "TX-005", memberId: "MB-004", memberName: "Phan Văn Minh",      packageName: "Hội Viên V.I.P 12 Tháng",    amount: 4800000, type: "sale", paymentMethod: "banking", timestamp: "2026-02-20T11:00:00.000Z", status: "completed" },
    { id: "TX-006", memberId: "MB-004", memberName: "Phan Văn Minh",      packageName: "Gói Huấn Luyện PT 30 Buổi", amount: 9000000, type: "sale", paymentMethod: "banking", timestamp: "2026-03-01T10:00:00.000Z", status: "completed" },
    { id: "TX-007", memberId: "MB-005", memberName: "Trần Thị Hồng",      packageName: "Lớp Yoga Cơ Bản 1 Tháng",    amount: 800000,  type: "sale", paymentMethod: "cash",    timestamp: "2026-06-05T08:00:00.000Z", status: "completed" },
    { id: "TX-008", memberId: "MB-006", memberName: "Võ Quốc Bảo",        packageName: "Gói Tập Phổ Thông 6 Tháng",  amount: 2700000, type: "sale", paymentMethod: "banking", timestamp: "2026-01-28T14:00:00.000Z", status: "completed" },
    { id: "TX-009", memberId: "MB-007", memberName: "Nguyễn Thu Hà",       packageName: "Lớp Zumba Sôi Động 1 Tháng", amount: 750000,  type: "sale", paymentMethod: "cash",    timestamp: "2026-06-10T09:00:00.000Z", status: "completed" },
    { id: "TX-010", memberId: "MB-008", memberName: "Bùi Trọng Nghĩa",     packageName: "Gói Huấn Luyện PT 10 Buổi",  amount: 3500000, type: "sale", paymentMethod: "banking", timestamp: "2026-06-22T13:00:00.000Z", status: "completed" },
    { id: "TX-011", memberId: "MB-009", memberName: "Lý Thị Lan",          packageName: "Gói Tập Phổ Thông 1 Tháng",  amount: 550000,  type: "sale", paymentMethod: "cash",    timestamp: "2025-11-15T10:00:00.000Z", status: "completed" }
  ],
  leads: [
    { id: "LD-001", name: "Phạm Tiến Dũng",   phone: "0909888999", email: "dung.pt@gmail.com",  note: "Quan tâm gói 12 tháng + PT",    date: "2026-06-10" },
    { id: "LD-002", name: "Hoàng Thanh Thủy",  phone: "0988777666", email: "thuy.ht@gmail.com", note: "Đăng ký tập thử gói Yoga",        date: "2026-06-11" },
    { id: "LD-003", name: "Đặng Văn Khải",     phone: "0976543210", email: "khai.dv@gmail.com", note: "Hỏi về gói bơi lội cho gia đình", date: "2026-06-11" }
  ],
  reversals: [],
  // ==== SCHEDULE REQUESTS ====
  // SR-001: MB-001 → PT-001, T2+T4 07:00, pending (chờ duyệt)
  // SR-002: MB-004 → PT-001, T3+T5+T7 09:00, approved (sessions đã sinh ở trên)
  scheduleRequests: [
    {
      id: "SR-001",
      memberId: "MB-001",
      ptId: "PT-001",
      memberPackageId: "MP-002",
      type: "fixed",
      daysOfWeek: ["Thứ 2", "Thứ 4"],
      timeSlot: "07:00",
      sessionsPerWeek: 2,
      status: "pending",
      ptNote: "",
      createdAt: "2026-06-10"
    },
    {
      id: "SR-002",
      memberId: "MB-004",
      ptId: "PT-001",
      memberPackageId: "MP-006",
      type: "fixed",
      daysOfWeek: ["Thứ 3", "Thứ 5", "Thứ 7"],
      timeSlot: "09:00",
      sessionsPerWeek: 3,
      status: "approved",
      ptNote: "",
      createdAt: "2026-06-08"
    }
  ],
  // ==== GROUP CLASSES ====
  // currentEnrolled = số booking unique trong groupClassBookings (tính tổng tất cả ngày)
  groupClasses: [
    { id: "GC-001", className: "Lớp Yoga Bình Minh",  trainerId: "PT-002", dayOfWeek: "Thứ 2", time: "06:00 - 07:30", maxCapacity: 15, currentEnrolled: 2 },
    { id: "GC-002", className: "Lớp Yoga Trị Liệu",  trainerId: "PT-002", dayOfWeek: "Thứ 4", time: "18:00 - 19:30", maxCapacity: 15, currentEnrolled: 1 },
    { id: "GC-003", className: "Lớp Zumba Sôi Động", trainerId: "PT-002", dayOfWeek: "Thứ 6", time: "19:00 - 20:30", maxCapacity: 20, currentEnrolled: 2 }
  ],
  // ==== GROUP CLASS BOOKINGS ====
  // Quy tắc: chỉ hội viên có gói CLASS tương ứng mới được đặt
  //   MB-005 (PKG-YOGA) → GC-001 (Yoga T2) + GC-002 (Yoga T4)
  //   MB-007 (PKG-ZUMBA) → GC-003 (Zumba T6)
  //   KHÔNG có MB-001, MB-002... (không có gói class)
  groupClassBookings: [
    { id: "GB-001", memberId: "MB-005", classId: "GC-001", date: "2026-06-09", status: "attended" },
    { id: "GB-002", memberId: "MB-005", classId: "GC-001", date: "2026-06-16", status: "booked" },
    { id: "GB-003", memberId: "MB-005", classId: "GC-002", date: "2026-06-11", status: "attended" },
    { id: "GB-004", memberId: "MB-007", classId: "GC-003", date: "2026-06-13", status: "booked" },
    { id: "GB-005", memberId: "MB-007", classId: "GC-003", date: "2026-06-20", status: "booked" }
  ],
  staff: [
    { id: "ST-001", name: "Nguyễn Lễ Tân",      email: "receptionist@gym.com",  phone: "0900111222", role: "receptionist", password: "GMS@1234", shift: "Ca Sáng (06:00 - 14:00)" },
    { id: "ST-002", name: "Trần Lễ Tân",         email: "receptionist2@gym.com", phone: "0900333444", role: "receptionist", password: "GMS@1234", shift: "Ca Chiều (14:00 - 22:00)" },
    { id: "AD-001", name: "Nguyễn Minh Quản Lý", email: "admin@gym.com",         phone: "0911222333", role: "admin",        password: "GMS@1234", shift: "Toàn Thời Gian" }
  ]
};

const DB_KEY = "gym_gms_data";
const DB_VERSION_KEY = "gym_gms_version";

export const mockDb = {
  init: () => {
    // -- Auto-reset if DB version has changed (seed data was updated) --
    const savedVersion = parseInt(localStorage.getItem(DB_VERSION_KEY) || "0", 10);
    if (savedVersion !== DB_VERSION) {
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
      localStorage.setItem(DB_VERSION_KEY, String(DB_VERSION));
      return;
    }

    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
    } else {
      const current = JSON.parse(localStorage.getItem(DB_KEY));
      let modified = false;
      Object.keys(DEFAULT_DB).forEach(key => {
        if (current[key] === undefined) {
          current[key] = DEFAULT_DB[key];
          modified = true;
        }
      });
      // Normalize QR Codes for existing members to have padding (e.g. QR_MB_4 -> QR_MB_004) and filter out duplicate members
      if (current.members) {
        const seenPhones = new Set();
        const seenCccds = new Set();
        const uniqueMembers = [];
        
        current.members.forEach(m => {
          if (!seenPhones.has(m.phone) && (!m.cccd || !seenCccds.has(m.cccd))) {
            seenPhones.add(m.phone);
            if (m.cccd) seenCccds.add(m.cccd);
            
            if (m.id.startsWith("MB-")) {
              const expectedQr = `QR_MB_${m.id.split('-')[1]}`;
              if (m.qrCode !== expectedQr) {
                m.qrCode = expectedQr;
                modified = true;
              }
            }
            uniqueMembers.push(m);
          } else {
            // Skipped duplicate member (effectively deleting the duplicate entry)
            modified = true;
          }
        });
        
        if (modified) {
          current.members = uniqueMembers;
        }
      }
      if (modified) {
        localStorage.setItem(DB_KEY, JSON.stringify(current));
      }
    }
  },

  get: () => {
    mockDb.init();
    return JSON.parse(localStorage.getItem(DB_KEY));
  },

  save: (data) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  // Member operations
  getMembers: () => mockDb.get().members,
  addMember: (member) => {
    const db = mockDb.get();
    
    // Check if phone or CCCD already exists
    const phoneExists = db.members.some(m => m.phone === member.phone);
    const cccdExists = db.members.some(m => m.cccd === member.cccd);
    if (phoneExists || cccdExists) {
      return null;
    }
    
    const newMemberId = `MB-${String(db.members.length + 1).padStart(3, "0")}`;
    const newMember = {
      ...member,
      id: newMemberId,
      qrCode: `QR_MB_${String(db.members.length + 1).padStart(3, "0")}`,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active"
    };
    db.members.push(newMember);
    mockDb.save(db);
    return newMember;
  },

  // Package operations
  getPackages: () => mockDb.get().packages,
  savePackage: (pkg) => {
    const db = mockDb.get();
    if (pkg.id) {
      db.packages = db.packages.map(p => p.id === pkg.id ? pkg : p);
    } else {
      const newPkg = {
        ...pkg,
        id: pkg.type === "pt" ? `PKG-PT${pkg.sessions || 10}` : `PKG-${String(db.packages.length + 1).padStart(3, "0")}`
      };
      db.packages.push(newPkg);
      mockDb.save(db);
      return newPkg;
    }
    mockDb.save(db);
    return pkg;
  },
  deletePackage: (id) => {
    const db = mockDb.get();
    db.packages = db.packages.filter(p => p.id !== id);
    mockDb.save(db);
  },

  // Member packages subscription
  getMemberPackages: () => mockDb.get().memberPackages,
  subscribePackage: (memberId, packageId, paymentMethod) => {
    const db = mockDb.get();
    const pkg = db.packages.find(p => p.id === packageId);
    const member = db.members.find(m => m.id === memberId);
    
    if (!pkg || !member) return null;

    // Tính toán ngày bắt đầu dựa trên gói hiện tại (cộng dồn gia hạn NV-05)
    let startDate = new Date();
    const activeSubs = db.memberPackages.filter(sp => sp.memberId === memberId && sp.status === "active");
    const sameTypeSub = activeSubs.find(sub => {
      const subPkg = db.packages.find(p => p.id === sub.packageId);
      return subPkg && subPkg.type === pkg.type;
    });

    if (sameTypeSub) {
      const existingEnd = new Date(sameTypeSub.endDate);
      const today = new Date();
      // Nếu hạn dùng của gói cũ nằm ở tương lai, gói mới sẽ nối tiếp
      if (existingEnd >= today) {
        startDate = new Date(existingEnd.getTime() + 24 * 60 * 60 * 1000); // bắt đầu từ ngày hôm sau
      }
    }

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + (pkg.durationMonths || 1));

    const newSubscription = {
      id: `MP-${String(db.memberPackages.length + 1).padStart(3, "0")}`,
      memberId,
      packageId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      remainingSessions: pkg.type === "pt" ? pkg.sessions : null,
      status: "active"
    };

    db.memberPackages.push(newSubscription);

    // Add transaction
    const newTransaction = {
      id: `TX-${String(db.transactions.length + 1).padStart(3, "0")}`,
      memberId,
      memberName: member.name,
      packageName: pkg.name,
      amount: pkg.price,
      type: "sale",
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "completed"
    };
    db.transactions.push(newTransaction);
    
    // Update member status
    db.members = db.members.map(m => m.id === memberId ? { ...m, status: "active" } : m);

    mockDb.save(db);
    return { subscription: newSubscription, transaction: newTransaction };
  },

  // Check-In
  getCheckIns: () => mockDb.get().checkIns,
  checkIn: (memberId, type = "auto") => {
    const db = mockDb.get();
    const member = db.members.find(m => m.id === memberId);
    if (!member) return { success: false, message: "Không tìm thấy hội viên!" };

    // Check packages
    const activeSubs = db.memberPackages.filter(sp => sp.memberId === memberId && sp.status === "active");
    const nowStr = new Date().toISOString().split("T")[0];
    
    const validSub = activeSubs.find(sub => {
      const end = new Date(sub.endDate);
      const today = new Date(nowStr);
      return end >= today;
    });

    if (!validSub) {
      return { success: false, message: "Hội viên không có gói tập hoạt động hoặc gói tập đã hết hạn!", member };
    }

    // Ghi nhận check-in
    const newCheckIn = {
      id: `CI-${String(db.checkIns.length + 1).padStart(3, "0")}`,
      memberId,
      timestamp: new Date().toISOString(),
      type
    };
    db.checkIns.unshift(newCheckIn); // Đưa check-in mới nhất lên đầu
    mockDb.save(db);
    return { success: true, message: "Check-in thành công!", member, checkIn: newCheckIn };
  },

  // Drop-in (Khách vãng lai)
  checkInDropIn: (name, phone, fee, paymentMethod) => {
    const db = mockDb.get();
    
    // Tạo transaction khách vãng lai
    const newTransaction = {
      id: `TX-${String(db.transactions.length + 1).padStart(3, "0")}`,
      memberId: "DROP-IN",
      memberName: `Khách vãng lai: ${name} (${phone})`,
      packageName: "Vé tập đơn lẻ (Drop-in)",
      amount: fee,
      type: "dropin",
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "completed"
    };
    db.transactions.push(newTransaction);

    // Ghi checkin
    const newCheckIn = {
      id: `CI-${String(db.checkIns.length + 1).padStart(3, "0")}`,
      memberId: "DROP-IN",
      timestamp: new Date().toISOString(),
      type: "dropin",
      guestDetails: { name, phone }
    };
    db.checkIns.unshift(newCheckIn);
    
    mockDb.save(db);
    return { success: true, transaction: newTransaction, checkIn: newCheckIn };
  },

  // Sessions (PT Booking)
  getSessions: () => mockDb.get().sessions,
  addSession: (memberId, ptId, dateTime, bookingType = 'ondemand') => {
    const db = mockDb.get();
    // Kiểm tra số buổi PT còn lại
    const ptSub = db.memberPackages.find(sp => sp.memberId === memberId && sp.remainingSessions > 0 && sp.status === "active");
    if (!ptSub) {
      return { success: false, message: "Hội viên không có gói tập PT hoạt động hoặc đã hết số buổi!" };
    }

    const newSession = {
      id: `SS-${String(db.sessions.length + 1).padStart(3, "0")}`,
      memberId,
      ptId,
      dateTime,
      bookingType,
      status: "pending"
    };

    db.sessions.push(newSession);
    mockDb.save(db);
    return { success: true, session: newSession };
  },
  updateSessionStatus: (id, status) => {
    const db = mockDb.get();
    const session = db.sessions.find(s => s.id === id);
    if (!session) return { success: false, message: "Không tìm thấy buổi tập!" };

    session.status = status;

    // Nếu buổi tập hoàn thành, trừ đi 1 buổi của hội viên
    if (status === "completed") {
      const ptSub = db.memberPackages.find(sp => sp.memberId === session.memberId && sp.remainingSessions > 0 && sp.status === "active");
      if (ptSub) {
        ptSub.remainingSessions -= 1;
        if (ptSub.remainingSessions === 0) {
          ptSub.status = "expired";
        }
      }
    }

    mockDb.save(db);
    return { success: true, session };
  },

  // Biometrics
  getBiometrics: (memberId) => {
    return mockDb.get().biometrics.filter(b => b.memberId === memberId).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  addBiometrics: (memberId, stats) => {
    const db = mockDb.get();
    const newBio = {
      id: `BM-${String(db.biometrics.length + 1).padStart(3, "0")}`,
      memberId,
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(stats.weight),
      bodyFat: parseFloat(stats.bodyFat),
      muscleMass: parseFloat(stats.muscleMass),
      waist: parseFloat(stats.waist)
    };
    db.biometrics.push(newBio);
    mockDb.save(db);
    return newBio;
  },

  // Reversals
  getReversals: () => mockDb.get().reversals,
  createReversal: (transactionId, reason) => {
    const db = mockDb.get();
    const tx = db.transactions.find(t => t.id === transactionId);
    if (!tx) return { success: false, message: "Không tìm thấy giao dịch!" };
    if (tx.status === "reversed" || db.reversals.find(r => r.transactionId === transactionId && r.status === "pending")) {
      return { success: false, message: "Giao dịch đã được đảo hoặc đang chờ duyệt đảo!" };
    }

    const newReversal = {
      id: `RV-${String(db.reversals.length + 1).padStart(3, "0")}`,
      transactionId,
      amount: tx.amount,
      packageName: tx.packageName,
      memberName: tx.memberName,
      reason,
      status: "pending",
      timestamp: new Date().toISOString()
    };
    db.reversals.push(newReversal);
    mockDb.save(db);
    return { success: true, reversal: newReversal };
  },
  approveReversal: (reversalId, action) => {
    const db = mockDb.get();
    const rev = db.reversals.find(r => r.id === reversalId);
    if (!rev) return { success: false, message: "Yêu cầu đảo không tồn tại!" };

    rev.status = action; // 'approved' or 'rejected'

    if (action === "approved") {
      // Đổi trạng thái giao dịch
      const tx = db.transactions.find(t => t.id === rev.transactionId);
      if (tx) {
        tx.status = "reversed";
        
        // Hoàn tác các gói tập liên quan nếu là gói tập
        // Tìm subscription được kích hoạt cùng thời điểm hoặc khớp ID
        // (Cách đơn giản: đổi trạng thái gói tập gần nhất của hội viên này thành 'cancelled')
        if (tx.memberId !== "DROP-IN") {
          const subs = db.memberPackages.filter(s => s.memberId === tx.memberId);
          if (subs.length > 0) {
            // Đánh dấu gói mới nhất thành cancelled
            const latestSub = subs[subs.length - 1];
            latestSub.status = "cancelled";
          }
        }
      }
    }

    mockDb.save(db);
    return { success: true, reversal: rev };
  },

  // PTs
  getPts: () => mockDb.get().pts,

  // Leads
  getLeads: () => mockDb.get().leads,
  addLead: (name, phone, email, note) => {
    const db = mockDb.get();
    const newLead = {
      id: `LD-${String(db.leads.length + 1).padStart(3, "0")}`,
      name,
      phone,
      email,
      note,
      date: new Date().toISOString().split("T")[0]
    };
    db.leads.push(newLead);
    mockDb.save(db);
    return newLead;
  },

  // Transactions
  getTransactions: () => mockDb.get().transactions,

  // Group Classes
  getGroupClasses: () => mockDb.get().groupClasses,
  getGroupClassBookings: () => mockDb.get().groupClassBookings,
  saveGroupClass: (gclass) => {
    const db = mockDb.get();
    if (gclass.id) {
      db.groupClasses = db.groupClasses.map(c => c.id === gclass.id ? gclass : c);
    } else {
      const newClass = {
        ...gclass,
        id: `GC-${String(db.groupClasses.length + 1).padStart(3, "0")}`,
        currentEnrolled: 0
      };
      db.groupClasses.push(newClass);
      mockDb.save(db);
      return newClass;
    }
    mockDb.save(db);
    return gclass;
  },
  deleteGroupClass: (id) => {
    const db = mockDb.get();
    db.groupClasses = db.groupClasses.filter(c => c.id !== id);
    db.groupClassBookings = db.groupClassBookings.filter(b => b.classId !== id);
    mockDb.save(db);
  },
  bookGroupClass: (memberId, classId, date) => {
    const db = mockDb.get();
    const groupClass = db.groupClasses.find(c => c.id === classId);
    if (!groupClass) return { success: false, message: "Không tìm thấy lớp học!" };

    // Check capacity
    const bookingsForClass = db.groupClassBookings.filter(b => b.classId === classId && b.date === date);
    if (bookingsForClass.length >= groupClass.maxCapacity) {
      return { success: false, message: "Lớp học đã đủ số lượng học viên đăng ký!" };
    }

    // Check duplicate booking
    const duplicate = db.groupClassBookings.find(b => b.memberId === memberId && b.classId === classId && b.date === date);
    if (duplicate) {
      return { success: false, message: "Hội viên đã đăng ký lớp học này trong ngày này rồi!" };
    }

    // Check active packages
    const activeSubs = db.memberPackages.filter(sp => sp.memberId === memberId && sp.status === "active");
    const today = new Date().toISOString().split("T")[0];
    const hasValidSub = activeSubs.some(sub => {
      if (sub.endDate < today) return false;
      const subPkg = db.packages.find(p => p.id === sub.packageId);
      if (!subPkg) return false;
      if (subPkg.id === "PKG-003") return true; // VIP
      const name = subPkg.name.toLowerCase();
      const className = groupClass.className.toLowerCase();
      if (className.includes("yoga") && name.includes("yoga")) return true;
      if (className.includes("zumba") && name.includes("zumba")) return true;
      if (className.includes("bơi") && name.includes("bơi")) return true;
      return false;
    });

    if (!hasValidSub) {
      return { success: false, message: "Hội viên không có gói tập lớp học tương ứng (Yoga/Zumba/Bơi) hoặc gói tập đã hết hạn!" };
    }

    // Create booking
    const newBooking = {
      id: `GB-${String(db.groupClassBookings.length + 1).padStart(3, "0")}`,
      memberId,
      classId,
      date,
      status: "booked" // 'booked', 'attended'
    };
    db.groupClassBookings.push(newBooking);

    // Update currentEnrolled (simulated statistic)
    groupClass.currentEnrolled = db.groupClassBookings.filter(b => b.classId === classId).length;

    mockDb.save(db);
    return { success: true, booking: newBooking };
  },
  cancelGroupClassBooking: (bookingId) => {
    const db = mockDb.get();
    const booking = db.groupClassBookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Không tìm thấy lượt đăng ký lớp!" };

    db.groupClassBookings = db.groupClassBookings.filter(b => b.id !== bookingId);
    
    // Update enrolled count
    const groupClass = db.groupClasses.find(c => c.id === booking.classId);
    if (groupClass) {
      groupClass.currentEnrolled = db.groupClassBookings.filter(b => b.classId === booking.classId).length;
    }

    mockDb.save(db);
    return { success: true };
  },
  checkInGroupClassBooking: (bookingId) => {
    const db = mockDb.get();
    const booking = db.groupClassBookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Không tìm thấy lượt đăng ký!" };
    booking.status = "attended";
    mockDb.save(db);
    return { success: true, booking };
  },

  // Schedule Requests
  getScheduleRequests: () => mockDb.get().scheduleRequests || [],

  // Detect if a given PT has a conflict on the given daysOfWeek + timeSlot
  // A conflict occurs if the PT is already teaching a group class OR has an approved fixed schedule at that time
  // timeSlot format: "HH:mm", groupClass.time format: "HH:mm - HH:mm"
  detectPtConflict: (ptId, daysOfWeek, timeSlot, excludeRequestId = null) => {
    const db = mockDb.get();
    const requestHour = parseInt(timeSlot.split(':')[0], 10);

    // 1. Check group classes taught by this PT
    const ptClasses = db.groupClasses.filter(c => c.trainerId === ptId);
    for (const cls of ptClasses) {
      const clsDow = cls.dayOfWeek; // e.g. "Thứ 2"
      if (!daysOfWeek.includes(clsDow)) continue;
      // Parse class time range
      const parts = cls.time.split(' - ');
      if (parts.length !== 2) continue;
      const clsStart = parseInt(parts[0].split(':')[0], 10);
      const clsEnd   = parseInt(parts[1].split(':')[0], 10);
      // A 1:1 session is assumed ~1 hour. Conflict if requestHour falls within class time
      if (requestHour >= clsStart && requestHour < clsEnd) {
        return { conflict: true, reason: `Giờ ${timeSlot} bị xung đột với lớp "${cls.className}" (${cls.dayOfWeek} ${cls.time})` };
      }
    }

    // 2. Check approved fixed schedule requests for this PT
    const approvedRequests = (db.scheduleRequests || []).filter(
      r => r.ptId === ptId && r.status === 'approved' && r.id !== excludeRequestId
    );
    for (const req of approvedRequests) {
      const overlap = daysOfWeek.some(d => req.daysOfWeek.includes(d));
      if (!overlap) continue;
      const reqHour = parseInt(req.timeSlot.split(':')[0], 10);
      // Conflict if same hour (1-hour slot assumption)
      if (reqHour === requestHour) {
        const db2 = mockDb.get();
        const member = db2.members.find(m => m.id === req.memberId);
        return { conflict: true, reason: `Giờ ${timeSlot} bị xung đột với lịch đã duyệt của học viên "${member ? member.name : req.memberId}"` };
      }
    }

    return { conflict: false };
  },

  requestSchedule: (memberId, ptId, memberPackageId, scheduleData) => {
    const db = mockDb.get();
    const member = db.members.find(m => m.id === memberId);
    const pt = db.pts.find(p => p.id === ptId);
    const mp = db.memberPackages.find(mp => mp.id === memberPackageId);
    if (!member || !pt || !mp) return { success: false, message: 'Dữ liệu không hợp lệ!' };

    // Chỉ cho phép gói PT
    const pkg = db.packages.find(p => p.id === mp.packageId);
    if (!pkg || pkg.type !== 'pt') return { success: false, message: 'Chỉ gói PT mới được đăng ký lịch tập cá nhân!' };

    // Không cho phép trùng pending request cho cùng gói
    const existing = (db.scheduleRequests || []).find(
      r => r.memberId === memberId && r.memberPackageId === memberPackageId && r.status === 'pending'
    );
    if (existing) return { success: false, message: 'Bạn đã có yêu cầu lịch đang chờ duyệt cho gói này!' };

    const newRequest = {
      id: `SR-${String((db.scheduleRequests || []).length + 1).padStart(3, '0')}`,
      memberId,
      ptId,
      memberPackageId,
      type: scheduleData.type || 'fixed',
      daysOfWeek: scheduleData.daysOfWeek || [],
      timeSlot: scheduleData.timeSlot || '07:00',
      sessionsPerWeek: scheduleData.sessionsPerWeek || 1,
      status: 'pending',
      ptNote: '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (!db.scheduleRequests) db.scheduleRequests = [];
    db.scheduleRequests.push(newRequest);
    mockDb.save(db);
    return { success: true, request: newRequest };
  },

  approveScheduleRequest: (requestId, ptNote = '') => {
    const db = mockDb.get();
    if (!db.scheduleRequests) db.scheduleRequests = [];
    const req = db.scheduleRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu lịch!' };
    if (req.status !== 'pending') return { success: false, message: 'Yêu cầu này đã được xử lý!' };

    // Conflict check
    const conflict = mockDb.detectPtConflict(req.ptId, req.daysOfWeek, req.timeSlot, requestId);
    if (conflict.conflict) return { success: false, message: `Không thể duyệt: ${conflict.reason}` };

    // Find member package to know number of sessions
    const mp = db.memberPackages.find(m => m.id === req.memberPackageId);
    const pkg = mp ? db.packages.find(p => p.id === mp.packageId) : null;
    const totalSessions = mp ? (mp.remainingSessions || pkg?.sessions || 10) : 10;

    // Generate sessions starting from next occurrence of each day of week
    // We'll spread totalSessions across weeks, cycling through daysOfWeek
    const dayMap = { 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Chủ Nhật': 0 };
    const sortedDays = [...req.daysOfWeek].sort((a, b) => (dayMap[a] || 0) - (dayMap[b] || 0));
    const [hh, mm] = req.timeSlot.split(':').map(Number);

    // Find next upcoming date for each day
    const getNextDate = (targetDow) => {
      const today = new Date();
      const todayDow = today.getDay();
      const target = dayMap[targetDow] !== undefined ? dayMap[targetDow] : 1;
      let diff = target - todayDow;
      if (diff <= 0) diff += 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      next.setHours(hh, mm, 0, 0);
      return new Date(next);
    };

    // Build a queue of upcoming dates cycling through daysOfWeek
    const dateQueue = sortedDays.map(d => getNextDate(d)).sort((a, b) => a - b);
    const generatedSessions = [];
    let sessionCount = 0;
    let weekOffset = 0;

    while (sessionCount < totalSessions) {
      for (const baseDate of [...dateQueue]) {
        if (sessionCount >= totalSessions) break;
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(sessionDate.getDate() + weekOffset * 7);
        const isoStr = sessionDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
        const newSession = {
          id: `SS-${String(db.sessions.length + generatedSessions.length + 1).padStart(3, '0')}`,
          memberId: req.memberId,
          ptId: req.ptId,
          dateTime: isoStr,
          bookingType: 'fixed',
          scheduleRequestId: requestId,
          status: 'confirmed'
        };
        generatedSessions.push(newSession);
        sessionCount++;
      }
      weekOffset++;
      if (weekOffset > 52) break; // safety cap
    }

    db.sessions.push(...generatedSessions);
    req.status = 'approved';
    req.ptNote = ptNote;

    mockDb.save(db);
    return { success: true, request: req, sessionsCreated: generatedSessions.length };
  },

  rejectScheduleRequest: (requestId, ptNote = '') => {
    const db = mockDb.get();
    if (!db.scheduleRequests) db.scheduleRequests = [];
    const req = db.scheduleRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu lịch!' };
    req.status = 'rejected';
    req.ptNote = ptNote;
    mockDb.save(db);
    return { success: true, request: req };
  },

  cancelScheduleRequest: (requestId) => {
    const db = mockDb.get();
    if (!db.scheduleRequests) db.scheduleRequests = [];
    const req = db.scheduleRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Không tìm thấy yêu cầu lịch!' };
    if (req.status === 'approved') {
      // Also remove generated sessions
      db.sessions = db.sessions.filter(s => s.scheduleRequestId !== requestId || s.status === 'completed');
    }
    req.status = 'cancelled';
    mockDb.save(db);
    return { success: true };
  },

  // Staff helpers
  getStaff: () => mockDb.get().staff,
  saveStaff: (staffMember) => {
    const db = mockDb.get();
    if (staffMember.id) {
      // Check if it is a PT or receptionist/admin
      if (staffMember.id.startsWith("PT")) {
        db.pts = db.pts.map(p => p.id === staffMember.id ? staffMember : p);
      } else {
        db.staff = db.staff.map(s => s.id === staffMember.id ? staffMember : s);
      }
    } else {
      if (staffMember.role === "pt") {
        const newPt = {
          ...staffMember,
          id: `PT-${String(db.pts.length + 1).padStart(3, "0")}`
        };
        db.pts.push(newPt);
        mockDb.save(db);
        return newPt;
      } else {
        const prefix = staffMember.role === "admin" ? "AD" : "ST";
        const newStaff = {
          ...staffMember,
          id: `${prefix}-${String(db.staff.length + 1).padStart(3, "0")}`
        };
        db.staff.push(newStaff);
        mockDb.save(db);
        return newStaff;
      }
    }
    mockDb.save(db);
    return staffMember;
  },
  deleteStaff: (id) => {
    const db = mockDb.get();
    if (id.startsWith("PT")) {
      db.pts = db.pts.filter(p => p.id !== id);
    } else {
      db.staff = db.staff.filter(s => s.id !== id);
    }
    mockDb.save(db);
  },
  updateStaffShift: (id, shift) => {
    const db = mockDb.get();
    if (id.startsWith("PT")) {
      const p = db.pts.find(pt => pt.id === id);
      if (p) p.shift = shift;
      mockDb.save(db);
      return p;
    } else {
      const s = db.staff.find(st => st.id === id);
      if (s) s.shift = shift;
      mockDb.save(db);
      return s;
    }
  }
};
