import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, Users, Shield, DollarSign, Calendar, Plus, Trash2, Edit2, 
  Check, X, FileText, Settings, AlertTriangle, ArrowRightLeft, Briefcase, Clock, User
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    members,
    packages,
    memberPackages,
    transactions,
    reversals,
    checkIns,
    pts,
    groupClasses,
    groupClassBookings,
    staff,
    handleAddPackage,
    handleDeletePackage,
    handleApproveReversal,
    handleSaveStaff,
    handleDeleteStaff,
    handleUpdateStaffShift,
    handleSaveGroupClass,
    handleDeleteGroupClass
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');

  // Report views
  const [timeRange, setTimeRange] = useState('all'); // 'day' | 'month' | 'all'

  // Member Management States
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);

  // Package Form states
  const [pkgId, setPkgId] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgType, setPkgType] = useState('classic');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDuration, setPkgDuration] = useState('');
  const [pkgSessions, setPkgSessions] = useState('');
  const [showPkgModal, setShowPkgModal] = useState(false);

  // Staff Form states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('receptionist');
  const [staffPassword, setStaffPassword] = useState('GMS@1234');
  const [staffSpecialty, setStaffSpecialty] = useState('');
  const [staffShift, setStaffShift] = useState('Ca Sáng (06:00 - 14:00)');

  // Group Class Form states
  const [showClassModal, setShowClassModal] = useState(false);
  const [classId, setClassId] = useState('');
  const [classNameState, setClassNameState] = useState('');
  const [classTrainerId, setClassTrainerId] = useState('');
  const [classDayOfWeek, setClassDayOfWeek] = useState('Thứ 2');
  const [classTime, setClassTime] = useState('08:00 - 09:30');
  const [classMaxCapacity, setClassMaxCapacity] = useState('15');

  // Filter transactions by timeRange
  const getFilteredTransactions = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    
    return transactions.filter(t => {
      if (!t.timestamp) return false;
      const tDate = t.timestamp.split('T')[0];
      if (timeRange === 'day') {
        return tDate === today;
      }
      if (timeRange === 'month') {
        return tDate.startsWith(currentMonth);
      }
      return true;
    });
  };

  // Filter check-ins by timeRange
  const getFilteredCheckIns = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    
    return checkIns.filter(ci => {
      if (!ci.timestamp) return false;
      const ciDate = ci.timestamp.split('T')[0];
      if (timeRange === 'day') {
        return ciDate === today;
      }
      if (timeRange === 'month') {
        return ciDate.startsWith(currentMonth);
      }
      return true;
    });
  };

  // Filter new members in timeRange
  const getFilteredNewMembersCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    return members.filter(m => {
      if (timeRange === 'day') return m.joinDate === today;
      if (timeRange === 'month') return m.joinDate.startsWith(currentMonth);
      return true;
    }).length;
  };

  const filteredTx = getFilteredTransactions();
  const completedTx = filteredTx.filter(t => t.status === 'completed');
  const totalRevenue = completedTx.reduce((sum, t) => sum + t.amount, 0);

  // Active membership count
  const activeSubs = memberPackages.filter(sp => sp.status === 'active');
  
  // Acquisition / Churn calculations
  const totalMembersCount = getFilteredNewMembersCount();
  const expiredSubsCount = memberPackages.filter(sp => sp.status === 'expired').length;
  const totalSubsCount = memberPackages.length || 1;
  const churnRate = ((expiredSubsCount / totalSubsCount) * 100).toFixed(1);
  const retentionRate = (100 - parseFloat(churnRate)).toFixed(1);

  // Today checkins and staff counts
  const filteredCheckInsCount = getFilteredCheckIns().length;
  const totalStaffCount = staff.length + pts.length;

  const getRevenueLabel = () => {
    if (timeRange === 'day') return 'DOANH THU HÔM NAY';
    if (timeRange === 'month') return 'DOANH THU THÁNG NÀY';
    return 'DOANH THU THỰC TẾ';
  };

  const getMembersLabel = () => {
    if (timeRange === 'day') return 'HỘI VIÊN MỚI HÔM NAY';
    if (timeRange === 'month') return 'HỘI VIÊN MỚI THÁNG NÀY';
    return 'TỔNG HỘI VIÊN';
  };

  const getCheckInsLabel = () => {
    if (timeRange === 'day') return 'CHECK-IN HÔM NAY';
    if (timeRange === 'month') return 'CHECK-IN THÁNG NÀY';
    return 'TỔNG LƯỢT CHECK-IN';
  };

  // Helper to check if member's packages are expiring in < 14 days
  const checkIsExpiringSoon = (memberId) => {
    const m = members.find(mbr => mbr.id === memberId);
    if (!m || m.status !== 'active') return false;
    const activeSubs = memberPackages.filter(sp => sp.memberId === memberId && sp.status === 'active');
    if (activeSubs.length === 0) return false;
    
    return activeSubs.some(sub => {
      const end = new Date(sub.endDate);
      const today = new Date();
      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 14;
    });
  };

  const getExpiringSoonDays = (memberId) => {
    const activeSubs = memberPackages.filter(sp => sp.memberId === memberId && sp.status === 'active');
    let minDays = 15;
    activeSubs.forEach(sub => {
      const end = new Date(sub.endDate);
      const today = new Date();
      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 14) {
        if (diffDays < minDays) minDays = diffDays;
      }
    });
    return minDays === 15 ? null : minDays;
  };

  const renderStatusBadge = (m) => {
    if (m.status === 'expired') {
      return <span className="badge badge-danger">Hết hạn</span>;
    }
    const daysLeft = getExpiringSoonDays(m.id);
    if (daysLeft !== null) {
      return (
        <span className="badge badge-warning" style={{ backgroundColor: 'var(--warning-glow)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          Sắp hết hạn ({daysLeft} ngày)
        </span>
      );
    }
    return <span className="badge badge-success">Hoạt động</span>;
  };

  // Filter members for member management (supports ID, Name, Phone, Email, CCCD, and Status filter)
  const filteredMembers = members.filter(m => {
    const q = memberSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.cccd && m.cccd.includes(q));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && m.status === 'active') ||
      (statusFilter === 'expired' && m.status === 'expired') ||
      (statusFilter === 'expiring_soon' && checkIsExpiringSoon(m.id));

    return matchesSearch && matchesStatus;
  });


  // Form submit for Packages CRUD
  const handlePkgSubmit = async (e) => {
    e.preventDefault();
    if (!pkgName || !pkgPrice || !pkgDuration) return;

    await handleAddPackage({
      id: pkgId || undefined,
      name: pkgName,
      type: pkgType,
      price: parseInt(pkgPrice),
      durationMonths: parseInt(pkgDuration),
      sessions: pkgType === 'pt' ? parseInt(pkgSessions || 10) : null
    });

    // Reset Form
    setPkgId('');
    setPkgName('');
    setPkgType('classic');
    setPkgPrice('');
    setPkgDuration('');
    setPkgSessions('');
    setShowPkgModal(false);
  };

  // Populate Edit package
  const handleEditPackage = (pkg) => {
    setPkgId(pkg.id);
    setPkgName(pkg.name);
    setPkgType(pkg.type);
    setPkgPrice(pkg.price);
    setPkgDuration(pkg.durationMonths);
    setPkgSessions(pkg.sessions || '');
    setShowPkgModal(true);
  };

  // CRUD Staff Handlers (NV-24)
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone) return;

    await handleSaveStaff({
      id: staffId || undefined,
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: staffRole,
      password: staffPassword,
      specialty: staffRole === 'pt' ? staffSpecialty : undefined,
      shift: staffShift
    });

    // Reset Form
    setStaffId('');
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffRole('receptionist');
    setStaffPassword('GMS@1234');
    setStaffSpecialty('');
    setStaffShift('Ca Sáng (06:00 - 14:00)');
    setShowStaffModal(false);
  };

  const handleEditStaffObj = (s) => {
    setStaffId(s.id);
    setStaffName(s.name);
    setStaffEmail(s.email);
    setStaffPhone(s.phone);
    setStaffRole(s.role || (s.id.startsWith("PT") ? 'pt' : 'receptionist'));
    setStaffPassword(s.password || 'GMS@1234');
    setStaffSpecialty(s.specialty || '');
    setStaffShift(s.shift || 'Ca Sáng (06:00 - 14:00)');
    setShowStaffModal(true);
  };

  // CRUD Group Class Handlers (NV-08)
  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!classNameState || !classTrainerId || !classDayOfWeek) return;

    await handleSaveGroupClass({
      id: classId || undefined,
      className: classNameState,
      trainerId: classTrainerId,
      dayOfWeek: classDayOfWeek,
      time: classTime,
      maxCapacity: parseInt(classMaxCapacity)
    });

    // Reset Form
    setClassId('');
    setClassNameState('');
    setClassTrainerId('');
    setClassDayOfWeek('Thứ 2');
    setClassTime('08:00 - 09:30');
    setClassMaxCapacity('15');
    setShowClassModal(false);
  };

  const handleEditClassObj = (c) => {
    setClassId(c.id);
    setClassNameState(c.className);
    setClassTrainerId(c.trainerId);
    setClassDayOfWeek(c.dayOfWeek);
    setClassTime(c.time);
    setClassMaxCapacity(c.maxCapacity.toString());
    setShowClassModal(true);
  };

  // SVG Financial Chart: Revenue distribution by Package (Large Sized)
  const renderRevenueChart = () => {
    // Group completed revenue by package type
    const classicRevenue = completedTx
      .filter(t => t.packageName.toLowerCase().includes('gói tập phổ thông') || t.packageName.toLowerCase().includes('hội viên v.i.p'))
      .reduce((sum, t) => sum + t.amount, 0);
    const ptRevenue = completedTx
      .filter(t => t.packageName.toLowerCase().includes('pt') || t.packageName.toLowerCase().includes('huấn luyện'))
      .reduce((sum, t) => sum + t.amount, 0);
    const dropinRevenue = completedTx
      .filter(t => t.packageName.toLowerCase().includes('drop-in') || t.packageName.toLowerCase().includes('vé tập'))
      .reduce((sum, t) => sum + t.amount, 0);

    const maxVal = Math.max(classicRevenue, ptRevenue, dropinRevenue, 1000000);
    
    // SVG Dimensions (Larger)
    const width = 800;
    const height = 300;
    const paddingLeft = 80;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 45;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const getBarHeight = (val) => (val * chartHeight) / maxVal;

    // Format money into readable numbers (e.g., 2.7M)
    const formatLabel = (val) => `${(val / 1000000).toFixed(1)}M`;

    // Horizontal grid line values
    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#ffffff', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', padding: '10px' }}>
          <defs>
            <linearGradient id="classicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2196F3" />
              <stop offset="100%" stopColor="#1565C0" />
            </linearGradient>
            <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1565C0" />
              <stop offset="100%" stopColor="#0d47a1" />
            </linearGradient>
            <linearGradient id="dropinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {gridLines.map((ratio, index) => {
            const y = height - paddingBottom - ratio * chartHeight;
            const val = ratio * maxVal;
            return (
              <g key={index}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--border-color)" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 15} 
                  y={y + 4} 
                  fill="var(--text-secondary)" 
                  fontSize="10.5" 
                  textAnchor="end"
                  fontWeight="600"
                >
                  {formatLabel(val)}
                </text>
              </g>
            );
          })}

          {/* Classic Bar */}
          {(() => {
            const barW = 100;
            const barH = getBarHeight(classicRevenue);
            const x = paddingLeft + (chartWidth / 4) - (barW / 2);
            const y = height - paddingBottom - barH;
            return (
              <g>
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={barH} 
                  fill="url(#classicGrad)" 
                  rx="6"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x={x + barW/2} y={y - 8} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {classicRevenue.toLocaleString('vi-VN')} đ
                </text>
                <text x={x + barW/2} y={height - paddingBottom + 22} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="700">
                  Gói Phổ Thông
                </text>
              </g>
            );
          })()}

          {/* PT Bar */}
          {(() => {
            const barW = 100;
            const barH = getBarHeight(ptRevenue);
            const x = paddingLeft + (chartWidth / 2) - (barW / 2);
            const y = height - paddingBottom - barH;
            return (
              <g>
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={barH} 
                  fill="url(#ptGrad)" 
                  rx="6"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x={x + barW/2} y={y - 8} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {ptRevenue.toLocaleString('vi-VN')} đ
                </text>
                <text x={x + barW/2} y={height - paddingBottom + 22} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="700">
                  Gói PT
                </text>
              </g>
            );
          })()}

          {/* Dropin Bar */}
          {(() => {
            const barW = 100;
            const barH = getBarHeight(dropinRevenue);
            const x = paddingLeft + (3 * chartWidth / 4) - (barW / 2);
            const y = height - paddingBottom - barH;
            return (
              <g>
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={barH} 
                  fill="url(#dropinGrad)" 
                  rx="6"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x={x + barW/2} y={y - 8} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {dropinRevenue.toLocaleString('vi-VN')} đ
                </text>
                <text x={x + barW/2} y={height - paddingBottom + 22} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="700">
                  Drop-in
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    );
  };

  return (
    <div className="admin-dashboard animate-fade-in" style={styles.container}>
      {/* Tab Nav */}
      <div style={styles.navBar}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Ban Quản Trị Hệ Thống</h2>
        <div style={styles.tabGroup}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : 'none', color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <TrendingUp size={16} /> Báo Cáo Doanh Thu
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'members' ? '3px solid var(--primary)' : 'none', color: activeTab === 'members' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <Users size={16} /> Quản Lý Hội Viên
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'packages' ? '3px solid var(--primary)' : 'none', color: activeTab === 'packages' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <Settings size={16} /> Danh Mục Gói Tập
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'classes' ? '3px solid var(--primary)' : 'none', color: activeTab === 'classes' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <Calendar size={16} /> Lớp Học Nhóm
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'staff' ? '3px solid var(--primary)' : 'none', color: activeTab === 'staff' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <Briefcase size={16} /> Nhân Sự & Ca Trực
          </button>
          <button 
            onClick={() => setActiveTab('reversals')}
            style={{ ...styles.tabBtn, borderBottom: activeTab === 'reversals' ? '3px solid var(--primary)' : 'none', color: activeTab === 'reversals' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <ArrowRightLeft size={16} /> Duyệt Giao Dịch Đảo ({reversals.filter(r => r.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div style={{ marginTop: '24px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Filter controls at the top of the dashboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>📊 Báo Cáo Hoạt Động & Doanh Thu</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Thời gian lọc ảnh hưởng đến Doanh thu, Hội viên mới và lượt Check-in.</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '30px' }}>
                {[
                  { key: 'all', label: 'Tất cả thời gian' },
                  { key: 'month', label: 'Tháng này' },
                  { key: 'day', label: 'Hôm nay' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setTimeRange(item.key)}
                    style={{
                      border: 'none',
                      background: timeRange === item.key ? 'var(--primary)' : 'transparent',
                      color: timeRange === item.key ? '#ffffff' : 'var(--text-secondary)',
                      padding: '8px 18px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: timeRange === item.key ? '0 2px 8px rgba(21, 101, 192, 0.25)' : 'none'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="glass-panel" style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
                  <DollarSign size={24} />
                </div>
                <div style={styles.kpiInfo}>
                  <span style={styles.kpiLabel}>{getRevenueLabel()}</span>
                  <span style={styles.kpiVal}>{totalRevenue.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="glass-panel" style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                  <Users size={24} />
                </div>
                <div style={styles.kpiInfo}>
                  <span style={styles.kpiLabel}>{getMembersLabel()}</span>
                  <span style={styles.kpiVal}>{totalMembersCount}</span>
                </div>
              </div>

              <div className="glass-panel" style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <Shield size={24} />
                </div>
                <div style={styles.kpiInfo}>
                  <span style={styles.kpiLabel}>GÓI ĐANG HOẠT ĐỘNG</span>
                  <span style={styles.kpiVal}>{activeSubs.length}</span>
                </div>
              </div>

              <div className="glass-panel" style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(21, 101, 192, 0.15)', color: 'var(--primary)' }}>
                  <Calendar size={24} />
                </div>
                <div style={styles.kpiInfo}>
                  <span style={styles.kpiLabel}>{getCheckInsLabel()}</span>
                  <span style={styles.kpiVal}>{filteredCheckInsCount} Lượt</span>
                </div>
              </div>

              <div className="glass-panel" style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(10, 22, 40, 0.15)', color: 'var(--accent)' }}>
                  <Briefcase size={24} />
                </div>
                <div style={styles.kpiInfo}>
                  <span style={styles.kpiLabel}>TỔNG SỐ NHÂN SỰ</span>
                  <span style={styles.kpiVal}>{totalStaffCount}</span>
                </div>
              </div>
            </div>

            {/* Large sized financial chart */}
            <div className="glass-panel" style={{ ...styles.card, marginTop: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.cardTitle}><DollarSign size={18} /> Phân Bổ Doanh Thu Cửa Hàng ({timeRange === 'all' ? 'Tất cả' : timeRange === 'month' ? 'Tháng này' : 'Hôm nay'})</h3>
              </div>
              {renderRevenueChart()}
            </div>

            {/* Business transaction history */}
            <div className="glass-panel" style={{ ...styles.card, marginTop: '24px' }}>
              <h3 style={styles.cardTitle}><FileText size={18} /> Lịch Sử Giao Dịch ({filteredTx.length})</h3>
              <div style={{ overflowY: 'auto', maxHeight: '350px', marginTop: '15px' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Hội viên</th>
                      <th style={styles.th}>Sản phẩm</th>
                      <th style={styles.th}>Tổng tiền</th>
                      <th style={styles.th}>Hình thức</th>
                      <th style={styles.th}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.slice().reverse().map(t => (
                      <tr key={t.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{t.id}</strong></td>
                        <td style={styles.td}>{t.memberName}</td>
                        <td style={styles.td}>{t.packageName}</td>
                        <td style={styles.td} style={{ fontWeight: '700' }}>{t.amount.toLocaleString('vi-VN')} đ</td>
                        <td style={styles.td} style={{ textTransform: 'capitalize' }}>{t.paymentMethod}</td>
                        <td style={styles.td}>
                          <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {t.status === 'completed' ? 'Thành công' : 'Đã hủy (Đảo)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredTx.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Không có giao dịch nào trong khoảng thời gian này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PACKAGES CATALOG TAB */}
        {activeTab === 'packages' && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.cardTitle}><Settings size={18} /> Quản Lý Danh Mục Gói Tập</h3>
              <button 
                onClick={() => {
                  setPkgId('');
                  setPkgName('');
                  setPkgType('classic');
                  setPkgPrice('');
                  setPkgDuration('');
                  setPkgSessions('');
                  setShowPkgModal(true);
                }} 
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Thêm Gói Mới
              </button>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Tên gói dịch vụ</th>
                  <th style={styles.th}>Loại hình</th>
                  <th style={styles.th}>Thời hạn</th>
                  <th style={styles.th}>Định lượng (PT)</th>
                  <th style={styles.th}>Đơn giá</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{pkg.name}</strong></td>
                    <td style={styles.td}>
                      <span className={`badge ${pkg.type === 'pt' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {pkg.type === 'pt' ? 'Huấn luyện PT' : 'Thẻ Thường'}
                      </span>
                    </td>
                    <td style={styles.td}>{pkg.durationMonths} Tháng</td>
                    <td style={styles.td}>{pkg.sessions ? `${pkg.sessions} Buổi` : 'Không giới hạn'}</td>
                    <td style={styles.td} style={{ fontWeight: '700', color: 'var(--secondary)' }}>{pkg.price.toLocaleString('vi-VN')} đ</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditPackage(pkg)} style={styles.rowEditBtn} title="Sửa"><Edit2 size={12} /></button>
                        <button onClick={() => handleDeletePackage(pkg.id)} style={styles.rowDelBtn} title="Xóa"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GROUP CLASSES TAB */}
        {activeTab === 'classes' && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.cardTitle}><Calendar size={18} /> Quản Lý Lớp Học Nhóm</h3>
              <button 
                onClick={() => {
                  setClassId('');
                  setClassNameState('');
                  setClassTrainerId(pts[0]?.id || '');
                  setClassDayOfWeek('Thứ 2');
                  setClassTime('08:00 - 09:30');
                  setClassMaxCapacity('15');
                  setShowClassModal(true);
                }} 
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Thêm Lớp Mới
              </button>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Tên lớp học</th>
                  <th style={styles.th}>Huấn luyện viên</th>
                  <th style={styles.th}>Lịch học</th>
                  <th style={styles.th}>Sức chứa (Đã ĐK / Tối đa)</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {groupClasses.map(cls => {
                  const trainer = pts.find(p => p.id === cls.trainerId);
                  return (
                    <tr key={cls.id} style={styles.tableRow}>
                      <td style={styles.td}><strong>{cls.className}</strong></td>
                      <td style={styles.td}>{trainer ? trainer.name : 'Chưa phân công'}</td>
                      <td style={styles.td}>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {cls.dayOfWeek}
                        </span>
                        <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>{cls.time}</span>
                      </td>
                      <td style={styles.td}>
                        <strong>{cls.currentEnrolled}</strong> / {cls.maxCapacity} học viên
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditClassObj(cls)} style={styles.rowEditBtn} title="Sửa"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteGroupClass(cls.id)} style={styles.rowDelBtn} title="Xóa"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* STAFF & SHIFT MATRIX TAB */}
        {activeTab === 'staff' && (
          <div>
            <div className="glass-panel" style={{ ...styles.card, marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.cardTitle}><Briefcase size={18} /> Danh Sách Nhân Viên & HLV</h3>
                <button 
                  onClick={() => {
                    setStaffId('');
                    setStaffName('');
                    setStaffEmail('');
                    setStaffPhone('');
                    setStaffRole('receptionist');
                    setStaffPassword('GMS@1234');
                    setStaffSpecialty('');
                    setStaffShift('Ca Sáng (06:00 - 14:00)');
                    setShowStaffModal(true);
                  }} 
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Nhân Sự
                </button>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Mã NV</th>
                    <th style={styles.th}>Họ và tên</th>
                    <th style={styles.th}>Chức vụ</th>
                    <th style={styles.th}>Liên hệ (Email / SĐT)</th>
                    <th style={styles.th}>Ca trực mặc định</th>
                    <th style={styles.th}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {[...staff, ...pts].map(s => {
                    const isPt = s.id.startsWith('PT');
                    return (
                      <tr key={s.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{s.id}</strong></td>
                        <td style={styles.td}>
                          <div><strong>{s.name}</strong></div>
                          {isPt && s.specialty && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              Chuyên môn: {s.specialty}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${
                            s.role === 'admin' ? 'badge-danger' : 
                            s.role === 'pt' ? 'badge-primary' : 'badge-info'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {s.role === 'admin' ? 'Admin / QL' : 
                             s.role === 'pt' ? 'Huấn Luyện Viên PT' : 'Lễ Tân'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div>{s.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.phone}</div>
                        </td>
                        <td style={styles.td}>
                          <select
                            value={s.shift || 'Ca Sáng (06:00 - 14:00)'}
                            onChange={(e) => handleUpdateStaffShift(s.id, e.target.value)}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: 'var(--border-radius-sm)', 
                              border: '1px solid var(--border-color)', 
                              fontSize: '0.75rem', 
                              background: '#ffffff', 
                              color: 'var(--text-primary)',
                              fontWeight: '600'
                            }}
                          >
                            <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                            <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                            <option value="Toàn Thời Gian">Toàn Thời Gian</option>
                            <option value="Nghỉ">Nghỉ</option>
                          </select>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditStaffObj(s)} style={styles.rowEditBtn} title="Sửa"><Edit2 size={12} /></button>
                            <button 
                              onClick={() => {
                                if (s.id === 'AD-001') {
                                  alert('Không thể xóa tài khoản quản trị hệ thống mặc định!');
                                } else {
                                  handleDeleteStaff(s.id);
                                }
                              }} 
                              style={styles.rowDelBtn} 
                              title="Xóa"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Shift Matrix Block */}
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}><Clock size={18} /> Ma Trận Phân Ca Trực Hàng Tuần</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
                Lịch trực chung cho các ngày trong tuần (Thứ 2 - Chủ Nhật) dựa trên cài đặt ca trực mặc định của nhân sự.
              </p>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, width: '25%' }}>Ca Làm Việc</th>
                    <th style={styles.th}>Danh Sách Nhân Sự Phân Bổ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>Ca Sáng (06:00 - 14:00)</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[...staff, ...pts].filter(s => s.shift === 'Ca Sáng (06:00 - 14:00)').map(s => (
                          <span key={s.id} className="badge badge-info" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            {s.name} ({s.id})
                          </span>
                        ))}
                        {[...staff, ...pts].filter(s => s.shift === 'Ca Sáng (06:00 - 14:00)').length === 0 && (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Không có nhân sự ca sáng</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>Ca Chiều (14:00 - 22:00)</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[...staff, ...pts].filter(s => s.shift === 'Ca Chiều (14:00 - 22:00)').map(s => (
                          <span key={s.id} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ffffff' }}>
                            {s.name} ({s.id})
                          </span>
                        ))}
                        {[...staff, ...pts].filter(s => s.shift === 'Ca Chiều (14:00 - 22:00)').length === 0 && (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Không có nhân sự ca chiều</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>Toàn Thời Gian / Khác</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[...staff, ...pts].filter(s => s.shift === 'Toàn Thời Gian' || !s.shift).map(s => (
                          <span key={s.id} className="badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            {s.name} ({s.id})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>Nghỉ Ca / Off</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[...staff, ...pts].filter(s => s.shift === 'Nghỉ').map(s => (
                          <span key={s.id} className="badge badge-danger" style={{ padding: '6px 12px', fontSize: '0.75rem', opacity: 0.7 }}>
                            {s.name} ({s.id})
                          </span>
                        ))}
                        {[...staff, ...pts].filter(s => s.shift === 'Nghỉ').length === 0 && (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Không có nhân sự nghỉ ca</span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPROVE REVERSALS TAB */}
        {activeTab === 'reversals' && (
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}><ArrowRightLeft size={18} color="var(--danger)" /> Duyệt Yêu Cầu Hủy Hóa Đơn</h3>
            
            <div style={{ marginTop: '15px' }}>
              {reversals.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px', textAlign: 'center' }}>Không có yêu cầu đảo giao dịch nào.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Thời gian gửi</th>
                      <th style={styles.th}>Mã hóa đơn</th>
                      <th style={styles.th}>Hội viên</th>
                      <th style={styles.th}>Sản phẩm</th>
                      <th style={styles.th}>Số tiền</th>
                      <th style={styles.th}>Lý do hủy</th>
                      <th style={styles.th}>Trạng thái</th>
                      <th style={styles.th}>Xét duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reversals.slice().reverse().map(rev => (
                      <tr key={rev.id} style={styles.tableRow}>
                        <td style={styles.td}>{new Date(rev.timestamp).toLocaleString('vi-VN')}</td>
                        <td style={styles.td}><strong>{rev.transactionId}</strong></td>
                        <td style={styles.td}>{rev.memberName}</td>
                        <td style={styles.td}>{rev.packageName}</td>
                        <td style={styles.td} style={{ fontWeight: '700' }}>{rev.amount.toLocaleString('vi-VN')} đ</td>
                        <td style={styles.td} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>{rev.reason}</td>
                        <td style={styles.td}>
                          <span className={`badge ${
                            rev.status === 'approved' ? 'badge-success' :
                            rev.status === 'pending' ? 'badge-warning' : 'badge-danger'
                          }`} style={{ fontSize: '0.65rem' }}>
                            {rev.status === 'approved' ? 'Đã duyệt hủy' :
                             rev.status === 'pending' ? 'Đang chờ' : 'Đã bác bỏ'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {rev.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => handleApproveReversal(rev.id, 'approved')}
                                style={{ ...styles.actionBtn, backgroundColor: 'var(--success-glow)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              >
                                <Check size={12} /> Duyệt
                              </button>
                              <button 
                                onClick={() => handleApproveReversal(rev.id, 'rejected')}
                                style={{ ...styles.actionBtn, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              >
                                <X size={12} /> Bác bỏ
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT PACKAGE MODAL */}
      {showPkgModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="var(--primary)" /> {pkgId ? 'Cập Nhật Gói Tập' : 'Tạo Gói Tập Mới'}
            </h3>

            <form onSubmit={handlePkgSubmit}>
              <div className="form-group">
                <label className="form-label">Tên gói dịch vụ *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="vd: Gói VIP Đẳng Cấp 12 Tháng"
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loại gói dịch vụ *</label>
                <select 
                  className="form-input" 
                  required
                  value={pkgType}
                  onChange={e => setPkgType(e.target.value)}
                  style={{ background: '#ffffff', colorScheme: 'light' }}
                >
                  <option value="classic">Thẻ tập thường (Classic/VIP)</option>
                  <option value="pt">Gói tập riêng với PT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Đơn giá (VNĐ) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="vd: 1200000"
                  value={pkgPrice}
                  onChange={e => setPkgPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thời hạn (Tháng) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="vd: 3"
                  value={pkgDuration}
                  onChange={e => setPkgDuration(e.target.value)}
                />
              </div>

              {pkgType === 'pt' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Số buổi huấn luyện PT *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="vd: 10"
                    value={pkgSessions}
                    onChange={e => setPkgSessions(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPkgModal(false)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px' }}
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px' }}
                >
                  {pkgId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT GROUP CLASS MODAL */}
      {showClassModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" /> {classId ? 'Cập Nhật Lớp Học Nhóm' : 'Tạo Lớp Học Nhóm Mới'}
            </h3>

            <form onSubmit={handleClassSubmit}>
              <div className="form-group">
                <label className="form-label">Tên lớp học *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="vd: Lớp Yoga Cơ Bản"
                  value={classNameState}
                  onChange={e => setClassNameState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Huấn luyện viên phụ trách *</label>
                <select 
                  className="form-input" 
                  required
                  value={classTrainerId}
                  onChange={e => setClassTrainerId(e.target.value)}
                  style={{ background: '#ffffff', colorScheme: 'light' }}
                >
                  <option value="">-- Chọn HLV --</option>
                  {pts.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.name} ({pt.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thứ trong tuần *</label>
                <select 
                  className="form-input" 
                  required
                  value={classDayOfWeek}
                  onChange={e => setClassDayOfWeek(e.target.value)}
                  style={{ background: '#ffffff', colorScheme: 'light' }}
                >
                  <option value="Thứ 2">Thứ 2</option>
                  <option value="Thứ 3">Thứ 3</option>
                  <option value="Thứ 4">Thứ 4</option>
                  <option value="Thứ 5">Thứ 5</option>
                  <option value="Thứ 6">Thứ 6</option>
                  <option value="Thứ 7">Thứ 7</option>
                  <option value="Chủ Nhật">Chủ Nhật</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thời gian học *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="vd: 08:00 - 09:30"
                  value={classTime}
                  onChange={e => setClassTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sức chứa tối đa (Học viên) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="vd: 15"
                  value={classMaxCapacity}
                  onChange={e => setClassMaxCapacity(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowClassModal(false)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px' }}
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px' }}
                >
                  {classId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT STAFF MODAL */}
      {showStaffModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--primary)" /> {staffId ? 'Cập Nhật Tài Khoản Nhân Sự' : 'Tạo Nhân Sự Mới'}
            </h3>

            <form onSubmit={handleStaffSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="vd: HLV Phạm Tuấn"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email đăng nhập *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required
                  placeholder="vd: tuan.pt@gym.com"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="vd: 0988xxxxxx"
                  value={staffPhone}
                  onChange={e => setStaffPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chức vụ *</label>
                <select 
                  className="form-input" 
                  required
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value)}
                  style={{ background: '#ffffff', colorScheme: 'light' }}
                >
                  <option value="receptionist">Lễ Tân (Receptionist)</option>
                  <option value="pt">Huấn Luyện Viên (PT)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu đăng nhập *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={staffPassword}
                  onChange={e => setStaffPassword(e.target.value)}
                />
              </div>

              {staffRole === 'pt' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Chuyên môn / Chứng chỉ *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required={staffRole === 'pt'}
                    placeholder="vd: Yoga cổ điển, Pilates, Giảm béo"
                    value={staffSpecialty}
                    onChange={e => setStaffSpecialty(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Ca trực mặc định *</label>
                <select 
                  className="form-input" 
                  required
                  value={staffShift}
                  onChange={e => setStaffShift(e.target.value)}
                  style={{ background: '#ffffff', colorScheme: 'light' }}
                >
                  <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                  <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                  <option value="Toàn Thời Gian">Toàn Thời Gian</option>
                  <option value="Nghỉ">Nghỉ</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowStaffModal(false)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px' }}
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px' }}
                >
                  {staffId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBERS MANAGEMENT TAB */}
      {activeTab === 'members' && (
        <div className="glass-panel" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={styles.cardTitle}><Users size={18} color="var(--primary)" /> Danh Sách Hội Viên ({filteredMembers.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="form-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '160px', padding: '8px 12px', fontSize: '0.85rem', height: 'auto' }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="expiring_soon">Sắp hết hạn (&lt;14 ngày)</option>
                <option value="expired">Đã hết hạn</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm tên, SĐT, Mã HV, CCCD..."
                value={memberSearchQuery}
                onChange={e => setMemberSearchQuery(e.target.value)}
                style={{ width: '250px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Mã HV</th>
                  <th style={styles.th}>Tên Hội Viên</th>
                  <th style={styles.th}>Số Điện Thoại</th>
                  <th style={styles.th}>Trạng Thái</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{m.id}</strong></td>
                    <td style={styles.td}>{m.name}</td>
                    <td style={styles.td}>{m.phone}</td>
                    <td style={styles.td}>{renderStatusBadge(m)}</td>
                    <td style={styles.td}>
                      <button onClick={() => setSelectedMemberProfile(m)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Chi tiết</button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy hội viên</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEMBER PROFILE MODAL */}
      {selectedMemberProfile && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={{ ...styles.modalContent, maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} color="var(--primary)" /> Hồ Sơ Hội Viên</h3>
              <button onClick={() => setSelectedMemberProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            <div className="grid-2">
              <div>
                <p style={{ marginBottom: '8px' }}><strong>Họ Tên:</strong> {selectedMemberProfile.name}</p>
                <p style={{ marginBottom: '8px' }}><strong>Mã HV:</strong> {selectedMemberProfile.id}</p>
                <p style={{ marginBottom: '8px' }}><strong>SĐT:</strong> {selectedMemberProfile.phone}</p>
                <p style={{ marginBottom: '8px' }}><strong>Số CCCD:</strong> {selectedMemberProfile.cccd || 'N/A'}</p>
                <p style={{ marginBottom: '8px' }}><strong>Ngày tham gia:</strong> {selectedMemberProfile.joinDate}</p>
                <p style={{ marginBottom: '8px' }}><strong>Trạng thái:</strong> {renderStatusBadge(selectedMemberProfile)}</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '10px', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>Gói tập đang có</h4>
                {memberPackages.filter(p => p.memberId === selectedMemberProfile.id).length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chưa có gói tập nào.</p> : null}
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
                  {memberPackages.filter(p => p.memberId === selectedMemberProfile.id).map(mp => {
                    const pkg = packages.find(p => p.id === mp.packageId);
                    return <li key={mp.id} style={{ marginBottom: '5px' }}>{pkg ? pkg.name : mp.packageId} ({mp.status}) <br /><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HSD: {mp.endDate}</span></li>
                  })}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedMemberProfile(null)} className="btn btn-outline">Đóng</button>
            </div>
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
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '15px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  tabGroup: {
    display: 'flex',
    gap: '10px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: '0.2s',
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
  kpiCard: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  kpiIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)'
  },
  kpiInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  kpiLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  kpiVal: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginTop: '4px'
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
    fontSize: '0.75rem',
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
    fontSize: '0.8rem'
  },
  rowEditBtn: {
    background: 'var(--secondary-glow)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    color: 'var(--secondary)',
    borderRadius: '4px',
    padding: '4px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  rowDelBtn: {
    background: 'var(--danger-glow)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    borderRadius: '4px',
    padding: '4px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  actionBtn: {
    border: '1px solid',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '100%',
    maxWidth: '450px',
    padding: '30px'
  }
};
