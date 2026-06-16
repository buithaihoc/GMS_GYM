import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MemberDashboard from './components/MemberDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import PtDashboard from './components/PtDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Dumbbell, UserCheck, Shield, ChevronRight, LogOut, ArrowRight, User, ChevronDown, ChevronUp, Database } from 'lucide-react';

function GmsAppContent() {
  const { currentRole, currentUser, loginAs, logout, members, pts, useMockDb, toggleDbMode } = useApp();
  const [isSimExpanded, setIsSimExpanded] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPtId, setSelectedPtId] = useState('');

  // Route view mapping
  const renderActiveView = () => {
    switch (currentRole) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'member':
        return <MemberDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'pt':
        return <PtDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div style={styles.appWrapper}>
      {/* Navigation Header */}
      <header className="glass-panel" style={styles.header}>
        <div style={styles.logoGroup} onClick={() => loginAs('landing')}>
          <div style={styles.logoIcon}>
            <Dumbbell size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={styles.logoTitle}>GMS <span style={{ color: 'var(--primary)', fontWeight: '400' }}>FITNESS</span></h1>
          </div>
        </div>

        {/* Dynamic header items based on role */}
        <div style={styles.headerActions}>
          {/* Database Mode Switcher Toggle */}
          <button 
            onClick={toggleDbMode} 
            title={useMockDb ? "Đang dùng Offline LocalStorage. Click để kết nối PostgreSQL" : "Đang dùng Online PostgreSQL. Click để chuyển về LocalStorage"}
            style={{
              ...styles.dbSwitcherBtn,
              borderColor: useMockDb ? 'var(--warning)' : 'var(--success)',
              background: useMockDb ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: useMockDb ? 'var(--warning)' : 'var(--success)',
            }}
          >
            <Database size={14} />
            <span>{useMockDb ? "Mock DB" : "PostgreSQL"}</span>
          </button>

          {currentRole !== 'landing' && currentRole !== 'login' && (
            <div style={styles.userProfilePill}>
              <User size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {currentUser?.name || 'Tài khoản Demo'} ({currentRole.toUpperCase()})
              </span>
            </div>
          )}

          {currentRole === 'landing' ? (
            <button onClick={() => loginAs('login')} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
              Truy cập Hệ thống <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={14} /> Đăng xuất
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.mainContent}>
        {renderActiveView()}
      </main>

      {/* Floating Demo Simulator Panel (Pill at the bottom of the screen) */}
      {isSimExpanded ? (
        <div className="glass-panel" style={styles.simulatorPanel}>
          <div style={styles.simulatorHeader}>
            <UserCheck size={16} color="var(--secondary)" />
            <span style={styles.simulatorTitle}>MÔ PHỎNG VAI TRÒ HỆ THỐNG (SIMULATOR)</span>
          </div>
          <div style={styles.simulatorButtons}>
            <button 
              onClick={() => loginAs('landing')} 
              style={{ 
                ...styles.simBtn, 
                borderColor: currentRole === 'landing' ? 'var(--secondary)' : 'var(--border-color)',
                background: currentRole === 'landing' ? 'var(--secondary)' : 'transparent',
                color: currentRole === 'landing' ? '#ffffff' : 'var(--text-primary)'
              }}
            >
              Trang Chủ
            </button>
            <button 
              onClick={() => loginAs('login')} 
              style={{ 
                ...styles.simBtn, 
                borderColor: currentRole === 'login' ? 'var(--primary)' : 'var(--border-color)',
                background: currentRole === 'login' ? 'var(--primary)' : 'transparent',
                color: currentRole === 'login' ? '#ffffff' : 'var(--text-primary)'
              }}
            >
              Đăng Nhập
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                id="member-sim-select"
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                style={{
                  ...styles.simBtn,
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  borderColor: currentRole === 'member' ? 'var(--warning)' : 'var(--border-color)',
                  background: currentRole === 'member' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: currentRole === 'member' ? 'var(--warning)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  maxWidth: '180px'
                }}
              >
                <option value="">Hội Viên ▾</option>
                {members.filter(m => m.status === 'active').map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                {members.filter(m => m.status !== 'active').length > 0 && (
                  <optgroup label="── Hết hạn ──">
                    {members.filter(m => m.status !== 'active').map(m => (
                      <option key={m.id} value={m.id}>{m.name} (hết hạn)</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                onClick={() => {
                  const memberId = selectedMemberId || (members[0]?.id);
                  const memberObj = members.find(m => m.id === memberId) || members[0];
                  if (memberObj) loginAs('member', memberObj);
                }}
                style={{
                  ...styles.simBtn,
                  borderColor: currentRole === 'member' ? 'var(--warning)' : 'var(--border-color)',
                  background: currentRole === 'member' ? 'var(--warning)' : 'transparent',
                  color: currentRole === 'member' ? '#ffffff' : 'var(--text-primary)'
                }}
              >
                Đăng nhập
              </button>
            </div>
            <button 
              onClick={() => loginAs('receptionist')} 
              style={{ 
                ...styles.simBtn, 
                borderColor: currentRole === 'receptionist' ? 'var(--success)' : 'var(--border-color)',
                background: currentRole === 'receptionist' ? 'var(--success)' : 'transparent',
                color: currentRole === 'receptionist' ? '#ffffff' : 'var(--text-primary)'
              }}
            >
              Lễ Tân
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                id="pt-sim-select"
                value={selectedPtId}
                onChange={e => setSelectedPtId(e.target.value)}
                style={{
                  ...styles.simBtn,
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  borderColor: currentRole === 'pt' ? 'var(--primary)' : 'var(--border-color)',
                  background: currentRole === 'pt' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: currentRole === 'pt' ? 'var(--primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  maxWidth: '180px'
                }}
              >
                <option value="">HLV ▾</option>
                {pts.map(p => (
                  <option key={p.id} value={p.id}>{p.name.split(' (')[0]}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const ptId = selectedPtId || (pts[0]?.id);
                  const ptObj = pts.find(p => p.id === ptId) || pts[0];
                  if (ptObj) loginAs('pt', ptObj);
                }}
                style={{
                  ...styles.simBtn,
                  borderColor: currentRole === 'pt' ? 'var(--primary)' : 'var(--border-color)',
                  background: currentRole === 'pt' ? 'var(--primary)' : 'transparent',
                  color: currentRole === 'pt' ? '#ffffff' : 'var(--text-primary)'
                }}
              >
                Đăng nhập PT
              </button>
            </div>
            <button 
              onClick={() => loginAs('admin')} 
              style={{ 
                ...styles.simBtn, 
                borderColor: currentRole === 'admin' ? 'var(--accent)' : 'var(--border-color)',
                background: currentRole === 'admin' ? 'var(--accent)' : 'transparent',
                color: currentRole === 'admin' ? '#ffffff' : 'var(--text-primary)'
              }}
            >
              Quản Trị Admin
            </button>
            <button 
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại và khôi phục CSDL về trạng thái ban đầu sạch sẽ?")) {
                  localStorage.removeItem("gym_gms_data");
                  localStorage.removeItem("gym_gms_version");
                  window.location.reload();
                }
              }} 
              style={{ 
                ...styles.simBtn, 
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'transparent',
                color: 'var(--danger)'
              }}
            >
              Reset CSDL
            </button>
          </div>
          <button 
            onClick={() => setIsSimExpanded(false)}
            title="Thu nhỏ thanh mô phỏng"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              marginLeft: '6px',
              color: 'var(--text-secondary)'
            }}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsSimExpanded(true)}
          title="Mở thanh mô phỏng vai trò"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(21, 101, 192, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            transition: 'transform 0.2s',
          }}
        >
          <UserCheck size={20} />
        </button>
      )}

      {/* Global Footer */}
      <footer style={styles.footer}>
        <p>© 2026 GMS Gym Management System. Dự án phân tích thiết kế hệ thống.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
          Được thiết kế cho môi trường học thuật chuyên sâu và kiểm thử chức năng.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <GmsAppContent />
    </AppProvider>
  );
}

const styles = {
  appWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 20px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  header: {
    height: 'var(--nav-height)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    marginTop: '15px',
    border: '1px solid var(--border-color)'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  dbSwitcherBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid',
    padding: '6px 14px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '700',
    transition: '0.2s',
  },
  userProfilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    padding: '6px 14px',
    borderRadius: '9999px',
  },
  mainContent: {
    flexGrow: 1,
    padding: '10px 0 100px 0',
  },
  simulatorPanel: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '9999px',
    maxWidth: '90%'
  },
  simulatorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRight: '1px solid var(--border-color)',
    paddingRight: '15px',
    whiteSpace: 'nowrap'
  },
  simulatorTitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em'
  },
  simulatorButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  simBtn: {
    border: '1px solid',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: '0.2s',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    padding: '30px 0 120px 0',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem'
  }
};
