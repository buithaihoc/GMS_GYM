import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, User, Activity, CheckCircle, XCircle, Plus, ClipboardList, Clock, Users, X, Search, Shield, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export default function PtDashboard() {
  const { 
    currentUser, 
    sessions, 
    members, 
    groupClasses,
    groupClassBookings,
    memberPackages,
    packages,
    scheduleRequests,
    getMemberBiometrics,
    handleUpdateSessionStatus, 
    handleAddBiometrics,
    handleCheckInGroupClassBooking,
    handleCancelGroupClassBooking,
    handleBookGroupClass,
    handleApproveScheduleRequest,
    handleRejectScheduleRequest,
    detectPtConflict
  } = useApp();

  // Biometrics Form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waist, setWaist] = useState('');
  const [bioSuccess, setBioSuccess] = useState('');
  const [bioError, setBioError] = useState('');

  // Class list details modal state
  const [selectedClassForEnrolled, setSelectedClassForEnrolled] = useState(null);

  // Tab & search states
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'students'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  
  // Quick Bio entry state
  const [showQuickBioModal, setShowQuickBioModal] = useState(false);
  const [quickBioStudent, setQuickBioStudent] = useState(null);
  const [quickBioWeight, setQuickBioWeight] = useState('');
  const [quickBioFat, setQuickBioFat] = useState('');
  const [quickBioMuscle, setQuickBioMuscle] = useState('');
  const [quickBioWaist, setQuickBioWaist] = useState('');
  const [quickBioSuccess, setQuickBioSuccess] = useState('');
  const [quickBioError, setQuickBioError] = useState('');

  // Selected attendance dates map
  const [attendanceDates, setAttendanceDates] = useState({});

  // Schedule approval state
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [scheduleMsg, setScheduleMsg] = useState('');

  // Weekly calendar
  const [weekOffset, setWeekOffset] = useState(0);

  if (!currentUser) return <div>Không tìm thấy huấn luyện viên!</div>;

  // Filter sessions for this PT
  const mySessions = sessions.filter(s => s.ptId === currentUser.id).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  
  // Filter classes taught by this PT (NV-08)
  const myClasses = groupClasses.filter(c => c.trainerId === currentUser.id);
  
  // Find distinct members that this PT trains (either via PT sessions or group classes)
  // ONLY if they have an active PT package (for PT sessions) or active Class package (for group classes).
  const myMembers = members.filter(m => {
    // Check if member has active PT package
    const activePtPackages = memberPackages.filter(mp => mp.memberId === m.id && mp.status === 'active').map(mp => packages.find(p => p.id === mp.packageId)).filter(p => p && p.type === 'pt');
    
    // Check if member has active Class package
    const activeClassPackages = memberPackages.filter(mp => mp.memberId === m.id && mp.status === 'active').map(mp => packages.find(p => p.id === mp.packageId)).filter(p => p && p.type === 'class');
    
    const hasActivePtPkg = activePtPackages.length > 0;
    const hasActiveClassPkg = activeClassPackages.length > 0;

    // Check association with this PT
    const hasSessionsWithThisPt = mySessions.some(s => s.memberId === m.id);
    const trainerClassIds = myClasses.map(c => c.id);
    const hasClassBookingsWithThisPt = groupClassBookings.some(b => b.memberId === m.id && trainerClassIds.includes(b.classId));

    // A member is a student of this PT if:
    // 1. They have sessions with this PT AND an active PT package
    // OR
    // 2. They have class bookings with this PT AND an active Class package
    return (hasSessionsWithThisPt && hasActivePtPkg) || (hasClassBookingsWithThisPt && hasActiveClassPkg);
  });

  const handleStatusChange = async (id, newStatus) => {
    await handleUpdateSessionStatus(id, newStatus);
  };

  // Handle checking in group class attendance by selecting a date first
  const handleAttendanceCheckIn = async (memberId, date) => {
    const defaultToday = new Date().toISOString().split('T')[0];
    const targetDate = date || defaultToday;

    if (!targetDate) {
      alert("Vui lòng chọn ngày học!");
      return;
    }

    // Find if booking exists for this student, class, and date
    const classBookings = groupClassBookings.filter(b => b.classId === selectedClassForEnrolled.id);
    const existingBooking = classBookings.find(b => b.memberId === memberId && b.date === targetDate);

    if (existingBooking) {
      if (existingBooking.status === 'attended') {
        alert(`Học viên đã được điểm danh vào ngày ${targetDate} rồi!`);
        return;
      }
      const res = await handleCheckInGroupClassBooking(existingBooking.id);
      if (res && res.success) {
        alert(`Điểm danh thành công học viên vào ngày ${targetDate}!`);
      }
    } else {
      // Walk-in booking: first book the class for that date, then check-in
      const bookRes = await handleBookGroupClass(memberId, selectedClassForEnrolled.id, targetDate);
      if (bookRes.success) {
        const checkinRes = await handleCheckInGroupClassBooking(bookRes.booking.id);
        if (checkinRes && checkinRes.success) {
          alert(`Đăng ký đột xuất & Điểm danh thành công ngày ${targetDate}!`);
        }
      } else {
        alert(bookRes.message);
      }
    }
  };

  // Get active PT packages for a student
  const getStudentPtPackages = (memberId) => {
    return memberPackages
      .filter(mp => mp.memberId === memberId && mp.status === 'active')
      .map(mp => {
        const pkg = packages.find(p => p.id === mp.packageId);
        return { mp, pkg };
      })
      .filter(item => item.pkg && item.pkg.type === 'pt');
  };

  // Handle Quick Biometrics form submit
  const handleQuickBiometricsSubmit = async (e) => {
    e.preventDefault();
    setQuickBioError('');
    setQuickBioSuccess('');

    if (!quickBioStudent || !quickBioWeight || !quickBioFat || !quickBioMuscle) {
      setQuickBioError('Vui lòng nhập đầy đủ các chỉ số bắt buộc!');
      return;
    }

    const res = await handleAddBiometrics(quickBioStudent.id, {
      weight: parseFloat(quickBioWeight),
      bodyFat: parseFloat(quickBioFat),
      muscleMass: parseFloat(quickBioMuscle),
      waist: quickBioWaist ? parseFloat(quickBioWaist) : 0
    });

    if (res) {
      setQuickBioSuccess('Cập nhật chỉ số sức khỏe thành công!');
      setQuickBioWeight('');
      setQuickBioFat('');
      setQuickBioMuscle('');
      setQuickBioWaist('');
      setTimeout(() => {
        setQuickBioSuccess('');
        setShowQuickBioModal(false);
      }, 2000);
    }
  };

  // Render SVG Biometrics Chart for a student
  const renderStudentBiometricsChart = (studentId) => {
    const studentBiometrics = getMemberBiometrics(studentId) || [];
    if (studentBiometrics.length === 0) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Activity size={24} color="var(--text-muted)" style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Chưa có dữ liệu sinh trắc học.</p>
        </div>
      );
    }

    const width = 450;
    const height = 180;
    const padding = 30;

    const weights = studentBiometrics.map(b => b.weight);
    const bodyFats = studentBiometrics.map(b => b.bodyFat);
    
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const rangeW = maxW - minW || 1;

    const minBF = Math.min(...bodyFats) - 2;
    const maxBF = Math.max(...bodyFats) + 2;
    const rangeBF = maxBF - minBF || 1;

    const getX = (index) => padding + (index * (width - 2 * padding) / (studentBiometrics.length - 1 || 1));
    const getWeightY = (w) => height - padding - ((w - minW) * (height - 2 * padding) / rangeW);
    const getBFY = (bf) => height - padding - ((bf - minBF) * (height - 2 * padding) / rangeBF);

    let weightPath = "";
    let bfPath = "";
    
    studentBiometrics.forEach((bio, idx) => {
      const x = getX(idx);
      const yw = getWeightY(bio.weight);
      const ybf = getBFY(bio.bodyFat);

      if (idx === 0) {
        weightPath = `M ${x} ${yw}`;
        bfPath = `M ${x} ${ybf}`;
      } else {
        weightPath += ` L ${x} ${yw}`;
        bfPath += ` L ${x} ${ybf}`;
      }
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255, 255, 255, 0.05)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255, 255, 255, 0.1)" />
          
          {studentBiometrics.length > 1 && <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="3" />}
          {studentBiometrics.map((bio, idx) => (
            <g key={`sw-${idx}`}>
              <circle cx={getX(idx)} cy={getWeightY(bio.weight)} r="4" fill="#ffffff" stroke="var(--primary)" strokeWidth="2" />
              <text x={getX(idx)} y={getWeightY(bio.weight) - 8} fill="var(--text-primary)" fontSize="10" textAnchor="middle">{bio.weight}kg</text>
            </g>
          ))}

          {studentBiometrics.length > 1 && <path d={bfPath} fill="none" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="4" />}
          {studentBiometrics.map((bio, idx) => (
            <g key={`sbf-${idx}`}>
              <circle cx={getX(idx)} cy={getBFY(bio.bodyFat)} r="4" fill="#ffffff" stroke="var(--secondary)" strokeWidth="2" />
              <text x={getX(idx)} y={getBFY(bio.bodyFat) + 14} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">{bio.bodyFat}%</text>
            </g>
          ))}

          {studentBiometrics.map((bio, idx) => (
            <text key={`slbl-${idx}`} x={getX(idx)} y={height - 8} fill="var(--text-muted)" fontSize="9" textAnchor="middle">
              {bio.date.slice(5)}
            </text>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: 'var(--primary)', display: 'inline-block' }}></span>
            <span>Cân Nặng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', borderTop: '2px dashed var(--secondary)', display: 'inline-block' }}></span>
            <span>Tỷ Lệ Mỡ (%)</span>
          </div>
        </div>
      </div>
    );
  };

  const filteredStudents = myMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBiometricsSubmit = async (e) => {
    e.preventDefault();
    setBioError('');
    setBioSuccess('');

    if (!selectedMemberId || !weight || !bodyFat || !muscleMass) {
      setBioError('Vui lòng nhập đầy đủ các chỉ số bắt buộc!');
      return;
    }

    const res = await handleAddBiometrics(selectedMemberId, {
      weight,
      bodyFat,
      muscleMass,
      waist: waist || 0
    });

    if (res) {
      setBioSuccess('Cập nhật chỉ số sức khỏe của hội viên thành công!');
      setSelectedMemberId('');
      setWeight('');
      setBodyFat('');
      setMuscleMass('');
      setWaist('');
      setTimeout(() => setBioSuccess(''), 4000);
    }
  };

  return (
    <div className="pt-dashboard animate-fade-in" style={styles.container}>
      {/* PT Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.welcomeText}>PT: {currentUser.name}</h2>
          <p style={styles.specialtyText}>Chuyên môn giảng dạy: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{currentUser.specialty}</span> | SĐT: {currentUser.phone}</p>
        </div>
        <span className="badge badge-info">Huấn Luyện Viên</span>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('schedule')} 
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'schedule' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'schedule' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'schedule' ? '700' : '500'
          }}
        >
          <Calendar size={15} /> Lịch Dạy & Lớp Nhóm
        </button>
        <button 
          onClick={() => setActiveTab('students')} 
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'students' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'students' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'students' ? '700' : '500'
          }}
        >
          <Users size={15} /> Học Viên Của Tôi ({myMembers.length})
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div style={{ marginTop: '20px' }}>

          {/* === Schedule Approval Panel === */}
          {(() => {
            const pendingReqs = (scheduleRequests || []).filter(r => r.ptId === currentUser.id && r.status === 'pending');
            if (pendingReqs.length === 0) return null;
            return (
              <div className="glass-panel" style={{ ...styles.card, marginBottom: '20px', borderLeft: '4px solid var(--warning, #f59e0b)' }}>
                <h3 style={{ ...styles.cardTitle, color: '#f59e0b' }}>
                  <AlertTriangle size={18} /> Yêu Cầu Lịch Đang Chờ Phê Duyệt ({pendingReqs.length})
                </h3>
                {scheduleMsg && (
                  <div style={{ background: scheduleMsg.includes('thành công') ? 'var(--success-glow)' : 'var(--danger-glow)', color: scheduleMsg.includes('thành công') ? 'var(--success)' : 'var(--danger)', border: `1px solid ${scheduleMsg.includes('thành công') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                    {scheduleMsg}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingReqs.map(req => {
                    const member = members.find(m => m.id === req.memberId) || {};
                    const mp = memberPackages.find(m => m.id === req.memberPackageId) || {};
                    const pkg = packages.find(p => p.id === mp.packageId) || {};
                    const conflictCheck = detectPtConflict(currentUser.id, req.daysOfWeek, req.timeSlot, req.id);
                    return (
                      <div key={req.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${conflictCheck.conflict ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '8px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>👤 {member.name} (ID: {member.id})</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              📅 {req.daysOfWeek.join(', ')} | ⏰ {req.timeSlot} | {req.sessionsPerWeek} buổi/tuần
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Gói: {pkg.name} (còn {mp.remainingSessions} buổi) | Gửi lúc: {req.createdAt}
                            </div>
                          </div>
                          {conflictCheck.conflict && (
                            <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={13} /> {conflictCheck.reason}
                            </div>
                          )}
                        </div>

                        {rejectingRequestId === req.id ? (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Lý do từ chối (ghi chú cho hội viên)..."
                              value={rejectNote}
                              onChange={e => setRejectNote(e.target.value)}
                              style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', color: '#000', fontSize: '0.85rem', minWidth: '200px' }}
                            />
                            <button onClick={async () => {
                              const res = await handleRejectScheduleRequest(req.id, rejectNote);
                              setScheduleMsg(res.success ? 'Đã từ chối yêu cầu lịch.' : res.message);
                              setRejectingRequestId(null); setRejectNote('');
                              setTimeout(() => setScheduleMsg(''), 4000);
                            }} style={{ ...styles.actionBtn, background: 'var(--danger-glow)', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', padding: '6px 14px' }}>Xác nhận từ chối</button>
                            <button onClick={() => { setRejectingRequestId(null); setRejectNote(''); }} style={{ ...styles.actionBtn, padding: '6px 14px' }}>Huỷ</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button
                              disabled={conflictCheck.conflict}
                              onClick={async () => {
                                const res = await handleApproveScheduleRequest(req.id, '');
                                setScheduleMsg(res.success ? `✅ Đã duyệt! Đã tạo ${res.sessionsCreated || res.request?.sessionsPerWeek || 'các'} buổi tập cho ${member.name}.` : `❌ ${res.message}`);
                                setTimeout(() => setScheduleMsg(''), 5000);
                              }}
                              style={{ ...styles.actionBtn, background: conflictCheck.conflict ? 'rgba(255,255,255,0.05)' : 'var(--success-glow)', color: conflictCheck.conflict ? 'var(--text-muted)' : 'var(--success)', borderColor: conflictCheck.conflict ? 'var(--border-color)' : 'rgba(16,185,129,0.3)', cursor: conflictCheck.conflict ? 'not-allowed' : 'pointer', padding: '6px 16px' }}
                              title={conflictCheck.conflict ? conflictCheck.reason : 'Phê duyệt lịch'}
                            >
                              <CheckCircle size={14} /> {conflictCheck.conflict ? 'Xung đột lịch' : 'Phê duyệt'}
                            </button>
                            <button
                              onClick={() => setRejectingRequestId(req.id)}
                              style={{ ...styles.actionBtn, background: 'var(--danger-glow)', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', padding: '6px 14px' }}
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* === Weekly Calendar Grid === */}
          {(() => {
            const getWeekDates = (offset = 0) => {
              const today = new Date();
              const dow = today.getDay();
              const mondayOffset = dow === 0 ? -6 : 1 - dow;
              const monday = new Date(today);
              monday.setDate(today.getDate() + mondayOffset + offset * 7);
              return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                return d;
              });
            };
            const weekDates = getWeekDates(weekOffset);
            const weekDayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
            const displayHours = [5,6,7,8,9,10,11,14,15,16,17,18,19,20,21];
            const dayMap = { 'Thứ 2': 0, 'Thứ 3': 1, 'Thứ 4': 2, 'Thứ 5': 3, 'Thứ 6': 4, 'Thứ 7': 5, 'Chủ Nhật': 6 };
            const fmt = d => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            // Build event map: key "dayIdx-hour"
            const eventsMap = {};
            const addEv = (dayIdx, hour, ev) => {
              const k = `${dayIdx}-${hour}`;
              if (!eventsMap[k]) eventsMap[k] = [];
              eventsMap[k].push(ev);
            };

            weekDates.forEach((date, dayIdx) => {
              const dateStr = date.toISOString().split('T')[0];
              // PT sessions for this day
              mySessions.forEach(s => {
                if (!s.dateTime) return;
                const sDate = s.dateTime.split('T')[0];
                const sHour = parseInt(s.dateTime.split('T')[1]?.split(':')[0] || 0, 10);
                if (sDate === dateStr && s.status !== 'cancelled') {
                  const mb = members.find(m => m.id === s.memberId) || {};
                  addEv(dayIdx, sHour, { type: 'pt', label: mb.name?.split(' ').pop() || 'HV', time: s.dateTime.split('T')[1]?.slice(0,5), status: s.status });
                }
              });
            });

            // Group classes for this PT (recurring weekly)
            myClasses.forEach(cls => {
              const clsDayIdx = dayMap[cls.dayOfWeek];
              if (clsDayIdx === undefined) return;
              const startHour = parseInt(cls.time.split(':')[0], 10);
              addEv(clsDayIdx, startHour, { type: 'class', label: cls.className, time: cls.time.split(' ')[0], status: 'class' });
            });

            return (
              <div className="glass-panel" style={{ ...styles.card, marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ ...styles.cardTitle, margin: 0 }}><Calendar size={18} /> Lịch Tuần Của Tôi</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => setWeekOffset(w => w - 1)} style={styles.navBtn}><ChevronLeft size={15} /></button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{fmt(weekDates[0])} – {fmt(weekDates[6])}</span>
                    <button onClick={() => setWeekOffset(w => w + 1)} style={styles.navBtn}><ChevronRight size={15} /></button>
                    {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ ...styles.navBtn, fontSize: '0.7rem' }}>Hôm nay</button>}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.calTh, width: '52px' }}>Giờ</th>
                        {weekDates.map((date, i) => {
                          const isToday = date.toDateString() === new Date().toDateString();
                          return (
                            <th key={i} style={{ ...styles.calTh, background: isToday ? 'rgba(99,102,241,0.12)' : 'transparent' }}>
                              <div style={{ color: isToday ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '0.73rem' }}>{weekDayNames[i]}</div>
                              <div style={{ color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.68rem' }}>{date.getDate()}/{date.getMonth()+1}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {displayHours.map(hour => (
                        <tr key={hour} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ ...styles.calTd, color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'center', fontWeight: '600' }}>{hour}:00</td>
                          {weekDates.map((_, dayIdx) => {
                            const evts = eventsMap[`${dayIdx}-${hour}`] || [];
                            return (
                              <td key={dayIdx} style={styles.calTd}>
                                {evts.map((ev, ei) => (
                                  <div key={ei} style={{
                                    background: ev.type === 'class' ? 'rgba(139,92,246,0.18)' : ev.status === 'confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                                    border: `1px solid ${ev.type === 'class' ? 'rgba(139,92,246,0.45)' : ev.status === 'confirmed' ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`,
                                    borderRadius: '4px', padding: '3px 5px', fontSize: '0.63rem', fontWeight: '600', marginBottom: '2px',
                                    color: ev.type === 'class' ? '#a78bfa' : ev.status === 'confirmed' ? 'var(--success)' : 'var(--primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                  }}>
                                    {ev.time && <span style={{ opacity: 0.8 }}>{ev.time} </span>}
                                    {ev.label}
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '2px' }}></div><span>Ca PT (đã duyệt)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '2px' }}></div><span>Ca PT (chờ)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '2px' }}></div><span>Lớp nhóm</span></div>
                </div>
              </div>
            );
          })()}

          <div className="grid-3">
          {/* Teaching schedule list */}
          <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2' }}>
            <h3 style={styles.cardTitle}><Calendar size={18} color="var(--primary)" /> Danh Sách Lịch Dạy & Phiên Hẹn</h3>
          
          <div style={styles.sessionList}>
            {mySessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '30px', textAlign: 'center' }}>Bạn chưa có lịch hẹn giảng dạy nào.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Hội viên</th>
                    <th style={styles.th}>Thời gian</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Thao tác duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {mySessions.map(session => {
                    const member = members.find(m => m.id === session.memberId) || {};
                    const sessionDate = new Date(session.dateTime);
                    return (
                      <tr key={session.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <strong>{member.name}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {member.id}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{sessionDate.toLocaleDateString('vi-VN')} {sessionDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>
                            {session.bookingType === 'fixed' ? 'Lịch cố định hàng tuần' : 'Linh hoạt / Đột xuất'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${
                            session.status === 'confirmed' ? 'badge-success' :
                            session.status === 'pending' ? 'badge-warning' :
                            session.status === 'completed' ? 'badge-info' : 'badge-danger'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {session.status === 'confirmed' ? 'Đã duyệt' :
                             session.status === 'pending' ? 'Chờ duyệt' :
                             session.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {session.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleStatusChange(session.id, 'confirmed')}
                                  style={{ ...styles.actionBtn, backgroundColor: 'var(--success-glow)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                                  title="Chấp nhận"
                                >
                                  Duyệt
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(session.id, 'cancelled')}
                                  style={{ ...styles.actionBtn, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                  title="Từ chối"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            
                            {session.status === 'confirmed' && (
                              <button 
                                onClick={() => handleStatusChange(session.id, 'completed')}
                                style={{ ...styles.actionBtn, backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', borderColor: 'rgba(6, 182, 212, 0.3)', width: '100%' }}
                                title="Đánh dấu hoàn thành buổi dạy"
                              >
                                Hoàn Thành Ca
                              </button>
                            )}

                            {session.status === 'completed' && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Đã hoàn tất</span>}
                            {session.status === 'cancelled' && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Đã hủy</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lớp Học Nhóm Giảng Dạy (NV-08) */}
        <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2', marginTop: '20px' }}>
          <h3 style={styles.cardTitle}><Users size={18} color="var(--secondary)" /> Lớp Học Nhóm Giảng Dạy</h3>
          <div style={styles.sessionList}>
            {myClasses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px', textAlign: 'center' }}>Bạn chưa được phân công giảng dạy lớp nhóm nào.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Tên Lớp Học</th>
                    <th style={styles.th}>Lịch học</th>
                    <th style={styles.th}>Thời gian ca</th>
                    <th style={styles.th}>Học viên</th>
                    <th style={styles.th}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {myClasses.map(c => {
                    const enrolledBookings = groupClassBookings.filter(b => b.classId === c.id);
                    return (
                      <tr key={c.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{c.className}</strong></td>
                        <td style={styles.td}>{c.dayOfWeek}</td>
                        <td style={styles.td}>{c.time}</td>
                        <td style={styles.td}>{enrolledBookings.length} / {c.maxCapacity}</td>
                        <td style={styles.td}>
                          <button 
                            onClick={() => setSelectedClassForEnrolled(c)} 
                            className="btn btn-outline" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Xem Danh Sách
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Biometrics Entry Form */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}><ClipboardList size={18} color="var(--secondary)" /> Nhập Chỉ Số Sinh Trắc Học</h3>
          
          {bioSuccess && (
            <div style={{ ...styles.alert, backgroundColor: 'var(--success-glow)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={16} /> <span>{bioSuccess}</span>
            </div>
          )}

          {bioError && (
            <div style={{ ...styles.alert, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <XCircle size={16} /> <span>{bioError}</span>
            </div>
          )}

          <form onSubmit={handleBiometricsSubmit} style={{ marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Chọn Hội Viên *</label>
              <select 
                className="form-input" 
                required
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                style={{ background: '#ffffff', colorScheme: 'light' }}
              >
                <option value="">-- Chọn hội viên --</option>
                {/* Fallback to all members if none trained yet so PT can select any */}
                {(myMembers.length > 0 ? myMembers : members).map(m => (
                  <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cân nặng (kg) *</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                placeholder="vd: 72.5" 
                required
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tỷ lệ mỡ Body Fat (%) *</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                placeholder="vd: 18.2" 
                required
                value={bodyFat}
                onChange={e => setBodyFat(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Khối lượng cơ Muscle Mass (kg) *</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                placeholder="vd: 34.0" 
                required
                value={muscleMass}
                onChange={e => setMuscleMass(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số đo vòng bụng (cm)</label>
              <input 
                type="number" 
                step="0.5" 
                className="form-input" 
                placeholder="vd: 84.5" 
                value={waist}
                onChange={e => setWaist(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
              Lưu Chỉ Số Đo Đạc
            </button>
          </form>
        </div>
        </div>
      </div>

      )}

      {activeTab === 'students' && (
        <div style={{ marginTop: '20px' }} className="animate-fade-in">
          {/* Search Box */}
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Tìm kiếm học viên theo tên, SĐT hoặc ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Student Grid */}
          {filteredStudents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Không tìm thấy học viên nào phù hợp.
            </div>
          ) : (
            <div className="grid-3">
              {filteredStudents.map(student => {
                const ptPkgs = getStudentPtPackages(student.id);
                const activePtPkg = ptPkgs[0];
                const studentBio = getMemberBiometrics(student.id) || [];
                const latestBio = studentBio[studentBio.length - 1];

                return (
                  <div key={student.id} className="glass-panel hover-scale" style={styles.studentCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={styles.studentAvatar}>
                        <User size={20} color="var(--primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{student.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {student.id}</span>
                      </div>
                      <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                        {student.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                      </span>
                    </div>

                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      <div><strong>SĐT:</strong> {student.phone}</div>
                      <div>
                        <strong>Gói PT:</strong>{' '}
                        {activePtPkg ? (
                          <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                            {activePtPkg.pkg.name} ({activePtPkg.mp.remainingSessions} / {activePtPkg.pkg.sessions} buổi)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Không có gói PT hoạt động</span>
                        )}
                      </div>
                      {latestBio && (
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '4px', marginTop: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                          <strong>Chỉ số cuối:</strong> {latestBio.weight}kg | Mỡ {latestBio.bodyFat}% | Cơ {latestBio.muscleMass}kg
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentDetailModal(true);
                        }} 
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        Hồ sơ chi tiết
                      </button>
                      <button 
                        onClick={() => {
                          setQuickBioStudent(student);
                          setQuickBioWeight(latestBio ? latestBio.weight : '');
                          setQuickBioFat(latestBio ? latestBio.bodyFat : '');
                          setQuickBioMuscle(latestBio ? latestBio.muscleMass : '');
                          setQuickBioWaist(latestBio ? latestBio.waist : '');
                          setShowQuickBioModal(true);
                        }} 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        Đo sinh trắc
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Enrolled Members Modal (NV-08) */}
      {selectedClassForEnrolled && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, width: '90%', maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Users size={18} color="var(--primary)" /> Danh Sách Học Viên: {selectedClassForEnrolled.className}
              </h3>
              <button 
                onClick={() => setSelectedClassForEnrolled(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Học viên</th>
                    <th style={styles.th}>Số buổi đã đi</th>
                    <th style={styles.th}>Lịch đăng ký</th>
                    <th style={styles.th}>Chọn ngày học</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const classBookings = groupClassBookings.filter(b => b.classId === selectedClassForEnrolled.id);
                    const enrolledMemberIds = [...new Set(classBookings.map(b => b.memberId))];
                    const enrolledMembers = members.filter(m => {
                      if (!enrolledMemberIds.includes(m.id)) return false;
                      const activeSubs = memberPackages.filter(mp => mp.memberId === m.id && mp.status === 'active');
                      return activeSubs.some(sub => {
                        const pkg = packages.find(p => p.id === sub.packageId);
                        return pkg && pkg.type === 'class';
                      });
                    });
                    const defaultToday = new Date().toISOString().split('T')[0];

                    return enrolledMembers.map(m => {
                      const memberBookings = classBookings.filter(b => b.memberId === m.id);
                      const attendedCount = memberBookings.filter(b => b.status === 'attended').length;
                      
                      // Format list of booked dates (dd/mm)
                      const datesList = memberBookings.map(b => {
                        const dateFormatted = b.date.split('-').reverse().slice(0, 2).join('/');
                        return `${dateFormatted} (${b.status === 'attended' ? 'Đã đi' : 'Chờ tập'})`;
                      }).join(', ');

                      const selectedDate = attendanceDates[m.id] || defaultToday;
                      const hasAttendedTargetDate = memberBookings.some(b => b.date === selectedDate && b.status === 'attended');

                      return (
                        <tr key={m.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <strong>{m.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SĐT: {m.phone}</div>
                          </td>
                          <td style={styles.td}>
                            <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {attendedCount} buổi
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '180px', wordBreak: 'break-all' }}>
                            {datesList || 'N/A'}
                          </td>
                          <td style={styles.td}>
                            <input 
                              type="date" 
                              value={selectedDate}
                              onChange={e => setAttendanceDates({ ...attendanceDates, [m.id]: e.target.value })}
                              style={{ 
                                background: '#ffffff', 
                                color: '#000000', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid var(--border-color)', 
                                colorScheme: 'light',
                                fontSize: '0.8rem'
                              }}
                            />
                          </td>
                          <td style={styles.td}>
                            {hasAttendedTargetDate ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>✓ Đã điểm danh</span>
                            ) : (
                              <button 
                                onClick={() => handleAttendanceCheckIn(m.id, selectedDate)}
                                style={{
                                  background: 'var(--success-glow)', 
                                  color: 'var(--success)', 
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  fontWeight: '600'
                                }}
                              >
                                Điểm Danh
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  {groupClassBookings.filter(b => b.classId === selectedClassForEnrolled.id).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có học viên nào đăng ký lớp này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedClassForEnrolled(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showStudentDetailModal && selectedStudent && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={20} color="var(--primary)" /> Chi Tiết Hồ Sơ Học Viên: {selectedStudent.name}
              </h3>
              <button 
                onClick={() => {
                  setSelectedStudent(null);
                  setShowStudentDetailModal(false);
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid-2" style={{ gap: '20px', textAlign: 'left' }}>
              {/* Left Column: Personal info & Packages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--primary)' }}>Thông tin cá nhân</h4>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)', width: '35%' }}>Mã Học Viên:</td>
                        <td style={{ padding: '6px 0', fontWeight: 'bold' }}>{selectedStudent.id}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Số điện thoại:</td>
                        <td style={{ padding: '6px 0' }}>{selectedStudent.phone}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Email:</td>
                        <td style={{ padding: '6px 0' }}>{selectedStudent.email || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>CCCD:</td>
                        <td style={{ padding: '6px 0' }}>{selectedStudent.cccd || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Ngày gia nhập:</td>
                        <td style={{ padding: '6px 0' }}>{selectedStudent.joinDate}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Trạng thái:</td>
                        <td style={{ padding: '6px 0' }}>
                          <span className={`badge ${selectedStudent.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {selectedStudent.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--secondary)' }}><Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> Các gói tập dịch vụ</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {memberPackages.filter(mp => mp.memberId === selectedStudent.id).map(mp => {
                      const pkg = packages.find(p => p.id === mp.packageId) || {};
                      const isExpired = new Date(mp.endDate) < new Date();
                      return (
                        <div key={mp.id} style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{pkg.name || 'Gói tập'}</span>
                            <span className={`badge ${isExpired ? 'badge-danger' : mp.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem' }}>
                              {isExpired ? 'Hết hạn' : mp.status === 'active' ? 'Đang tập' : 'Đã hủy'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Thời hạn: {mp.startDate} đến {mp.endDate}
                          </div>
                          {pkg.type === 'pt' && (
                            <div style={{ marginTop: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>
                              Số buổi PT còn lại: {mp.remainingSessions} / {pkg.sessions}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {memberPackages.filter(mp => mp.memberId === selectedStudent.id).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Học viên này chưa đăng ký gói dịch vụ nào.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Biometrics Chart & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)' }}>Tiến trình sức khỏe (Biometrics)</h4>
                    <button 
                      onClick={() => {
                        const studentBio = getMemberBiometrics(selectedStudent.id) || [];
                        const latest = studentBio[studentBio.length - 1];
                        setQuickBioStudent(selectedStudent);
                        setQuickBioWeight(latest ? latest.weight : '');
                        setQuickBioFat(latest ? latest.bodyFat : '');
                        setQuickBioMuscle(latest ? latest.muscleMass : '');
                        setQuickBioWaist(latest ? latest.waist : '');
                        setShowQuickBioModal(true);
                      }}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      Đo chỉ số mới
                    </button>
                  </div>
                  {renderStudentBiometricsChart(selectedStudent.id)}
                </div>

                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--secondary)' }}>Lịch sử ca tập với bạn</h4>
                  <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '6px 4px' }}>Thời gian</th>
                          <th style={{ padding: '6px 4px' }}>Loại lịch</th>
                          <th style={{ padding: '6px 4px' }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.filter(s => s.ptId === currentUser.id && s.memberId === selectedStudent.id)
                          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
                          .map(s => {
                            const date = new Date(s.dateTime);
                            return (
                              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '6px 4px', fontWeight: '600' }}>
                                  {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '6px 4px' }}>
                                  {s.bookingType === 'fixed' ? 'Cố định' : 'Linh hoạt'}
                                </td>
                                <td style={{ padding: '6px 4px' }}>
                                  <span className={`badge ${
                                    s.status === 'confirmed' ? 'badge-success' :
                                    s.status === 'pending' ? 'badge-warning' :
                                    s.status === 'completed' ? 'badge-info' : 'badge-danger'
                                  }`} style={{ fontSize: '0.6rem' }}>
                                    {s.status === 'confirmed' ? 'Đã duyệt' :
                                     s.status === 'pending' ? 'Chờ duyệt' :
                                     s.status === 'completed' ? 'Xong' : 'Đã hủy'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        {sessions.filter(s => s.ptId === currentUser.id && s.memberId === selectedStudent.id).length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có ca tập nào được lên lịch.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <button 
                onClick={() => {
                  setSelectedStudent(null);
                  setShowStudentDetailModal(false);
                }} 
                className="btn btn-outline" 
                style={{ padding: '8px 20px' }}
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Biometrics Modal */}
      {showQuickBioModal && quickBioStudent && (
        <div style={{ ...styles.modalOverlay, zIndex: 1010 }}>
          <div className="glass-panel animate-fade-in" style={{ ...styles.modalContent, width: '90%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <ClipboardList size={18} color="var(--primary)" /> Nhập Chỉ Số Đo: {quickBioStudent.name}
              </h3>
              <button 
                onClick={() => {
                  setQuickBioStudent(null);
                  setShowQuickBioModal(false);
                  setQuickBioSuccess('');
                  setQuickBioError('');
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {quickBioSuccess && (
              <div style={{ ...styles.alert, backgroundColor: 'var(--success-glow)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '15px' }}>
                <CheckCircle size={16} /> <span>{quickBioSuccess}</span>
              </div>
            )}

            {quickBioError && (
              <div style={{ ...styles.alert, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '15px' }}>
                <XCircle size={16} /> <span>{quickBioError}</span>
              </div>
            )}

            <form onSubmit={handleQuickBiometricsSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Học viên</label>
                <input type="text" className="form-input" value={`${quickBioStudent.name} (ID: ${quickBioStudent.id})`} disabled style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Cân nặng (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  placeholder="vd: 72.5" 
                  required
                  value={quickBioWeight}
                  onChange={e => setQuickBioWeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tỷ lệ mỡ Body Fat (%) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  placeholder="vd: 18.2" 
                  required
                  value={quickBioFat}
                  onChange={e => setQuickBioFat(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Khối lượng cơ Muscle Mass (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  placeholder="vd: 34.0" 
                  required
                  value={quickBioMuscle}
                  onChange={e => setQuickBioMuscle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số đo vòng bụng (cm)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  className="form-input" 
                  placeholder="vd: 84.5" 
                  value={quickBioWaist}
                  onChange={e => setQuickBioWaist(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setQuickBioStudent(null);
                    setShowQuickBioModal(false);
                    setQuickBioSuccess('');
                    setQuickBioError('');
                  }} 
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px' }}
                >
                  Lưu chỉ số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 0',
    textAlign: 'left'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px'
  },
  welcomeText: {
    fontSize: '1.8rem',
    fontWeight: '800'
  },
  specialtyText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '4px'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
    gap: '20px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 16px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginBottom: '-1px'
  },
  studentCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  studentAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)'
  },
  sessionList: {
    flexGrow: 1,
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '2px solid var(--border-color)'
  },
  th: {
    padding: '12px 8px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: '0.2s'
  },
  td: {
    padding: '12px 8px',
    fontSize: '0.85rem'
  },
  actionBtn: {
    border: '1px solid',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
  },
  alert: {
    borderRadius: 'var(--border-radius-sm)',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    marginBottom: '15px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    padding: '24px',
    maxWidth: '550px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  navBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    transition: '0.2s'
  },
  calTh: {
    padding: '8px 5px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textAlign: 'center',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-secondary)'
  },
  calTd: {
    padding: '4px 5px',
    verticalAlign: 'top',
    minWidth: '85px',
    minHeight: '32px',
    borderRight: '1px solid var(--border-color)'
  }
};
