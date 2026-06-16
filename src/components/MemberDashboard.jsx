import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Calendar, Activity, CheckCircle, Clock, AlertCircle, Trash2, Shield, Plus, Users, X, ChevronLeft, ChevronRight, User } from 'lucide-react';

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const TIME_SLOTS = ['05:00','06:00','07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

export default function MemberDashboard() {
  const { 
    currentUser, 
    memberPackages, 
    packages, 
    pts, 
    sessions, 
    groupClasses,
    groupClassBookings,
    scheduleRequests,
    handleAddSession, 
    handleUpdateSessionStatus,
    handleBookGroupClass,
    handleCancelGroupClassBooking,
    handleRequestSchedule,
    handleCancelScheduleRequest,
    getMemberBiometrics 
  } = useApp();

  // Modal & tab state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('fixed'); // 'fixed' | 'ondemand' | 'class'
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Fixed schedule form
  const [fixedPtId, setFixedPtId] = useState('');
  const [fixedPackageId, setFixedPackageId] = useState(''); // memberPackage id
  const [fixedDays, setFixedDays] = useState([]);
  const [fixedTime, setFixedTime] = useState('07:00');

  // On-demand form
  const [ptId, setPtId] = useState('');
  const [dateTime, setDateTime] = useState('');

  // Class booking form
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classDate, setClassDate] = useState('');

  // PT reject note modal
  const [showRejectNote, setShowRejectNote] = useState(null);

  // Weekly calendar state: offset in weeks from current week
  const [weekOffset, setWeekOffset] = useState(0);

  if (!currentUser) return <div>Không tìm thấy hội viên!</div>;

  const mySubscriptions = memberPackages.filter(sub => sub.memberId === currentUser.id);
  const mySessions = sessions.filter(s => s.memberId === currentUser.id).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const myClassBookings = groupClassBookings.filter(b => b.memberId === currentUser.id);
  const myBiometrics = getMemberBiometrics(currentUser.id);
  const myScheduleRequests = scheduleRequests.filter(r => r.memberId === currentUser.id);

  // Active PT packages (for fixed schedule form)
  const activePtPackages = mySubscriptions.filter(sub => {
    const pkg = packages.find(p => p.id === sub.packageId);
    return sub.status === 'active' && pkg && pkg.type === 'pt' && sub.remainingSessions > 0;
  });

  const getPackageDetails = (pkgId) => packages.find(p => p.id === pkgId) || {};

  // --- Weekly Calendar helpers ---
  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    // Monday as start
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
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

  // Build events for the week
  const getWeekEvents = () => {
    const events = {}; // key: "dayIndex-hour"
    const addEvent = (dayIdx, hour, event) => {
      const key = `${dayIdx}-${hour}`;
      if (!events[key]) events[key] = [];
      events[key].push(event);
    };

    weekDates.forEach((date, dayIdx) => {
      const dateStr = date.toISOString().split('T')[0];
      // PT sessions
      mySessions.forEach(s => {
        const sDate = s.dateTime.split('T')[0];
        const sHour = parseInt(s.dateTime.split('T')[1]?.split(':')[0] || 0, 10);
        if (sDate === dateStr) {
          const trainer = pts.find(p => p.id === s.ptId) || {};
          addEvent(dayIdx, sHour, { type: 'pt', label: `PT: ${trainer.name?.split(' ').pop() || 'HLV'}`, time: s.dateTime.split('T')[1]?.slice(0,5), status: s.status });
        }
      });
      // Class bookings
      myClassBookings.forEach(b => {
        if (b.date === dateStr) {
          const cls = groupClasses.find(c => c.id === b.classId) || {};
          const clsHour = parseInt(cls.time?.split(':')[0] || 8, 10);
          addEvent(dayIdx, clsHour, { type: 'class', label: cls.className || 'Lớp nhóm', time: cls.time?.split(' ')[0], status: b.status });
        }
      });
    });
    return events;
  };

  const weekEvents = getWeekEvents();
  const displayHours = [6,7,8,9,10,11,14,15,16,17,18,19,20];

  // --- Handlers ---
  const handleFixedScheduleSubmit = async (e) => {
    e.preventDefault();
    setBookingError(''); setBookingSuccess('');
    if (!fixedPtId || !fixedPackageId || fixedDays.length === 0 || !fixedTime) {
      setBookingError('Vui lòng điền đầy đủ thông tin lịch tập cố định!');
      return;
    }
    const mp = mySubscriptions.find(s => s.id === fixedPackageId);
    if (!mp) { setBookingError('Không tìm thấy gói tập!'); return; }
    const sessionsPerWeek = fixedDays.length;
    const res = await handleRequestSchedule(currentUser.id, fixedPtId, fixedPackageId, {
      type: 'fixed',
      daysOfWeek: fixedDays,
      timeSlot: fixedTime,
      sessionsPerWeek
    });
    if (res.success) {
      setBookingSuccess('Yêu cầu đăng ký lịch cố định đã gửi thành công! Đang chờ HLV phê duyệt.');
      setFixedPtId(''); setFixedDays([]); setFixedPackageId(''); setFixedTime('07:00');
      setTimeout(() => { setBookingSuccess(''); setShowBookingModal(false); }, 3000);
    } else {
      setBookingError(res.message);
    }
  };

  const handleOnDemandSubmit = async (e) => {
    e.preventDefault();
    setBookingError(''); setBookingSuccess('');
    if (!ptId || !dateTime) {
      setBookingError('Vui lòng chọn huấn luyện viên và thời gian tập!');
      return;
    }
    const res = await handleAddSession(currentUser.id, ptId, dateTime, 'ondemand');
    if (res.success) {
      setBookingSuccess('Đã gửi yêu cầu đặt lịch buổi đơn! Đang chờ PT xác nhận.');
      setPtId(''); setDateTime('');
      setTimeout(() => { setBookingSuccess(''); setShowBookingModal(false); }, 3000);
    } else {
      setBookingError(res.message);
    }
  };

  const handleBookClassSubmit = async (e) => {
    e.preventDefault();
    setBookingError(''); setBookingSuccess('');
    if (!selectedClassId || !classDate) {
      setBookingError('Vui lòng chọn lớp học và ngày học!');
      return;
    }
    const res = await handleBookGroupClass(currentUser.id, selectedClassId, classDate);
    if (res.success) {
      setBookingSuccess('Đăng ký lớp học nhóm thành công!');
      setSelectedClassId(''); setClassDate('');
      setTimeout(() => { setBookingSuccess(''); setShowBookingModal(false); }, 3000);
    } else {
      setBookingError(res.message);
    }
  };

  const toggleFixedDay = (day) => {
    setFixedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // Biometrics chart
  const renderBiometricsChart = () => {
    if (myBiometrics.length === 0) {
      return (
        <div style={styles.emptyChart}>
          <Activity size={32} color="var(--text-muted)" />
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Chưa có dữ liệu sinh trắc học. Yêu cầu PT đo đạc và nhập liệu!</p>
        </div>
      );
    }
    const width = 450; const height = 180; const padding = 30;
    const weights = myBiometrics.map(b => b.weight);
    const bodyFats = myBiometrics.map(b => b.bodyFat);
    const minW = Math.min(...weights) - 2; const maxW = Math.max(...weights) + 2; const rangeW = maxW - minW || 1;
    const minBF = Math.min(...bodyFats) - 2; const maxBF = Math.max(...bodyFats) + 2; const rangeBF = maxBF - minBF || 1;
    const getX = (i) => padding + (i * (width - 2 * padding) / (myBiometrics.length - 1 || 1));
    const getWeightY = (w) => height - padding - ((w - minW) * (height - 2 * padding) / rangeW);
    const getBFY = (bf) => height - padding - ((bf - minBF) * (height - 2 * padding) / rangeBF);
    let weightPath = ''; let bfPath = '';
    myBiometrics.forEach((bio, idx) => {
      const x = getX(idx); const yw = getWeightY(bio.weight); const ybf = getBFY(bio.bodyFat);
      if (idx === 0) { weightPath = `M ${x} ${yw}`; bfPath = `M ${x} ${ybf}`; }
      else { weightPath += ` L ${x} ${yw}`; bfPath += ` L ${x} ${ybf}`; }
    });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.1)" />
          {myBiometrics.length > 1 && <path d={weightPath} fill="none" stroke="var(--primary)" strokeWidth="3" />}
          {myBiometrics.map((bio, idx) => (
            <g key={`w-${idx}`}>
              <circle cx={getX(idx)} cy={getWeightY(bio.weight)} r="4" fill="#ffffff" stroke="var(--primary)" strokeWidth="2" />
              <text x={getX(idx)} y={getWeightY(bio.weight)-8} fill="var(--text-primary)" fontSize="10" textAnchor="middle">{bio.weight}kg</text>
            </g>
          ))}
          {myBiometrics.length > 1 && <path d={bfPath} fill="none" stroke="var(--secondary)" strokeWidth="2" strokeDasharray="4" />}
          {myBiometrics.map((bio, idx) => (
            <g key={`bf-${idx}`}>
              <circle cx={getX(idx)} cy={getBFY(bio.bodyFat)} r="4" fill="#ffffff" stroke="var(--secondary)" strokeWidth="2" />
              <text x={getX(idx)} y={getBFY(bio.bodyFat)+14} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">{bio.bodyFat}%</text>
            </g>
          ))}
          {myBiometrics.map((bio, idx) => (
            <text key={`lbl-${idx}`} x={getX(idx)} y={height-8} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{bio.date.slice(5)}</text>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: 'var(--primary)', display: 'inline-block' }}></span>
            <span>Cân Nặng (kg)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', borderTop: '2px dashed var(--secondary)', display: 'inline-block' }}></span>
            <span>Tỷ Lệ Mỡ Body Fat (%)</span>
          </div>
        </div>
      </div>
    );
  };

  const statusBadge = (status) => {
    if (status === 'pending') return <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>⏳ Chờ duyệt</span>;
    if (status === 'approved') return <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✅ Đã duyệt</span>;
    if (status === 'rejected') return <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>❌ Bị từ chối</span>;
    if (status === 'cancelled') return <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--border-color)' }}>Đã hủy</span>;
    return null;
  };

  // --- Week navigation ---
  const fmt = (d) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const weekLabel = `${fmt(weekDates[0])} - ${fmt(weekDates[6])}`;

  return (
    <div className="member-dashboard animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.welcomeText}>Hội Viên: {currentUser.name}</h2>
          <p style={styles.memberIdText}>Mã HV: <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{currentUser.id}</span> | SĐT: {currentUser.phone}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${currentUser.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
            {currentUser.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
          </span>
          <button
            onClick={() => setShowProfileModal(true)}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <User size={15} /> Chi tiết người dùng
          </button>
          <button
            onClick={() => { setBookingError(''); setBookingSuccess(''); setShowBookingModal(true); }}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Đặt lịch
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '20px' }}>
        {/* QR Card */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}><QrCode size={18} /> Thẻ Thành Viên</h3>
          <div style={styles.qrContainer}>
            <div style={styles.qrBorder}>
              <div style={styles.qrInnerBlock}>
                <div style={{ ...styles.qrDot, top: 10, left: 10 }}></div>
                <div style={{ ...styles.qrDot, top: 10, right: 10 }}></div>
                <div style={{ ...styles.qrDot, bottom: 10, left: 10 }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800' }}>GMS PASS</span>
                  <span style={{ fontSize: '0.9rem', color: '#000', fontWeight: '800', letterSpacing: '2px' }}>{currentUser.qrCode}</span>
                </div>
              </div>
            </div>
            <p style={styles.qrInstructions}>Đưa mã QR trước máy quét ở cổng để check-in tự động.</p>
          </div>
        </div>

        {/* Biometrics */}
        <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2' }}>
          <h3 style={styles.cardTitle}><Activity size={18} /> Chỉ Số Biometrics & Sức Khỏe</h3>
          {renderBiometricsChart()}
          {myBiometrics.length > 0 && (
            <div className="grid-3" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              {[
                { label: 'Cân nặng cuối', val: `${myBiometrics[myBiometrics.length-1].weight} kg` },
                { label: 'Tỷ lệ mỡ', val: `${myBiometrics[myBiometrics.length-1].bodyFat} %` },
                { label: 'Vòng bụng', val: `${myBiometrics[myBiometrics.length-1].waist} cm` },
              ].map(s => (
                <div key={s.label} style={styles.statMiniCard}>
                  <span style={styles.statMiniVal}>{s.val}</span>
                  <span style={styles.statMiniLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Packages + Schedule Requests side by side */}
      <div className="grid-3" style={{ marginTop: '24px' }}>
        <div className="glass-panel" style={{ ...styles.card }}>
          <h3 style={styles.cardTitle}><Shield size={18} /> Gói Dịch Vụ Của Bạn</h3>
          <div style={styles.subList}>
            {mySubscriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bạn chưa đăng ký gói tập nào.</p>
            ) : mySubscriptions.map(sub => {
              const pkg = getPackageDetails(sub.packageId);
              const isExpired = new Date(sub.endDate) < new Date();
              return (
                <div key={sub.id} style={{ ...styles.subItem, borderLeft: `4px solid ${isExpired ? 'var(--danger)' : pkg.type === 'pt' ? 'var(--primary)' : 'var(--secondary)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h4 style={styles.subName}>{pkg.name || 'Gói Tập'}</h4>
                    <span className={`badge ${isExpired ? 'badge-danger' : sub.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {isExpired ? 'Hết Hạn' : sub.status === 'active' ? 'Đang dùng' : 'Hủy bỏ'}
                    </span>
                  </div>
                  <div style={styles.subMeta}>
                    <div><strong>Loại:</strong> {pkg.type === 'pt' ? 'Gói PT Cá nhân' : pkg.type === 'class' ? 'Lớp nhóm' : pkg.type === 'swimming' ? 'Bơi lội' : 'Phổ thông'}</div>
                    <div><strong>Hạn:</strong> {sub.startDate} → {sub.endDate}</div>
                    {pkg.type === 'pt' && (
                      <div style={{ marginTop: '6px', fontWeight: 'bold', color: 'var(--primary)', background: 'var(--bg-dark)', padding: '4px 8px', borderRadius: '4px' }}>
                        Còn lại: {sub.remainingSessions} / {pkg.sessions} buổi PT
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Requests Status Panel */}
        <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2' }}>
          <h3 style={styles.cardTitle}><Clock size={18} /> Yêu Cầu Lịch Tập Cố Định</h3>
          {myScheduleRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
              <p>Bạn chưa đăng ký lịch tập cố định nào.</p>
              {activePtPackages.length > 0 && (
                <button
                  onClick={() => { setActiveBookingTab('fixed'); setShowBookingModal(true); }}
                  className="btn btn-primary"
                  style={{ marginTop: '12px', padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  + Đăng ký lịch cố định
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto' }}>
              {myScheduleRequests.map(req => {
                const pt = pts.find(p => p.id === req.ptId) || {};
                const mp = memberPackages.find(m => m.id === req.memberPackageId) || {};
                const pkg = getPackageDetails(mp.packageId);
                return (
                  <div key={req.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${req.status === 'approved' ? 'rgba(16,185,129,0.3)' : req.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '14px 16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                          📅 {req.daysOfWeek.join(', ')} — {req.timeSlot}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          HLV: {pt.name} | Gói: {pkg.name} | {req.sessionsPerWeek} buổi/tuần
                        </div>
                      </div>
                      {statusBadge(req.status)}
                    </div>
                    {req.status === 'approved' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', background: 'var(--success-glow)', padding: '4px 8px', borderRadius: '4px' }}>
                        ✅ Lịch đã được duyệt. Sessions đã được tạo tự động cho toàn bộ gói tập.
                      </div>
                    )}
                    {req.status === 'rejected' && req.ptNote && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'var(--danger-glow)', padding: '4px 8px', borderRadius: '4px' }}>
                        ❌ Lý do từ HLV: {req.ptNote}
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancelScheduleRequest(req.id)}
                        style={{ marginTop: '6px', background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="glass-panel" style={{ ...styles.card, marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ ...styles.cardTitle, margin: 0 }}><Calendar size={18} /> Lịch Trình Tuần</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={styles.navBtn}><ChevronLeft size={16} /></button>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{weekLabel}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} style={styles.navBtn}><ChevronRight size={16} /></button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} style={{ ...styles.navBtn, fontSize: '0.75rem', padding: '4px 8px' }}>Hôm nay</button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ ...styles.calTh, width: '60px' }}>Giờ</th>
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <th key={i} style={{ ...styles.calTh, background: isToday ? 'rgba(99,102,241,0.15)' : 'transparent', borderRadius: '4px' }}>
                      <div style={{ color: isToday ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isToday ? '700' : '600', fontSize: '0.75rem' }}>{weekDayNames[i]}</div>
                      <div style={{ color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem' }}>{date.getDate()}/{date.getMonth()+1}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayHours.map(hour => (
                <tr key={hour} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ ...styles.calTd, color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', fontWeight: '600' }}>
                    {hour}:00
                  </td>
                  {weekDates.map((_, dayIdx) => {
                    const key = `${dayIdx}-${hour}`;
                    const evts = weekEvents[key] || [];
                    return (
                      <td key={dayIdx} style={styles.calTd}>
                        {evts.map((evt, ei) => (
                          <div key={ei} style={{
                            background: evt.type === 'pt' ? 'rgba(99,102,241,0.18)' : 'rgba(139,92,246,0.18)',
                            border: `1px solid ${evt.type === 'pt' ? 'rgba(99,102,241,0.5)' : 'rgba(139,92,246,0.5)'}`,
                            borderRadius: '4px',
                            padding: '3px 5px',
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            marginBottom: '2px',
                            color: evt.type === 'pt' ? 'var(--primary)' : '#a78bfa',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {evt.time && <span style={{ opacity: 0.8 }}>{evt.time} </span>}
                            {evt.label}
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
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '2px' }}></div>
            <span>Ca PT 1:1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '2px' }}></div>
            <span>Lớp nhóm</span>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>📅 Đặt Lịch Tập</h3>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', gap: '4px' }}>
              {[
                { key: 'fixed', label: '📌 Lịch Cố Định', disabled: activePtPackages.length === 0 },
                { key: 'ondemand', label: '⚡ Đặt Lẻ Linh Hoạt', disabled: activePtPackages.length === 0 },
                { key: 'class', label: '👥 Lớp Nhóm', disabled: false }
              ].map(tab => (
                <button
                  key={tab.key}
                  disabled={tab.disabled}
                  onClick={() => { setActiveBookingTab(tab.key); setBookingError(''); setBookingSuccess(''); }}
                  style={{
                    flex: 1, background: 'none', border: 'none', padding: '10px 6px', fontWeight: 'bold', cursor: tab.disabled ? 'not-allowed' : 'pointer',
                    borderBottom: activeBookingTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
                    color: tab.disabled ? 'var(--text-muted)' : activeBookingTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.8rem', opacity: tab.disabled ? 0.5 : 1
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {bookingError && (
              <div style={{ ...styles.errorAlert, marginBottom: '15px' }}>
                <AlertCircle size={16} /> <span>{bookingError}</span>
              </div>
            )}
            {bookingSuccess && (
              <div style={{ ...styles.successAlert, marginBottom: '15px' }}>
                <CheckCircle size={16} /> <span>{bookingSuccess}</span>
              </div>
            )}

            {/* Fixed schedule form */}
            {activeBookingTab === 'fixed' && (
              <form onSubmit={handleFixedScheduleSubmit}>
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  📌 <strong>Lịch cố định</strong>: Chọn ngày + giờ cố định mỗi tuần cho toàn bộ gói tập. PT sẽ phê duyệt và hệ thống tự sinh lịch.
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn Gói PT *</label>
                  <select className="form-input" value={fixedPackageId} onChange={e => {
                    setFixedPackageId(e.target.value);
                    const mp = mySubscriptions.find(s => s.id === e.target.value);
                    // Auto-select the PT if package has a linked request
                  }} style={{ background: '#fff', border: '1px solid var(--border-color)' }} required>
                    <option value="">-- Chọn gói PT --</option>
                    {activePtPackages.map(mp => {
                      const pkg = getPackageDetails(mp.packageId);
                      return <option key={mp.id} value={mp.id}>{pkg.name} (còn {mp.remainingSessions} buổi)</option>;
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn Huấn Luyện Viên *</label>
                  <select className="form-input" value={fixedPtId} onChange={e => setFixedPtId(e.target.value)} style={{ background: '#fff', border: '1px solid var(--border-color)' }} required>
                    <option value="">-- Chọn PT --</option>
                    {pts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.specialty})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn ngày tập trong tuần *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleFixedDay(day)}
                        style={{
                          padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                          border: `1px solid ${fixedDays.includes(day) ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: fixedDays.includes(day) ? 'rgba(99,102,241,0.2)' : 'transparent',
                          color: fixedDays.includes(day) ? 'var(--primary)' : 'var(--text-secondary)',
                          transition: '0.2s'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {fixedDays.length > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ✓ {fixedDays.length} buổi/tuần đã chọn
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Giờ tập cố định *</label>
                  <select className="form-input" value={fixedTime} onChange={e => setFixedTime(e.target.value)} style={{ background: '#fff', border: '1px solid var(--border-color)' }}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>Gửi yêu cầu lịch</button>
                </div>
              </form>
            )}

            {/* On-demand form */}
            {activeBookingTab === 'ondemand' && (
              <form onSubmit={handleOnDemandSubmit}>
                <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ⚡ <strong>Đặt lẻ linh hoạt</strong>: Đặt từng buổi tập riêng lẻ với ngày và giờ cụ thể. Phù hợp khi cần thay đổi lịch hoặc tập bù.
                </div>
                <div className="form-group">
                  <label className="form-label">Chọn Huấn Luyện Viên *</label>
                  <select className="form-input" value={ptId} onChange={e => setPtId(e.target.value)} style={{ background: '#fff', border: '1px solid var(--border-color)' }} required>
                    <option value="">-- Chọn PT --</option>
                    {pts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.specialty})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thời gian tập *</label>
                  <input type="datetime-local" className="form-input" value={dateTime} onChange={e => setDateTime(e.target.value)} style={{ background: '#fff', colorScheme: 'light' }} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>Gửi yêu cầu buổi</button>
                </div>
              </form>
            )}

            {/* Group class form */}
            {activeBookingTab === 'class' && (
              <form onSubmit={handleBookClassSubmit}>
                <div className="form-group">
                  <label className="form-label">Chọn Lớp Học Nhóm *</label>
                  <select className="form-input" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} style={{ background: '#fff', border: '1px solid var(--border-color)' }} required>
                    <option value="">-- Chọn lớp học --</option>
                    {groupClasses.map(c => {
                      const trainer = pts.find(p => p.id === c.trainerId) || {};
                      return <option key={c.id} value={c.id}>{c.className} (HLV: {trainer.name?.split(' ').pop()} | {c.dayOfWeek} {c.time} | {c.currentEnrolled}/{c.maxCapacity} HV)</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chọn Ngày Học *</label>
                  <input type="date" className="form-input" value={classDate} onChange={e => setClassDate(e.target.value)} style={{ background: '#fff', colorScheme: 'light' }} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>Đăng ký tham gia</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <User size={20} /> Thông Tin Cá Nhân
              </h3>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            {/* Profile Avatar / Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                {currentUser.name ? currentUser.name.split(' ').pop().charAt(0).toUpperCase() : 'M'}
              </div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>{currentUser.name}</h4>
              <span className={`badge ${currentUser.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                {currentUser.status === 'active' ? 'Tài khoản: Hoạt động' : 'Tài khoản: Hết hạn'}
              </span>
            </div>

            {/* Detailed Info Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Mã Hội Viên:</span>
                <span style={styles.profileValue}>{currentUser.id}</span>
              </div>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Số Điện Thoại:</span>
                <span style={styles.profileValue}>{currentUser.phone}</span>
              </div>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Email:</span>
                <span style={styles.profileValue}>{currentUser.email || 'Chưa cập nhật'}</span>
              </div>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Số CCCD:</span>
                <span style={styles.profileValue}>{currentUser.cccd || 'Chưa cập nhật'}</span>
              </div>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Ngày Tham Gia:</span>
                <span style={styles.profileValue}>{currentUser.joinDate || 'Chưa cập nhật'}</span>
              </div>
              <div style={styles.profileField}>
                <span style={styles.profileLabel}>Mã QR Pass:</span>
                <span style={{ ...styles.profileValue, fontFamily: 'monospace', color: 'var(--secondary)' }}>{currentUser.qrCode}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button onClick={() => setShowProfileModal(false)} className="btn btn-primary" style={{ padding: '8px 24px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px 0', textAlign: 'left' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' },
  welcomeText: { fontSize: '1.8rem', fontWeight: '800' },
  memberIdText: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' },
  card: { padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' },
  cardTitle: { fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' },
  qrContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  qrBorder: { width: '150px', height: '150px', backgroundColor: '#fff', borderRadius: '16px', padding: '12px', boxShadow: '0 0 20px rgba(255,255,255,0.1)', marginBottom: '15px' },
  qrInnerBlock: { width: '100%', height: '100%', border: '3px solid #000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  qrDot: { width: '28px', height: '28px', backgroundColor: '#000', position: 'absolute' },
  qrInstructions: { fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' },
  emptyChart: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', textAlign: 'center' },
  statMiniCard: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statMiniVal: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--secondary)' },
  statMiniLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' },
  subList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto' },
  subItem: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  subName: { fontSize: '0.9rem', fontWeight: '700' },
  subMeta: { fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', width: '100%' },
  calTh: { padding: '10px 6px', fontSize: '0.78rem', fontWeight: '700', textAlign: 'center', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' },
  calTd: { padding: '5px 6px', verticalAlign: 'top', minWidth: '90px', minHeight: '36px', borderRight: '1px solid var(--border-color)' },
  navBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', transition: '0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' },
  errorAlert: { backgroundColor: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' },
  successAlert: { backgroundColor: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' },
  profileField: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' },
  profileLabel: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' },
  profileValue: { fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }
};
