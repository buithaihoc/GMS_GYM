import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../utils/mockDb';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Roles: 'landing', 'login', 'member', 'receptionist', 'pt', 'admin'
  const [currentRole, setCurrentRole] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null); // Simulated user profiles

  // Database mode switcher: true = Mock Database (localStorage), false = PostgreSQL (via Node Express)
  const [useMockDb, setUseMockDb] = useState(() => {
    const saved = localStorage.getItem('GMS_USE_MOCK_DB');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Database collections states
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [memberPackages, setMemberPackages] = useState([]);
  const [pts, setPts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [reversals, setReversals] = useState([]);
  const [groupClasses, setGroupClasses] = useState([]);
  const [groupClassBookings, setGroupClassBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [biometrics, setBiometrics] = useState([]);


  // Initialize DB and load states
  useEffect(() => {
    if (useMockDb) {
      mockDb.init();
    }
    refreshState();
  }, [useMockDb]);

  const refreshState = async () => {
    if (useMockDb) {
      const data = mockDb.get();
      setMembers(data.members || []);
      setPackages(data.packages || []);
      setMemberPackages(data.memberPackages || []);
      setPts(data.pts || []);
      setCheckIns(data.checkIns || []);
      setSessions(data.sessions || []);
      setTransactions(data.transactions || []);
      setLeads(data.leads || []);
      setReversals(data.reversals || []);
      setGroupClasses(data.groupClasses || []);
      setGroupClassBookings(data.groupClassBookings || []);
      setStaff(data.staff || []);
      setScheduleRequests(data.scheduleRequests || []);
      setBiometrics(data.biometrics || []);
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/db-state');
        if (!response.ok) throw new Error('Backend server is offline');
        const data = await response.json();
        setMembers(data.members || []);
        setPackages(data.packages || []);
        setMemberPackages(data.memberPackages || []);
        setPts(data.pts || []);
        setCheckIns(data.checkIns || []);
        setSessions(data.sessions || []);
        setTransactions(data.transactions || []);
        setLeads(data.leads || []);
        setReversals(data.reversals || []);
        setGroupClasses(data.groupClasses || []);
        setGroupClassBookings(data.groupClassBookings || []);
        setStaff(data.staff || []);
        setScheduleRequests(data.scheduleRequests || []);
        setBiometrics(data.biometrics || []);
      } catch (err) {
        console.error('Failed to load state from PostgreSQL backend. Falling back to Mock DB.', err);
        setUseMockDb(true);
        localStorage.setItem('GMS_USE_MOCK_DB', 'true');
        alert('Không thể kết nối đến PostgreSQL backend. Tự động chuyển về Chế độ Mock DB.');
      }
    }
  };

  const toggleDbMode = () => {
    const nextMode = !useMockDb;
    setUseMockDb(nextMode);
    localStorage.setItem('GMS_USE_MOCK_DB', JSON.stringify(nextMode));
  };

  // Switch role helper
  const loginAs = (role, userObject = null) => {
    setCurrentRole(role);
    if (userObject) {
      setCurrentUser(userObject);
    } else {
      // Set default demo user based on role
      if (role === 'member') {
        setCurrentUser(members[0] || null); // Default to MB-001
      } else if (role === 'pt') {
        setCurrentUser(pts[0] || null); // Default to PT-001
      } else {
        setCurrentUser({ name: role.toUpperCase(), role });
      }
    }
  };

  const logout = () => {
    setCurrentRole('landing');
    setCurrentUser(null);
  };

  // Action Wrappers that update local state + DB
  const handleAddMember = async (memberData) => {
    if (useMockDb) {
      const newMember = mockDb.addMember(memberData);
      refreshState();
      return newMember;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });
        if (!res.ok) throw new Error('API Error');
        const newMember = await res.json();
        await refreshState();
        return newMember;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleSubscribePackage = async (memberId, packageId, paymentMethod) => {
    if (useMockDb) {
      const res = mockDb.subscribePackage(memberId, packageId, paymentMethod);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, packageId, paymentMethod })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleCheckIn = async (memberId, type) => {
    if (useMockDb) {
      const res = mockDb.checkIn(memberId, type);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, type })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleCheckInDropIn = async (name, phone, fee, paymentMethod) => {
    if (useMockDb) {
      const res = mockDb.checkInDropIn(name, phone, fee, paymentMethod);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/checkins/dropin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, fee, paymentMethod })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleAddSession = async (memberId, ptId, dateTime, bookingType) => {
    if (useMockDb) {
      const res = mockDb.addSession(memberId, ptId, dateTime, bookingType);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, ptId, dateTime, bookingType })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleUpdateSessionStatus = async (sessionId, status) => {
    if (useMockDb) {
      const res = mockDb.updateSessionStatus(sessionId, status);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleAddBiometrics = async (memberId, stats) => {
    if (useMockDb) {
      const res = mockDb.addBiometrics(memberId, stats);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/biometrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, ...stats })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleCreateReversal = async (transactionId, reason) => {
    if (useMockDb) {
      const res = mockDb.createReversal(transactionId, reason);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/reversals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, reason })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleApproveReversal = async (reversalId, action) => {
    if (useMockDb) {
      const res = mockDb.approveReversal(reversalId, action);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/reversals/${reversalId}/approve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleAddPackage = async (pkgData) => {
    if (useMockDb) {
      const res = mockDb.savePackage(pkgData);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pkgData)
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (useMockDb) {
      mockDb.deletePackage(packageId);
      refreshState();
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/packages/${packageId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Error');
        await refreshState();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddLead = async (name, phone, email, note) => {
    if (useMockDb) {
      const res = mockDb.addLead(name, phone, email, note);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, note })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const getMemberBiometrics = (memberId) => {
    return biometrics.filter(b => b.memberId === memberId).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Group Classes Handlers
  const handleBookGroupClass = async (memberId, classId, date) => {
    if (useMockDb) {
      const res = mockDb.bookGroupClass(memberId, classId, date);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/group-classes/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, classId, date })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleCancelGroupClassBooking = async (bookingId) => {
    if (useMockDb) {
      const res = mockDb.cancelGroupClassBooking(bookingId);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/group-classes/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Error');
        await refreshState();
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleCheckInGroupClassBooking = async (bookingId) => {
    if (useMockDb) {
      const res = mockDb.checkInGroupClassBooking(bookingId);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/group-classes/bookings/${bookingId}/checkin`, {
          method: 'PUT'
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleSaveGroupClass = async (gclass) => {
    if (useMockDb) {
      const res = mockDb.saveGroupClass(gclass);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/group-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gclass)
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleDeleteGroupClass = async (id) => {
    if (useMockDb) {
      mockDb.deleteGroupClass(id);
      refreshState();
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/group-classes/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Error');
        await refreshState();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Staff Handlers
  const handleSaveStaff = async (staffMember) => {
    if (useMockDb) {
      const res = mockDb.saveStaff(staffMember);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffMember)
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (useMockDb) {
      mockDb.deleteStaff(staffId);
      refreshState();
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Error');
        await refreshState();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateStaffShift = async (staffId, shift) => {
    if (useMockDb) {
      const res = mockDb.updateStaffShift(staffId, shift);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/staff/${staffId}/shift`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shift })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  };

  // Schedule Request Handlers
  const handleRequestSchedule = async (memberId, ptId, memberPackageId, scheduleData) => {
    if (useMockDb) {
      const res = mockDb.requestSchedule(memberId, ptId, memberPackageId, scheduleData);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/schedule-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, ptId, memberPackageId, ...scheduleData })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleApproveScheduleRequest = async (requestId, ptNote) => {
    if (useMockDb) {
      const res = mockDb.approveScheduleRequest(requestId, ptNote);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/schedule-requests/${requestId}/approve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ptNote })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleRejectScheduleRequest = async (requestId, ptNote) => {
    if (useMockDb) {
      const res = mockDb.rejectScheduleRequest(requestId, ptNote);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/schedule-requests/${requestId}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ptNote })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        await refreshState();
        return data;
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const handleCancelScheduleRequest = async (requestId) => {
    if (useMockDb) {
      const res = mockDb.cancelScheduleRequest(requestId);
      refreshState();
      return res;
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/schedule-requests/${requestId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Error');
        await refreshState();
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, message: 'Lỗi kết nối Server backend!' };
      }
    }
  };

  const detectPtConflict = (ptId, daysOfWeek, timeSlot, excludeRequestId) => {
    const requestHour = parseInt(timeSlot.split(':')[0], 10);

    // 1. Check group classes taught by this PT
    const ptClasses = groupClasses.filter(c => c.trainerId === ptId);
    for (const cls of ptClasses) {
      const clsDow = cls.dayOfWeek;
      if (!daysOfWeek.includes(clsDow)) continue;
      const parts = cls.time.split(' - ');
      if (parts.length !== 2) continue;
      const clsStart = parseInt(parts[0].split(':')[0], 10);
      const clsEnd   = parseInt(parts[1].split(':')[0], 10);
      if (requestHour >= clsStart && requestHour < clsEnd) {
        return { conflict: true, reason: `Giờ ${timeSlot} bị xung đột với lớp "${cls.className}" (${cls.dayOfWeek} ${cls.time})` };
      }
    }

    // 2. Check approved fixed schedule requests
    const approvedRequests = scheduleRequests.filter(
      r => r.ptId === ptId && r.status === 'approved' && r.id !== excludeRequestId
    );
    for (const req of approvedRequests) {
      const overlap = daysOfWeek.some(d => req.daysOfWeek.includes(d));
      if (!overlap) continue;
      const reqHour = parseInt(req.timeSlot.split(':')[0], 10);
      if (reqHour === requestHour) {
        const member = members.find(m => m.id === req.memberId);
        return { conflict: true, reason: `Giờ ${timeSlot} bị xung đột với lịch đã duyệt của học viên "${member ? member.name : req.memberId}"` };
      }
    }

    return { conflict: false };
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      currentUser,
      useMockDb,
      toggleDbMode,
      members,
      packages,
      memberPackages,
      pts,
      checkIns,
      sessions,
      transactions,
      leads,
      reversals,
      groupClasses,
      groupClassBookings,
      staff,
      scheduleRequests,
      biometrics,
      loginAs,
      logout,
      setCurrentUser,
      handleAddMember,
      handleSubscribePackage,
      handleCheckIn,
      handleCheckInDropIn,
      handleAddSession,
      handleUpdateSessionStatus,
      handleAddBiometrics,
      handleCreateReversal,
      handleApproveReversal,
      handleAddPackage,
      handleDeletePackage,
      handleAddLead,
      getMemberBiometrics,
      handleBookGroupClass,
      handleCancelGroupClassBooking,
      handleCheckInGroupClassBooking,
      handleSaveGroupClass,
      handleDeleteGroupClass,
      handleSaveStaff,
      handleDeleteStaff,
      handleUpdateStaffShift,
      handleRequestSchedule,
      handleApproveScheduleRequest,
      handleRejectScheduleRequest,
      handleCancelScheduleRequest,
      detectPtConflict
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
