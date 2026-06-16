import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Users, Shield, Calendar, Phone, Mail, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { packages, pts, handleAddLead, loginAs } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    handleAddLead(name, phone, email, note || 'Đăng ký nhận tư vấn từ Landing Page');
    setSubmitted(true);
    setName('');
    setPhone('');
    setEmail('');
    setNote('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="landing-page animate-fade-in" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}><Dumbbell size={16} /> HỆ THỐNG PHÒNG TẬP CAO CẤP GMS</div>
          <h1 style={styles.heroTitle}>BỨT PHÁ GIỚI HẠN <br /><span style={{ color: 'var(--primary)' }}>NÂNG TẦM THỂ CHẤT</span></h1>
          <p style={styles.heroSubtitle}>
            Trải nghiệm không gian tập luyện đẳng cấp 5 sao với trang thiết bị hiện đại, 
            đội ngũ huấn luyện viên cá nhân chuyên nghiệp và hệ thống quản lý chỉ số sức khỏe thông minh.
          </p>
          <div style={styles.heroActions}>
            <a href="#register" style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, var(--primary) 0%, #6d28d9 100%)' }}>
              Đăng Ký Tập Thử Miễn Phí <ArrowRight size={18} />
            </a>
            <button onClick={() => loginAs('login')} style={{ ...styles.actionBtn, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              Đăng Nhập Hệ Thống
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>TẠI SAO CHỌN GMS?</h2>
        <p style={styles.sectionSubtitle}>Dịch vụ tiêu chuẩn quốc tế đáp ứng mọi nhu cầu tập luyện của bạn</p>
        <div className="grid-3" style={{ marginTop: '40px' }}>
          <div className="glass-panel" style={styles.featureCard}>
            <div style={styles.iconWrapper}><Award size={28} color="var(--primary)" /></div>
            <h3 style={styles.featureTitle}>Đội ngũ HLV Chuyên Nghiệp</h3>
            <p style={styles.featureDesc}>Các PT giàu kinh nghiệm thiết lập giáo án cá nhân hóa sát với thể trạng từng hội viên.</p>
          </div>
          <div className="glass-panel" style={styles.featureCard}>
            <div style={styles.iconWrapper}><Shield size={28} color="var(--secondary)" /></div>
            <h3 style={styles.featureTitle}>Quản Lý Sức Khỏe Số</h3>
            <p style={styles.featureDesc}>Theo dõi chỉ số sinh trắc học (Inbody, Body Fat, Cơ) qua biểu đồ số hóa trực quan.</p>
          </div>
          <div className="glass-panel" style={styles.featureCard}>
            <div style={styles.iconWrapper}><Calendar size={28} color="var(--accent)" /></div>
            <h3 style={styles.featureTitle}>Đặt Lịch Chủ Động</h3>
            <p style={styles.featureDesc}>Hội viên tự chọn lịch tập, đổi lịch linh hoạt với PT ngay trên ứng dụng di động.</p>
          </div>
        </div>
      </section>

      {/* Pricing Catalog */}
      <section style={styles.section} id="packages">
        <h2 style={styles.sectionTitle}>CÁC GÓI DỊCH VỤ</h2>
        <p style={styles.sectionSubtitle}>Chọn gói tập phù hợp để bắt đầu hành trình thay đổi bản thân</p>
        
        <div className="grid-3" style={{ marginTop: '40px' }}>
          {packages.map((pkg) => (
            <div key={pkg.id} className="glass-panel" style={{
              ...styles.pricingCard,
              border: pkg.id === 'PKG-003' ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
              position: 'relative'
            }}>
              {pkg.id === 'PKG-003' && <div style={styles.ribbon}>PHỔ BIẾN NHẤT</div>}
              <div style={styles.pricingHeader}>
                <h3 style={styles.pkgName}>{pkg.name}</h3>
                <span className="badge badge-info" style={{ marginTop: '8px' }}>
                  {pkg.type === 'pt' ? 'Gói Huấn Luyện Viên' : 'Thẻ Hội Viên'}
                </span>
              </div>
              <div style={styles.priceContainer}>
                <span style={styles.priceAmount}>{pkg.price.toLocaleString('vi-VN')}</span>
                <span style={styles.priceSymbol}>đ</span>
                <span style={styles.priceDuration}>/ {pkg.durationMonths} tháng</span>
              </div>
              <div style={styles.pricingFeatures}>
                <div style={styles.pricingFeatureItem}><CheckCircle size={16} color="var(--success)" /> Truy cập đầy đủ tiện ích phòng tập</div>
                <div style={styles.pricingFeatureItem}><CheckCircle size={16} color="var(--success)" /> Nước uống và tủ đồ miễn phí</div>
                <div style={styles.pricingFeatureItem}>
                  <CheckCircle size={16} color="var(--success)" /> 
                  {pkg.type === 'pt' ? `Huấn luyện riêng ${pkg.sessions} buổi với PT` : 'Tự do tập luyện không giới hạn'}
                </div>
                <div style={styles.pricingFeatureItem}><CheckCircle size={16} color="var(--success)" /> Đo chỉ số cơ thể định kỳ</div>
              </div>
              <a href="#register" style={{
                ...styles.priceBtn,
                background: pkg.id === 'PKG-003' ? 'var(--primary)' : 'transparent',
                color: pkg.id === 'PKG-003' ? '#ffffff' : 'var(--primary)',
                border: '2px solid var(--primary)',
              }}>Chọn Gói Ngay</a>
            </div>
          ))}
        </div>
      </section>

      {/* PT Carousel */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>ĐỘI NGŨ HUẤN LUYỆN VIÊN (PT)</h2>
        <p style={styles.sectionSubtitle}>Những người bạn đồng hành tận tâm trên chặng đường chinh phục mục tiêu sức khỏe</p>
        <div className="grid-2" style={{ marginTop: '40px' }}>
          {pts.map((pt) => (
            <div key={pt.id} className="glass-panel" style={styles.ptCard}>
              <div style={styles.ptAvatar}>
                <Users size={40} color="var(--primary)" />
              </div>
              <div style={styles.ptInfo}>
                <h3 style={styles.ptName}>{pt.name}</h3>
                <p style={styles.ptSpecialty}><Award size={14} style={{ marginRight: '6px' }} /> Chuyên môn: {pt.specialty}</p>
                <p style={styles.ptSpecialty}><Phone size={14} style={{ marginRight: '6px' }} /> Hotline: {pt.phone}</p>
                <div style={styles.ptBadges}>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Đạt chuẩn NASM</span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Giàu kinh nghiệm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Section */}
      <section style={{ ...styles.section, background: 'rgba(20, 20, 35, 0.4)', borderRadius: 'var(--border-radius-lg)', padding: '50px 30px' }} id="register">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'left', margin: 0 }}>TRẢI NGHIỆM MIỄN PHÍ BUỔI ĐẦU</h2>
            <p style={{ ...styles.sectionSubtitle, textAlign: 'left', marginTop: '10px' }}>
              Hãy để lại thông tin của bạn. Đội ngũ lễ tân sẽ liên hệ trong vòng 15 phút để kích hoạt vé tập thử và sắp xếp lịch tư vấn sức khỏe miễn phí.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="var(--primary)" /> <span>Hotline hỗ trợ: 1900 6868</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="var(--secondary)" /> <span>Email liên hệ: support@gms.com</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Thông Tin Đăng Ký</h3>
            {submitted ? (
              <div style={styles.successMessage}>
                <CheckCircle size={36} color="var(--success)" />
                <h4 style={{ color: 'var(--success)', marginTop: '10px' }}>Đăng Ký Thành Công!</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Thông tin của bạn đã được ghi nhận vào hệ thống Leads. Bộ phận Lễ tân sẽ sớm liên hệ với bạn!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input type="text" className="form-input" placeholder="Nguyễn Văn A" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input type="tel" className="form-input" placeholder="0901234567" required value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="a@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú nhu cầu</label>
                  <textarea className="form-input" rows="3" placeholder="Tư vấn gói tập giảm cân, tăng cơ..." value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'none' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Đăng Ký Tư Vấn Ngay
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    height: '600px',
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
    backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    padding: '0 50px',
    marginTop: '20px',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(90deg, #09090be0 30%, #09090b80 100%)',
    zIndex: 1
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '650px',
    textAlign: 'left'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--primary-glow)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: 'var(--primary)',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '20px'
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.1',
    fontWeight: 800,
    marginBottom: '20px',
    color: '#ffffff'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.6',
    marginBottom: '35px'
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: '700',
    borderRadius: 'var(--border-radius-sm)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: '0.3s ease',
  },
  section: {
    padding: '50px 0',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: 0
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginTop: '10px'
  },
  featureCard: {
    padding: '40px 30px',
    textAlign: 'left',
    transition: '0.3s ease',
  },
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    border: '1px solid var(--border-color)'
  },
  featureTitle: {
    fontSize: '1.3rem',
    marginBottom: '12px'
  },
  featureDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.6'
  },
  pricingCard: {
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    transition: '0.3s ease',
    height: '100%',
    justifyContent: 'space-between',
    boxSizing: 'border-box'
  },
  ribbon: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '9999px',
    letterSpacing: '0.05em'
  },
  pricingHeader: {
    marginBottom: '20px'
  },
  pkgName: {
    fontSize: '1.3rem',
    fontWeight: '700'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '25px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '15px'
  },
  priceSymbol: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--primary)',
    marginLeft: '2px',
    marginRight: '4px'
  },
  priceAmount: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  priceDuration: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  pricingFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flexGrow: 1,
    marginBottom: '30px'
  },
  pricingFeatureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  priceBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '12px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: '0.3s ease'
  },
  ptCard: {
    padding: '25px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    textAlign: 'left',
  },
  ptAvatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-glow)',
    border: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ptInfo: {
    flexGrow: 1
  },
  ptName: {
    fontSize: '1.3rem',
    marginBottom: '6px'
  },
  ptSpecialty: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px'
  },
  ptBadges: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px'
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
};
