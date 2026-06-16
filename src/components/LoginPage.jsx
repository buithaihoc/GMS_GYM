import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Key, Mail, ShieldAlert, CheckCircle, UserCheck } from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function LoginPage() {
  const { loginAs } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Fetch the default demo user lists for display
  const db = mockDb.get();
  const demoMembers = db.members;
  const demoPts = db.pts;

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập!');
      return;
    }

    const currentDb = mockDb.get();
    const allMembers = currentDb.members || [];
    const allPts = currentDb.pts || [];
    const allStaff = currentDb.staff || [];

    // 1. Check staff (Admin/Receptionist)
    const staffUser = allStaff.find(s => s.email === email || s.phone === email);
    if (staffUser && staffUser.password === password) {
      loginAs(staffUser.role, staffUser);
      return;
    }
    // Fallback mặc định
    if (email === 'admin@gym.com' && password === 'GMS@1234') {
      loginAs('admin', { name: "QUẢN TRỊ VIÊN", role: "admin", email });
      return;
    }
    if (email === 'receptionist@gym.com' && password === 'GMS@1234') {
      loginAs('receptionist', { name: "LỄ TÂN QUẦY", role: "receptionist", email });
      return;
    }

    // 2. Check PTs
    const ptUser = allPts.find(p => p.email === email || p.phone === email);
    if (ptUser && ptUser.password === password) {
      loginAs('pt', ptUser);
      return;
    }

    // 3. Check Members
    const memberUser = allMembers.find(m => m.email === email || m.phone === email);
    if (memberUser && memberUser.password === password) {
      loginAs('member', memberUser);
      return;
    }

    setError('Tài khoản (Email/SĐT) hoặc mật khẩu không chính xác!');
  };

  return (
    <div className="login-container animate-fade-in" style={styles.container}>
      <div className="glass-panel" style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <LogIn size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Đăng Nhập GMS</h2>
          <p style={styles.subtitle}>Hệ thống Quản lý Phòng Tập Gym Toàn Diện</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <ShieldAlert size={16} color="var(--danger)" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleManualLogin} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Tài khoản (SĐT hoặc Email)</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input 
                type="text" 
                className="form-input" 
                style={styles.inputField}
                placeholder="Nhập số điện thoại hoặc email..."
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={styles.inputWrapper}>
              <Key size={16} style={styles.inputIcon} />
              <input 
                type="password" 
                className="form-input" 
                style={styles.inputField}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Đăng Nhập
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Hoặc trải nghiệm nhanh demo</span>
        </div>

        {/* Demo Roles Container */}
        <div style={styles.demoSection}>
          <h3 style={styles.demoTitle}>Chọn vai trò để đăng nhập nhanh:</h3>
          
          <div style={styles.demoGrid}>
            {/* Admin Demo */}
            <button 
              onClick={() => loginAs('admin')} 
              style={{ ...styles.demoBtn, borderLeft: '4px solid var(--accent)' }}
            >
              <div style={styles.demoBtnHeader}>
                <span style={styles.demoRoleName}>QUẢN TRỊ VIÊN</span>
                <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>Admin</span>
              </div>
              <span style={styles.demoEmail}>admin@gym.com</span>
            </button>

            {/* Receptionist Demo */}
            <button 
              onClick={() => loginAs('receptionist')} 
              style={{ ...styles.demoBtn, borderLeft: '4px solid var(--secondary)' }}
            >
              <div style={styles.demoBtnHeader}>
                <span style={styles.demoRoleName}>LỄ TÂN QUẦY</span>
                <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>Staff</span>
              </div>
              <span style={styles.demoEmail}>receptionist@gym.com</span>
            </button>

            {/* PT Demo List */}
            {demoPts.map(pt => (
              <button 
                key={pt.id}
                onClick={() => loginAs('pt', pt)} 
                style={{ ...styles.demoBtn, borderLeft: '4px solid var(--primary)' }}
              >
                <div style={styles.demoBtnHeader}>
                  <span style={styles.demoRoleName}>{pt.name}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>PT</span>
                </div>
                <span style={styles.demoEmail}>{pt.email}</span>
              </button>
            ))}

            {/* Member Demo List */}
            {demoMembers.map(member => (
              <button 
                key={member.id}
                onClick={() => loginAs('member', member)} 
                style={{ ...styles.demoBtn, borderLeft: '4px solid var(--warning)' }}
              >
                <div style={styles.demoBtnHeader}>
                  <span style={styles.demoRoleName}>{member.name}</span>
                  <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem' }}>
                    {member.status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </div>
                <span style={styles.demoEmail}>{member.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 150px)',
    padding: '40px 20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '520px',
    padding: '40px 30px',
    boxShadow: 'var(--glass-shadow)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px auto',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '6px'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--danger-glow)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px 16px',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    marginBottom: '20px',
    textAlign: 'left'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)'
  },
  inputField: {
    width: '100%',
    paddingLeft: '45px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '30px 0 20px 0'
  },
  dividerText: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: 'var(--bg-surface)',
    padding: '0 15px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  },
  demoSection: {
    textAlign: 'left'
  },
  demoTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginBottom: '15px'
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  demoBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: '0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  demoBtnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '6px'
  },
  demoRoleName: {
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  demoEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  }
};
