import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scan, Search, UserPlus, CreditCard, Inbox, ShieldAlert,
  CheckCircle, AlertCircle, Printer, X, FileText, ArrowRightLeft,
  Users, User, Dumbbell
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const {
    members,
    packages,
    transactions,
    leads,
    reversals,
    checkIns,
    memberPackages,
    pts,
    groupClasses,
    groupClassBookings,
    handleAddMember,
    handleSubscribePackage,
    handleCheckIn,
    handleCheckInDropIn,
    handleCreateReversal,
    handleBookGroupClass,
    handleCancelGroupClassBooking,
    handleCheckInGroupClassBooking
  } = useApp();

  const [activeTab, setActiveTab] = useState('checkin');

  // Gate Check-in states
  const [qrInput, setQrInput] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMembersList, setShowAllMembersList] = useState(false);
  const [showCccdModal, setShowCccdModal] = useState(false);

  // Member Management States
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);

  // Onboarding states
  const [onboardName, setOnboardName] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardCccd, setOnboardCccd] = useState('');
  const [onboardSuccess, setOnboardSuccess] = useState(null);
  const [onboardError, setOnboardError] = useState('');

  // POS Sales states
  const [posMemberSearchQuery, setPosMemberSearchQuery] = useState('');
  const [showPosMemberSuggestions, setShowPosMemberSuggestions] = useState(false);
  const [posMemberId, setPosMemberId] = useState('');
  const [posPackageSearchQuery, setPosPackageSearchQuery] = useState('');
  const [showPosPackageSuggestions, setShowPosPackageSuggestions] = useState(false);
  const [posPackageId, setPosPackageId] = useState('');
  const [posPtId, setPosPtId] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('banking');
  const [salesResult, setSalesResult] = useState(null);
  const [salesPreview, setSalesPreview] = useState(null);
  const [receptionistPackageSearch, setReceptionistPackageSearch] = useState('');

  // Drop-in visitor states
  const [dropInName, setDropInName] = useState('');
  const [dropInPhone, setDropInPhone] = useState('');
  const [dropInPaymentMethod, setDropInPaymentMethod] = useState('cash');
  const [dropInResult, setDropInResult] = useState(null);

  // Reversal Request states
  const [reversalTxId, setReversalTxId] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const [reversalResult, setReversalResult] = useState(null);
  const [showReversalModal, setShowReversalModal] = useState(false);

  // Group Classes tab states
  const [classCheckinMemberSearchQuery, setClassCheckinMemberSearchQuery] = useState('');
  const [showClassMemberSuggestions, setShowClassMemberSuggestions] = useState(false);
  const [selectedClassForCheckin, setSelectedClassForCheckin] = useState(null);
  const [classCheckinSuccess, setClassCheckinSuccess] = useState('');
  const [classCheckinError, setClassCheckinError] = useState('');

  // Today checkins
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = checkIns.filter(ci => ci.timestamp.startsWith(todayStr));

  // Derived state: dynamic list of members for manual check-in (supports scrolling & live search suggestions)
  const displayedCheckInMembers = searchQuery
    ? members.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : members;

  // Helper search member (prevent form submission reload)
  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleQrCheckIn = async (e) => {
    e.preventDefault();
    if (!qrInput) return;
    let member = members.find(m => m.qrCode === qrInput || m.id === qrInput);
    if (!member) {
      setCheckInResult({
        success: false,
        message: 'Mã QR không hợp lệ hoặc hội viên không tồn tại trong hệ thống!'
      });
      return;
    }
    const res = await handleCheckIn(member.id, 'auto');
    setCheckInResult(res);
    setQrInput('');
  };

  const handleManualCheckIn = async (memberId) => {
    const res = await handleCheckIn(memberId, 'manual');
    setCheckInResult(res);
    setSearchQuery('');
  };

  const handleParseCccdQr = (qrString) => {
    if (!qrString) return false;
    const parts = qrString.split('|');
    if (parts.length >= 3) {
      const cccdNum = parts[0];
      const fullName = parts[2];
      setOnboardName(fullName);
      setOnboardCccd(cccdNum);
      const normalizedName = fullName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "");
      setOnboardEmail(`${normalizedName}@gmail.com`);
      setOnboardPhone('09' + Math.floor(10000000 + Math.random() * 80000000));
      return true;
    }
    return false;
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardName || !onboardPhone || !onboardCccd) return;

    setOnboardError('');

    // Validate uniqueness of Phone and CCCD
    const phoneExists = members.some(m => m.phone === onboardPhone);
    const cccdExists = members.some(m => m.cccd === onboardCccd);

    if (phoneExists) {
      setOnboardError("Số điện thoại này đã được sử dụng cho một hội viên khác!");
      return;
    }

    if (cccdExists) {
      setOnboardError("Số CCCD này đã tồn tại trên hệ thống!");
      return;
    }

    const newMember = await handleAddMember({
      name: onboardName,
      phone: onboardPhone,
      email: onboardEmail,
      cccd: onboardCccd
    });
    setOnboardSuccess(newMember);
    setOnboardName('');
    setOnboardPhone('');
    setOnboardEmail('');
    setOnboardCccd('');
    setOnboardError('');
  };

  const handleDropInSubmit = async (e) => {
    e.preventDefault();
    if (!dropInName || !dropInPhone) return;
    const res = await handleCheckInDropIn(dropInName, dropInPhone, 100000, dropInPaymentMethod);
    setDropInResult(res);
    setDropInName('');
    setDropInPhone('');
  };

  const handleSalesSubmit = (e) => {
    e.preventDefault();
    if (!posMemberId || !posPackageId) return;
    const selectedPkg = packages.find(p => p.id === posPackageId);
    if (selectedPkg?.type === 'pt' && !posPtId) {
      alert("Vui lòng chọn Huấn luyện viên (PT) cho gói này!");
      return;
    }

    const member = members.find(m => m.id === posMemberId);
    if (!member) return;

    // Calculate dates matching the backend DB logic
    let startDate = new Date();
    const activeSubs = memberPackages.filter(sp => sp.memberId === posMemberId && sp.status === "active");
    const sameTypeSub = activeSubs.find(sub => {
      const subPkg = packages.find(p => p.id === sub.packageId);
      return subPkg && subPkg.type === selectedPkg.type;
    });

    if (sameTypeSub) {
      const existingEnd = new Date(sameTypeSub.endDate);
      const today = new Date();
      if (existingEnd >= today) {
        startDate = new Date(existingEnd.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + (selectedPkg.durationMonths || 1));

    const preview = {
      memberId: posMemberId,
      memberName: member.name,
      packageId: posPackageId,
      packageName: selectedPkg.name,
      ptName: selectedPkg.type === 'pt' ? pts.find(pt => pt.id === posPtId)?.name : null,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      amount: selectedPkg.price,
      paymentMethod: posPaymentMethod,
      timestamp: new Date().toISOString()
    };

    setSalesPreview(preview);
  };

  const handleConfirmSales = async () => {
    if (!salesPreview) return;
    const res = await handleSubscribePackage(salesPreview.memberId, salesPreview.packageId, salesPreview.paymentMethod);
    if (res) {
      setSalesResult(res);
      setPosMemberId('');
      setPosPackageId('');
      setPosPtId('');
      setPosPackageSearchQuery('');
      setPosMemberSearchQuery('');
      setShowPosMemberSuggestions(false);
    }
    setSalesPreview(null);
  };

  const handleDeclineSales = () => {
    setSalesPreview(null);
  };

  const handleReversalSubmit = async (e) => {
    e.preventDefault();
    if (!reversalTxId || !reversalReason) return;
    const res = await handleCreateReversal(reversalTxId, reversalReason);
    setReversalResult(res);
    setReversalTxId('');
    setReversalReason('');
    setTimeout(() => {
      setReversalResult(null);
      setShowReversalModal(false);
    }, 4000);
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

  // Filter packages for POS
  const filteredPackages = posPackageSearchQuery
    ? packages.filter(p => p.name.toLowerCase().includes(posPackageSearchQuery.toLowerCase()))
    : packages;
  const isPtPackageSelected = packages.find(p => p.id === posPackageId)?.type === 'pt';

  return (
    <div className="receptionist-dashboard animate-fade-in" style={styles.container}>
      <div className="dashboard-layout">
        {/* Left Navigation Sidebar */}
        <div className="glass-panel" style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Lễ Tân Vận Hành</h2>
          <button onClick={() => { setActiveTab('checkin'); setCheckInResult(null); }} style={getTabStyle(activeTab === 'checkin')}>
            <Scan size={18} /> Kiểm Soát Ra Vào
          </button>
          <button onClick={() => { setActiveTab('members'); }} style={getTabStyle(activeTab === 'members')}>
            <Users size={18} /> Quản Lý Hội Viên
          </button>
          <button onClick={() => { setActiveTab('onboard'); setOnboardSuccess(null); setOnboardError(''); }} style={getTabStyle(activeTab === 'onboard')}>
            <UserPlus size={18} /> Đăng Ký Mới
          </button>
          <button onClick={() => { setActiveTab('pos'); setSalesResult(null); }} style={getTabStyle(activeTab === 'pos')}>
            <CreditCard size={18} /> Bán Gói & POS
          </button>
          <button onClick={() => { setActiveTab('packages'); }} style={getTabStyle(activeTab === 'packages')}>
            <Dumbbell size={18} /> Danh Sách Gói Tập
          </button>
          <button onClick={() => { setActiveTab('classes'); }} style={getTabStyle(activeTab === 'classes')}>
            <Users size={18} /> Quản Lý Lớp Nhóm
          </button>
          <button onClick={() => setActiveTab('leads')} style={getTabStyle(activeTab === 'leads')}>
            <Inbox size={18} /> Leads ({leads.length})
          </button>
        </div>

        {/* Right Content Area */}
        <div style={styles.contentArea}>

          {/* CHECK-IN TAB */}
          {activeTab === 'checkin' && (
            <div className="grid-2">
              <div>
                <div className="glass-panel" style={styles.card}>
                  <h3 style={styles.cardTitle}><Scan size={18} color="var(--primary)" /> Quét Thẻ / Mã QR Cổng Tự Động</h3>
                  <form onSubmit={handleQrCheckIn} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input type="text" className="form-input" placeholder="Quét mã QR (vd: QR_MB_001)..." value={qrInput} onChange={e => setQrInput(e.target.value)} style={{ flexGrow: 1 }} />
                    <button type="submit" className="btn btn-primary">Quét QR</button>
                  </form>
                </div>

                <div className="glass-panel" style={{ ...styles.card, marginTop: '20px' }}>
                  <h3 style={styles.cardTitle}><Search size={18} color="var(--secondary)" /> Check-in Thủ Công</h3>
                  <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input type="text" className="form-input" placeholder="Tìm tên, SĐT, mã hội viên..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flexGrow: 1 }} />
                  </form>

                  {/* Search suggestion view: visible when search query is typed */}
                  {searchQuery !== '' && (
                    <div style={{ marginTop: '15px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        Kết quả gợi ý ({displayedCheckInMembers.length}):
                      </span>
                      <div style={{ ...styles.searchList, maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', background: 'rgba(255,255,255,0.01)', gap: '8px', marginTop: '5px' }}>
                        {displayedCheckInMembers.map(m => (
                          <div key={m.id} style={{ ...styles.searchItem, padding: '8px 12px', margin: 0 }}>
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{m.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {m.id} | SĐT: {m.phone}</div>
                            </div>
                            <button onClick={() => handleManualCheckIn(m.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Check-in</button>
                          </div>
                        ))}
                        {displayedCheckInMembers.length === 0 && (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Không tìm thấy hội viên nào khớp với từ khóa
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional full member list toggle: visible when search query is empty */}
                  {searchQuery === '' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowAllMembersList(!showAllMembersList)}
                        className="btn btn-outline"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', padding: '8px 12px', fontSize: '0.85rem' }}
                      >
                        <Users size={16} />
                        {showAllMembersList ? 'Ẩn danh sách hội viên' : 'Xem danh sách hội viên'}
                      </button>

                      {showAllMembersList && (
                        <div style={{ marginTop: '15px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            Danh sách cuộn hội viên ({members.length}):
                          </span>
                          <div style={{ ...styles.searchList, maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', background: 'rgba(255,255,255,0.01)', gap: '8px', marginTop: '5px' }}>
                            {members.map(m => (
                              <div key={m.id} style={{ ...styles.searchItem, padding: '8px 12px', margin: 0 }}>
                                <div>
                                  <strong style={{ fontSize: '0.9rem' }}>{m.name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {m.id} | SĐT: {m.phone}</div>
                                </div>
                                <button onClick={() => { handleManualCheckIn(m.id); setShowAllMembersList(false); }} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Check-in</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="glass-panel" style={{ ...styles.card, marginTop: '20px' }}>
                  <h3 style={styles.cardTitle}><CreditCard size={18} color="var(--accent)" /> Thu Phí Khách Vãng Lai (Drop-in)</h3>
                  <form onSubmit={handleDropInSubmit} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" className="form-input" placeholder="Tên khách hàng *" required value={dropInName} onChange={e => setDropInName(e.target.value)} style={{ width: '50%' }} />
                      <input type="tel" className="form-input" placeholder="Số điện thoại *" required value={dropInPhone} onChange={e => setDropInPhone(e.target.value)} style={{ width: '50%' }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      marginTop: '4px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Phí tập vãng lai:</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent)', whiteSpace: 'nowrap' }}>100.000 ₫</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '130px' }}>
                        <select className="form-input" value={dropInPaymentMethod} onChange={e => setDropInPaymentMethod(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem', height: 'auto' }}>
                          <option value="cash">Tiền mặt</option>
                          <option value="banking">Chuyển khoản</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      Thu Phí & Cho Vào Cổng
                    </button>
                  </form>
                </div>
              </div>

              <div>
                {checkInResult && (
                  <div className="glass-panel" style={{ ...styles.checkInFeedback, borderLeft: checkInResult.success ? '8px solid var(--success)' : '8px solid var(--danger)', animation: 'fadeIn 0.3s forwards' }}>
                    {checkInResult.success ? (
                      <>
                        <CheckCircle size={44} color="var(--success)" />
                        <div style={styles.feedbackText}>
                          <h4 style={{ color: 'var(--success)', fontSize: '1.2rem', fontWeight: '800' }}>CHECK-IN THÀNH CÔNG!</h4>
                          <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '6px' }}>Hội viên: {checkInResult.member.name}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mã số: {checkInResult.member.id}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={44} color="var(--danger)" />
                        <div style={styles.feedbackText}>
                          <h4 style={{ color: 'var(--danger)', fontSize: '1.2rem', fontWeight: '800' }}>CHECK-IN THẤT BẠI!</h4>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '6px' }}>{checkInResult.message}</p>
                        </div>
                      </>
                    )}
                    <button onClick={() => setCheckInResult(null)} style={styles.closeAlertBtn}><X size={16} /></button>
                  </div>
                )}

                {/* Today's check-in history */}
                <div className="glass-panel" style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={styles.cardTitle}>Lịch Sử Check-in Hôm Nay</h3>
                    <span className="badge badge-info" style={{ fontSize: '0.9rem' }}>Tổng: {todayCheckins.length} Lượt</span>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Thời Gian</th>
                          <th style={styles.th}>Hội Viên</th>
                          <th style={styles.th}>Hình thức</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayCheckins.map(ci => {
                          const m = members.find(mbr => mbr.id === ci.memberId);
                          return (
                            <tr key={ci.id} style={styles.tableRow}>
                              <td style={styles.td}><strong>{new Date(ci.timestamp).toLocaleTimeString('vi-VN')}</strong></td>
                              <td style={styles.td}>{ci.memberId === 'DROP-IN' ? ci.guestDetails.name + ' (Vãng lai)' : m ? m.name : 'Unknown'}</td>
                              <td style={styles.td}>{ci.type === 'auto' ? 'Mã QR' : ci.type === 'manual' ? 'Thủ công' : 'Vãng lai'}</td>
                            </tr>
                          );
                        })}
                        {todayCheckins.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có lượt check-in nào trong ngày</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
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

          {/* ONBOARD NEW MEMBER TAB */}
          {activeTab === 'onboard' && (
            <div className="grid-2">
              <div className="glass-panel" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 style={styles.cardTitle}><UserPlus size={18} color="var(--primary)" /> Đăng Ký Hội Viên Mới</h3>
                  <button
                    type="button"
                    onClick={() => setShowCccdModal(true)}
                    className="btn btn-outline animate-fade-in"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Scan size={14} /> Quét CCCD
                  </button>
                </div>
                {onboardError && (
                  <div style={{ ...styles.errorAlert, marginBottom: '15px' }}>
                    <AlertCircle size={16} /> <span>{onboardError}</span>
                  </div>
                )}
                <form onSubmit={handleOnboardSubmit}>
                  <div className="form-group"><label className="form-label">Họ và tên *</label><input type="text" className="form-input" required value={onboardName} onChange={e => setOnboardName(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Số điện thoại *</label><input type="tel" className="form-input" required value={onboardPhone} onChange={e => setOnboardPhone(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={onboardEmail} onChange={e => setOnboardEmail(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Số CCCD *</label><input type="text" className="form-input" required value={onboardCccd} onChange={e => setOnboardCccd(e.target.value)} /></div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Lưu & Tạo Tài Khoản Hội Viên</button>
                </form>
              </div>

              <div>
                {onboardSuccess && (
                  <div className="glass-panel animate-fade-in" style={{ ...styles.card, border: '1px solid var(--success)' }}>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <CheckCircle size={44} color="var(--success)" style={{ marginBottom: '10px' }} />
                      <h3 style={{ color: 'var(--success)' }}>ĐÃ ĐĂNG KÝ THÀNH CÔNG!</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Tài khoản hội viên đã được khởi tạo</p>
                    </div>
                    <hr style={styles.receiptHr} />
                    <div style={styles.statMiniCard}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left', fontSize: '0.9rem' }}>
                        <div><strong>Tên hội viên:</strong> {onboardSuccess.name}</div>
                        <div><strong>Mã Hội Viên:</strong> <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{onboardSuccess.id}</span></div>
                        <div><strong>Mã QR check-in:</strong> <code style={{ color: 'var(--primary)' }}>{onboardSuccess.qrCode}</code></div>
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--bg-dark)', borderRadius: '6px' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Tài khoản đăng nhập Member Portal:</p>
                          <p>Username: <strong>{onboardSuccess.phone}</strong></p>
                          <p>Password mặc định: <strong>GMS@1234</strong></p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setOnboardSuccess(null)} className="btn btn-outline" style={{ marginTop: '15px' }}>Đăng ký hội viên tiếp theo</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* POS SALES TAB */}
          {activeTab === 'pos' && (
            <div className="grid-2">
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}><CreditCard size={18} color="var(--primary)" /> Đăng ký & Bán gói tập mới</h3>
                <form onSubmit={handleSalesSubmit} style={{ marginTop: '15px' }}>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Tìm & Chọn Hội Viên nhận gói *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Gõ tìm tên, SĐT hoặc mã HV..."
                      value={posMemberSearchQuery}
                      onChange={e => {
                        setPosMemberSearchQuery(e.target.value);
                        setShowPosMemberSuggestions(true);
                        // Reset posMemberId if query is empty
                        if (!e.target.value) setPosMemberId('');
                      }}
                      onFocus={() => setShowPosMemberSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPosMemberSuggestions(false), 200)}
                    />
                    {showPosMemberSuggestions && posMemberSearchQuery && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '4px',
                        maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        {members.filter(m =>
                          m.name.toLowerCase().includes(posMemberSearchQuery.toLowerCase()) ||
                          m.phone.includes(posMemberSearchQuery) ||
                          m.id.toLowerCase().includes(posMemberSearchQuery.toLowerCase())
                        ).map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setPosMemberId(m.id);
                              setPosMemberSearchQuery(`${m.name} (${m.id})`);
                              setShowPosMemberSuggestions(false);
                            }}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                            onMouseDown={() => {
                              // Using onMouseDown to fire before onBlur
                              setPosMemberId(m.id);
                              setPosMemberSearchQuery(`${m.name} (${m.id})`);
                              setShowPosMemberSuggestions(false);
                            }}
                          >
                            <strong>{m.name}</strong> - ID: {m.id} - SĐT: {m.phone}
                          </div>
                        ))}
                        {members.filter(m =>
                          m.name.toLowerCase().includes(posMemberSearchQuery.toLowerCase()) ||
                          m.phone.includes(posMemberSearchQuery) ||
                          m.id.toLowerCase().includes(posMemberSearchQuery.toLowerCase())
                        ).length === 0 && (
                            <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không tìm thấy hội viên</div>
                          )}
                      </div>
                    )}
                    {posMemberId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: 'bold' }}>
                        Đang chọn Hội viên: {members.find(m => m.id === posMemberId)?.name} (ID: {posMemberId})
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Tìm / Chọn gói dịch vụ *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên gói tập để tìm nhanh..."
                      value={posPackageSearchQuery}
                      onChange={e => {
                        setPosPackageSearchQuery(e.target.value);
                        setShowPosPackageSuggestions(true);
                        // Reset package selection if query is empty
                        if (!e.target.value) setPosPackageId('');
                      }}
                      onFocus={() => setShowPosPackageSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPosPackageSuggestions(false), 200)}
                    />
                    {showPosPackageSuggestions && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '4px',
                        maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        {packages.filter(p =>
                          p.name.toLowerCase().includes(posPackageSearchQuery.toLowerCase())
                        ).map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setPosPackageId(p.id);
                              setPosPackageSearchQuery(p.name);
                              setShowPosPackageSuggestions(false);
                            }}
                            style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                            onMouseDown={() => {
                              setPosPackageId(p.id);
                              setPosPackageSearchQuery(p.name);
                              setShowPosPackageSuggestions(false);
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong>{p.name}</strong>
                              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{p.price.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                              Phân loại: {p.type === 'pt' ? 'Gói PT' : p.type === 'classic' ? 'Classic' : p.type === 'class' ? 'Lớp Nhóm' : 'Bể Bơi'} | Hạn dùng: {p.durationMonths} Tháng
                            </div>
                          </div>
                        ))}
                        {packages.filter(p =>
                          p.name.toLowerCase().includes(posPackageSearchQuery.toLowerCase())
                        ).length === 0 && (
                            <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không tìm thấy gói tập</div>
                          )}
                      </div>
                    )}
                    {posPackageId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: 'bold' }}>
                        Đang chọn Gói tập: {packages.find(p => p.id === posPackageId)?.name} ({packages.find(p => p.id === posPackageId)?.price.toLocaleString('vi-VN')} đ)
                      </div>
                    )}
                  </div>

                  {isPtPackageSelected && (
                    <div className="form-group">
                      <label className="form-label">Chọn Huấn Luyện Viên (PT) phụ trách *</label>
                      <select className="form-input" required value={posPtId} onChange={e => setPosPtId(e.target.value)}>
                        <option value="">-- Chọn PT --</option>
                        {pts.map(pt => (<option key={pt.id} value={pt.id}>{pt.name} - {pt.specialty}</option>))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Phương thức thanh toán *</label>
                    <select className="form-input" required value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value)}>
                      <option value="banking">Chuyển khoản ngân hàng (QR)</option>
                      <option value="cash">Tiền mặt</option>
                      <option value="card">Thẻ tín dụng (POS)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Kích hoạt gói tập & Xuất hóa đơn</button>
                </form>
              </div>

              <div>
                {salesResult && (
                  <div className="glass-panel animate-fade-in" style={styles.receiptContainer}>
                    <div style={styles.receiptHeader}>
                      <FileText size={20} color="var(--primary)" /><span>HÓA ĐƠN DỊCH VỤ PHÒNG GYM</span>
                      <button onClick={() => setSalesResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                    <div style={styles.receiptBody}>
                      <p style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.1rem' }}>GMS FITNESS CLUB</p>
                      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã HĐ: {salesResult.transaction.id}</p>
                      <hr style={styles.receiptHr} />
                      <div style={styles.receiptRow}><span>Hội viên nhận:</span><span>{salesResult.transaction.memberName}</span></div>
                      <div style={styles.receiptRow}><span>Thời gian bán:</span><span>{new Date(salesResult.transaction.timestamp).toLocaleString('vi-VN')}</span></div>
                      <div style={styles.receiptRow}><span>Tên gói tập:</span><span style={{ fontWeight: '700' }}>{salesResult.transaction.packageName}</span></div>
                      <div style={styles.receiptRow}><span>Ngày bắt đầu:</span><span>{salesResult.subscription.startDate}</span></div>
                      <div style={styles.receiptRow}><span>Ngày kết thúc:</span><span>{salesResult.subscription.endDate}</span></div>
                      <hr style={styles.receiptHr} />
                      <div style={{ ...styles.receiptRow, fontWeight: '800', fontSize: '1.05rem' }}><span>TỔNG TIỀN:</span><span style={{ color: 'var(--primary)' }}>{salesResult.transaction.amount.toLocaleString('vi-VN')} ₫</span></div>
                    </div>
                  </div>
                )}

                {/* Transactions List with reversal trigger */}
                <div className="glass-panel" style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={styles.cardTitle}><FileText size={18} /> Giao Dịch Gần Đây</h3>
                    <button onClick={() => { setReversalResult(null); setShowReversalModal(true); }} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowRightLeft size={12} /> Yêu Cầu Hủy HĐ
                    </button>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>ID / Thời gian</th>
                          <th style={styles.th}>Hội viên</th>
                          <th style={styles.th}>Tổng tiền</th>
                          <th style={styles.th}>Trạng thái</th>
                          <th style={styles.th}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice().reverse().map(tx => (
                          <tr key={tx.id} style={styles.tableRow}>
                            <td style={styles.td}><strong>{tx.id}</strong><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(tx.timestamp).toLocaleDateString('vi-VN')}</div></td>
                            <td style={styles.td}>{tx.memberName}<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.packageName}</div></td>
                            <td style={styles.td} style={{ fontWeight: '700' }}>{tx.amount.toLocaleString('vi-VN')} ₫</td>
                            <td style={styles.td}><span className={`badge ${tx.status === 'completed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem' }}>{tx.status === 'completed' ? 'Thành công' : 'Đã hủy'}</span></td>
                            <td style={styles.td}>
                              {tx.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setReversalTxId(tx.id);
                                    setReversalResult(null);
                                    setShowReversalModal(true);
                                  }}
                                  className="btn btn-outline animate-fade-in"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '2px' }}
                                >
                                  <ArrowRightLeft size={10} /> Hủy GD
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM PACKAGES LIST TAB */}
          {activeTab === 'packages' && (
            <div className="glass-panel" style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={styles.cardTitle}><Dumbbell size={18} color="var(--primary)" /> Danh Sách Gói Tập Hệ Thống</h3>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm gói tập theo tên, loại..."
                  value={receptionistPackageSearch}
                  onChange={e => setReceptionistPackageSearch(e.target.value)}
                  style={{ width: '300px' }}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Mã Gói</th>
                      <th style={styles.th}>Tên Gói Dịch Vụ</th>
                      <th style={styles.th}>Phân Loại</th>
                      <th style={styles.th}>Thời Hạn</th>
                      <th style={styles.th}>Số Buổi Hướng Dẫn</th>
                      <th style={styles.th}>Đơn Giá</th>
                      <th style={styles.th}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.filter(pkg =>
                      pkg.name.toLowerCase().includes(receptionistPackageSearch.toLowerCase()) ||
                      pkg.type.toLowerCase().includes(receptionistPackageSearch.toLowerCase()) ||
                      pkg.id.toLowerCase().includes(receptionistPackageSearch.toLowerCase())
                    ).map(pkg => (
                      <tr key={pkg.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{pkg.id}</strong></td>
                        <td style={styles.td}><strong>{pkg.name}</strong></td>
                        <td style={styles.td}>
                          <span className={`badge ${pkg.type === 'pt' ? 'badge-primary' :
                              pkg.type === 'classic' ? 'badge-info' :
                                pkg.type === 'class' ? 'badge-warning' : 'badge-success'
                            }`} style={{ fontSize: '0.65rem' }}>
                            {pkg.type === 'pt' ? 'Gói PT' :
                              pkg.type === 'classic' ? 'Gói Classic' :
                                pkg.type === 'class' ? 'Lớp Yoga/Zumba' : 'Bể Bơi'}
                          </span>
                        </td>
                        <td style={styles.td}>{pkg.durationMonths} Tháng</td>
                        <td style={styles.td}>{pkg.sessions ? `${pkg.sessions} Buổi` : 'Không giới hạn'}</td>
                        <td style={styles.td} style={{ fontWeight: '700', color: 'var(--primary)' }}>
                          {pkg.price.toLocaleString('vi-VN')} đ
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => {
                              setPosPackageId(pkg.id);
                              setPosPackageSearchQuery(pkg.name);
                              setSalesResult(null);
                              setActiveTab('pos');
                            }}
                            className="btn btn-primary animate-fade-in"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Bán Gói Ngay
                          </button>
                        </td>
                      </tr>
                    ))}
                    {packages.filter(pkg =>
                      pkg.name.toLowerCase().includes(receptionistPackageSearch.toLowerCase()) ||
                      pkg.type.toLowerCase().includes(receptionistPackageSearch.toLowerCase()) ||
                      pkg.id.toLowerCase().includes(receptionistPackageSearch.toLowerCase())
                    ).length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Không tìm thấy gói tập nào khớp với từ khóa tìm kiếm.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GROUP CLASSES TAB (NV-08) */}
          {activeTab === 'classes' && (
            <div className="glass-panel" style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={styles.cardTitle}><Users size={18} color="var(--primary)" /> Quản Lý Lớp Học Nhóm</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Tên Lớp Học</th>
                      <th style={styles.th}>Huấn Luyện Viên</th>
                      <th style={styles.th}>Lịch học</th>
                      <th style={styles.th}>Thời Gian</th>
                      <th style={styles.th}>Học viên</th>
                      <th style={styles.th}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupClasses.map(c => {
                      const trainer = pts.find(p => p.id === c.trainerId) || {};
                      const enrolledBookings = groupClassBookings.filter(b => b.classId === c.id);
                      return (
                        <tr key={c.id} style={styles.tableRow}>
                          <td style={styles.td}><strong>{c.className}</strong></td>
                          <td style={styles.td}>{trainer.name || 'N/A'}</td>
                          <td style={styles.td}>{c.dayOfWeek}</td>
                          <td style={styles.td}>{c.time}</td>
                          <td style={styles.td}>{enrolledBookings.length} / {c.maxCapacity}</td>
                          <td style={styles.td}>
                            <button
                              onClick={() => {
                                setSelectedClassForCheckin(c);
                                setClassCheckinSuccess('');
                                setClassCheckinError('');
                                setClassCheckinMemberSearchQuery('');
                              }}
                              className="btn btn-primary animate-fade-in"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Điểm Danh & Đăng Ký
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}><Inbox size={18} /> Danh sách Leads nhận từ Landing Page</h3>
              <div style={{ marginTop: '15px', overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead><tr style={styles.tableHeaderRow}><th style={styles.th}>Ngày đăng ký</th><th style={styles.th}>Khách hàng</th><th style={styles.th}>SĐT</th><th style={styles.th}>Email</th><th style={styles.th}>Ghi chú</th><th style={styles.th}>Hành động</th></tr></thead>
                  <tbody>
                    {leads.slice().reverse().map(lead => (
                      <tr key={lead.id} style={styles.tableRow}>
                        <td style={styles.td}>{lead.date}</td><td style={styles.td}><strong>{lead.name}</strong></td><td style={styles.td}>{lead.phone}</td><td style={styles.td}>{lead.email || 'N/A'}</td><td style={styles.td} style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>{lead.note}</td>
                        <td style={styles.td}><button onClick={() => { setOnboardName(lead.name); setOnboardPhone(lead.phone); setOnboardEmail(lead.email || ''); setOnboardError(''); setActiveTab('onboard'); }} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Đăng ký</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MEMBER PROFILE MODAL */}
        {selectedMemberProfile && (
          <div style={styles.modalOverlay}>
            <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} color="var(--primary)" /> Hồ Sơ Hội Viên</h3>
                <button onClick={() => setSelectedMemberProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
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
                <button onClick={() => { setPosMemberId(selectedMemberProfile.id); setActiveTab('pos'); setSelectedMemberProfile(null); }} className="btn btn-primary" style={{ marginRight: '10px' }}>Gia Hạn / Mua Gói</button>
                <button onClick={() => setSelectedMemberProfile(null)} className="btn btn-outline">Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* REVERSAL MODAL */}
        {showReversalModal && (
          <div style={styles.modalOverlay}>
            <div className="glass-panel" style={styles.modalContent}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRightLeft size={18} color="var(--danger)" /> Yêu Cầu Hủy / Đảo Giao Dịch</h3>
              {reversalResult && (
                <div style={{ ...reversalResult.success ? styles.successAlert : styles.errorAlert, marginBottom: '15px' }}>
                  {reversalResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />} <span>{reversalResult.message || 'Gửi yêu cầu hủy thành công! Đang chờ Admin xét duyệt.'}</span>
                </div>
              )}
              <form onSubmit={handleReversalSubmit}>
                <div className="form-group">
                  <label className="form-label">Chọn Mã Giao Dịch (Chỉ hóa đơn thành công) *</label>
                  <select className="form-input" required value={reversalTxId} onChange={e => setReversalTxId(e.target.value)}>
                    <option value="">-- Chọn Hóa Đơn --</option>
                    {transactions.filter(t => t.status === 'completed').map(t => (
                      <option key={t.id} value={t.id}>{t.id} - {t.memberName} ({t.packageName} - {t.amount.toLocaleString()}đ)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lý do yêu cầu hủy *</label>
                  <textarea className="form-input" rows="3" required placeholder="Nhập sai thông tin, thanh toán nhầm..." value={reversalReason} onChange={e => setReversalReason(e.target.value)} style={{ resize: 'none' }}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowReversalModal(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Đóng</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', background: 'var(--danger)' }}>Gửi Yêu Cầu Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CLASS CHECK-IN & BOOKING MODAL (NV-08) */}
        {selectedClassForCheckin && (
          <div style={styles.modalOverlay}>
            <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--primary)" /> Điểm Danh & Đăng Ký: {selectedClassForCheckin.className}
                </h3>
                <button
                  onClick={() => setSelectedClassForCheckin(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {classCheckinSuccess && (
                <div style={{ ...styles.successAlert, marginBottom: '15px' }}>
                  <CheckCircle size={16} /> <span>{classCheckinSuccess}</span>
                </div>
              )}
              {classCheckinError && (
                <div style={{ ...styles.errorAlert, marginBottom: '15px' }}>
                  <AlertCircle size={16} /> <span>{classCheckinError}</span>
                </div>
              )}

              {/* Section 1: Register New Member to Class */}
              <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px', position: 'relative' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--primary)' }}>Thêm Hội Viên Vào Lớp Hôm Nay</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Gõ tìm hội viên để thêm..."
                    value={classCheckinMemberSearchQuery}
                    onChange={e => {
                      setClassCheckinMemberSearchQuery(e.target.value);
                      setShowClassMemberSuggestions(true);
                    }}
                    onFocus={() => setShowClassMemberSuggestions(true)}
                    style={{ flexGrow: 1, padding: '8px 12px' }}
                  />
                </div>

                {showClassMemberSuggestions && classCheckinMemberSearchQuery && (
                  <div style={{
                    position: 'absolute', top: '100%', left: '15px', right: '15px', zIndex: 100,
                    background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '4px',
                    maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {members.filter(m =>
                      m.name.toLowerCase().includes(classCheckinMemberSearchQuery.toLowerCase()) ||
                      m.phone.includes(classCheckinMemberSearchQuery) ||
                      m.id.toLowerCase().includes(classCheckinMemberSearchQuery.toLowerCase())
                    ).map(m => (
                      <div
                        key={m.id}
                        onMouseDown={async () => {
                          const todayDate = new Date().toISOString().split('T')[0];
                          const res = await handleBookGroupClass(m.id, selectedClassForCheckin.id, todayDate);
                          if (res.success) {
                            setClassCheckinSuccess(`Đã thêm hội viên ${m.name} vào lớp!`);
                            setClassCheckinError('');
                            setClassCheckinMemberSearchQuery('');
                            setShowClassMemberSuggestions(false);
                            setTimeout(() => setClassCheckinSuccess(''), 3000);
                          } else {
                            setClassCheckinError(res.message);
                            setClassCheckinSuccess('');
                            setShowClassMemberSuggestions(false);
                            setTimeout(() => setClassCheckinError(''), 4000);
                          }
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                      >
                        <strong>{m.name}</strong> - ID: {m.id} - SĐT: {m.phone}
                      </div>
                    ))}
                    {members.filter(m =>
                      m.name.toLowerCase().includes(classCheckinMemberSearchQuery.toLowerCase()) ||
                      m.phone.includes(classCheckinMemberSearchQuery) ||
                      m.id.toLowerCase().includes(classCheckinMemberSearchQuery.toLowerCase())
                    ).length === 0 && (
                        <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không tìm thấy hội viên</div>
                      )}
                  </div>
                )}
              </div>

              {/* Section 2: Enrolled members list & checkin action */}
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Danh Sách Đăng Ký & Điểm Danh</h4>
              <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Học viên</th>
                      <th style={styles.th}>Ngày</th>
                      <th style={styles.th}>Trạng thái</th>
                      <th style={styles.th}>Điểm danh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupClassBookings.filter(b => b.classId === selectedClassForCheckin.id).map(booking => {
                      const member = members.find(m => m.id === booking.memberId) || {};
                      return (
                        <tr key={booking.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <strong>{member.name || 'Unknown'}</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {member.id} | SĐT: {member.phone}</div>
                          </td>
                          <td style={styles.td}>{booking.date}</td>
                          <td style={styles.td}>
                            <span className={`badge ${booking.status === 'attended' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                              {booking.status === 'attended' ? 'Đã Tham Gia' : 'Đăng Ký'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {booking.status !== 'attended' && (
                              <button
                                onClick={async () => {
                                  const res = await handleCheckInGroupClassBooking(booking.id);
                                  if (res.success) {
                                    setClassCheckinSuccess('Điểm danh thành công!');
                                    setTimeout(() => setClassCheckinSuccess(''), 3000);
                                  } else {
                                    setClassCheckinError(res.message);
                                    setTimeout(() => setClassCheckinError(''), 3000);
                                  }
                                }}
                                className="btn btn-outline animate-fade-in"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              >
                                Check-in
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {groupClassBookings.filter(b => b.classId === selectedClassForCheckin.id).length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có học viên nào đăng ký lớp này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setSelectedClassForCheckin(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Đóng</button>
              </div>
            </div>
          </div>
        )}
        {/* CCCD QR SCANNER MODAL */}
        {showCccdModal && (
          <div style={styles.modalOverlay}>
            <div className="glass-panel animate-fade-in" style={{ ...styles.modalContent, maxWidth: '500px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Scan size={20} color="var(--primary)" /> Quét Mã QR Thẻ CCCD
                </h3>
                <button
                  onClick={() => setShowCccdModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Viewfinder simulation box */}
              <div style={{
                position: 'relative',
                height: '220px',
                backgroundColor: '#0a0f1d',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                {/* Green scanner laser overlay */}
                <div className="scanner-laser"></div>

                {/* Target outline frame */}
                <div style={{
                  width: '180px',
                  height: '180px',
                  border: '2px dashed rgba(16, 185, 129, 0.5)',
                  borderRadius: '8px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Scan size={36} color="rgba(16, 185, 129, 0.6)" className="animate-pulse" />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', position: 'absolute', bottom: '10px' }}>
                  Đang căn chỉnh mã QR trên thẻ CCCD vào khung...
                </span>
              </div>

              {/* Quick simulate selection or copy paste text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Giả lập quét mẫu thẻ CCCD:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleParseCccdQr("030094008888||Phan Văn Minh|12081993|Nam|123 Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh|15102021");
                        setShowCccdModal(false);
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', flexGrow: 1 }}
                    >
                      Phan Văn Minh
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleParseCccdQr("079094002345||Trần Thị Hồng|05041997|Nữ|456 Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh|20112022");
                        setShowCccdModal(false);
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', flexGrow: 1 }}
                    >
                      Trần Thị Hồng
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Nhập hoặc quét chuỗi QR gốc của CCCD (PDF417):
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dán chuỗi QR từ CCCD (Ví dụ: 030094008888||Nguyễn Văn A|...)"
                      style={{ flexGrow: 1, fontSize: '0.8rem', padding: '8px' }}
                      onChange={(e) => {
                        if (handleParseCccdQr(e.target.value)) {
                          setShowCccdModal(false);
                        }
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    * Hệ thống sẽ tự tách họ tên, số CCCD, sinh nhật và tự tạo tài khoản.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button onClick={() => setShowCccdModal(false)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* SALES INVOICE PREVIEW MODAL */}
        {salesPreview && (
          <div style={styles.modalOverlay}>
            <div className="glass-panel animate-fade-in" style={{ ...styles.modalContent, maxWidth: '450px', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <FileText size={20} color="var(--primary)" /> XÁC NHẬN HÓA ĐƠN
                </h3>
                <button
                  onClick={handleDeclineSales}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Paper-receipt box structure */}
              <div style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                <p style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: '#000000', margin: '0 0 4px 0' }}>GMS FITNESS CLUB</p>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px 0' }}>BẢN XEM TRƯỚC HÓA ĐƠN</p>

                <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Hội viên nhận:</span>
                  <span style={{ fontWeight: '700' }}>{salesPreview.memberName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Mã số hội viên:</span>
                  <span style={{ fontWeight: '700' }}>{salesPreview.memberId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Thời gian lập:</span>
                  <span>{new Date(salesPreview.timestamp).toLocaleString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Gói dịch vụ:</span>
                  <span style={{ fontWeight: '700' }}>{salesPreview.packageName}</span>
                </div>
                {salesPreview.ptName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                    <span>PT phụ trách:</span>
                    <span style={{ fontWeight: '700' }}>{salesPreview.ptName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Ngày bắt đầu:</span>
                  <span>{salesPreview.startDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>Ngày kết thúc:</span>
                  <span>{salesPreview.endDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#000000' }}>
                  <span>HT thanh toán:</span>
                  <span>
                    {salesPreview.paymentMethod === 'banking' ? 'Chuyển khoản (QR)' :
                      salesPreview.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ tín dụng (POS)'}
                  </span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: '#000000' }}>
                  <span>TỔNG TIỀN:</span>
                  <span style={{ color: 'var(--primary)' }}>{salesPreview.amount.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              {/* Buttons for confirm and decline */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button
                  onClick={handleDeclineSales}
                  className="btn btn-outline"
                  style={{ padding: '10px 20px', fontSize: '0.85rem', borderColor: 'var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600' }}
                >
                  Từ chối
                </button>
                <button
                  onClick={handleConfirmSales}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle size={16} /> Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const getTabStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: isActive ? 'var(--primary-glow)' : 'transparent',
  border: 'none',
  padding: '12px 18px',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: '0.2s',
  borderRadius: '8px',
  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
  width: '100%',
  textAlign: 'left',
  borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
  paddingLeft: isActive ? '14px' : '18px'
});

const styles = {
  container: { padding: '24px 0', textAlign: 'left' },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '24px 16px',
  },
  sidebarTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    marginBottom: '16px',
    paddingLeft: '4px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  contentArea: {
    minWidth: 0
  },
  card: { padding: '24px', display: 'flex', flexDirection: 'column' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' },
  badgeList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  microBtn: { background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: '0.2s' },
  searchList: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' },
  searchItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px' },
  checkInFeedback: { padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', position: 'relative' },
  feedbackText: { flexGrow: 1 },
  closeAlertBtn: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  receiptContainer: { padding: '24px', boxShadow: 'var(--glass-shadow)', border: '1px solid var(--border-color)', marginBottom: '20px', backgroundColor: '#fff', color: '#000' },
  receiptHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '15px' },
  receiptBody: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', border: '1px solid #e2e8f0' },
  receiptHr: { border: 'none', borderTop: '1px dashed #cccccc', margin: '12px 0' },
  receiptRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeaderRow: { borderBottom: '2px solid var(--border-color)' },
  th: { padding: '12px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid var(--border-color)', transition: '0.2s' },
  td: { padding: '10px 8px', fontSize: '0.8rem' },
  statMiniCard: { backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '16px', marginTop: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: '450px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' },
  errorAlert: { backgroundColor: 'var(--danger-glow)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' },
  successAlert: { backgroundColor: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }
};
