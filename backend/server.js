import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to map snake_case database rows to camelCase frontend objects
const mapRow = (row, mapping) => {
  if (!row) return null;
  const newObj = { ...row };
  for (const [dbCol, jsProp] of Object.entries(mapping)) {
    if (row[dbCol] !== undefined) {
      newObj[jsProp] = row[dbCol];
      delete newObj[dbCol];
    }
  }
  return newObj;
};

const mapRows = (rows, mapping) => rows.map(r => mapRow(r, mapping));

// Helper function to map camelCase fields back to snake_case for DB inserts/updates
const mapToDb = (obj, mapping) => {
  const newObj = { ...obj };
  for (const [dbCol, jsProp] of Object.entries(mapping)) {
    if (obj[jsProp] !== undefined) {
      newObj[dbCol] = obj[jsProp];
      delete newObj[jsProp];
    }
  }
  return newObj;
};

// Column mappings
const memberMapping = { qr_code: 'qrCode', join_date: 'joinDate', password_hash: 'password' };
const packageMapping = { duration_months: 'durationMonths' };
const staffMapping = { password_hash: 'password' };
const memberPackageMapping = { member_id: 'memberId', package_id: 'packageId', start_date: 'startDate', end_date: 'endDate', remaining_sessions: 'remainingSessions' };
const checkInMapping = { member_id: 'memberId', guest_name: 'guestName', guest_phone: 'guestPhone' };
const sessionMapping = { member_id: 'memberId', pt_id: 'ptId', date_time: 'dateTime', booking_type: 'bookingType', schedule_request_id: 'scheduleRequestId' };
const biometricMapping = { member_id: 'memberId', body_fat: 'bodyFat', muscle_mass: 'muscleMass' };
const transactionMapping = { member_id: 'memberId', guest_details: 'guestDetails', package_name: 'packageName', payment_method: 'paymentMethod' };
const reversalMapping = { transaction_id: 'transactionId' };
const groupClassMapping = { class_name: 'className', trainer_id: 'trainerId', day_of_week: 'dayOfWeek', max_capacity: 'maxCapacity' };
const groupClassBookingMapping = { member_id: 'memberId', class_id: 'classId' };
const scheduleRequestMapping = { member_id: 'memberId', pt_id: 'ptId', member_package_id: 'memberPackageId', days_of_week: 'daysOfWeek', time_slot: 'timeSlot', sessions_per_week: 'sessionsPerWeek', pt_note: 'ptNote', created_at: 'createdAt' };

// Initialize helper tables (e.g., schedule_requests and schedule_request_id on sessions if not exists)
const initDb = async () => {
  try {
    // Check if schedule_requests table exists, if not, create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedule_requests (
        id VARCHAR(20) PRIMARY KEY,
        member_id VARCHAR(20) REFERENCES members(id) ON DELETE CASCADE,
        pt_id VARCHAR(20) REFERENCES staff(id) ON DELETE RESTRICT,
        member_package_id VARCHAR(20) REFERENCES member_packages(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL DEFAULT 'fixed',
        days_of_week TEXT[] NOT NULL,
        time_slot VARCHAR(10) NOT NULL,
        sessions_per_week INT NOT NULL DEFAULT 1,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        pt_note TEXT DEFAULT '',
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);
    
    // Add schedule_request_id column to sessions if it does not exist
    await pool.query(`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS schedule_request_id VARCHAR(20) REFERENCES schedule_requests(id) ON DELETE SET NULL;
    `);
    
    console.log('Database initialization completed.');
  } catch (err) {
    console.error('Error initializing database helper structures:', err);
  }
};

initDb();

// --- API ROUTES ---

// 1. GET ALL STATE (Helper endpoint equivalent to mockDb.get() to synchronize react state on startup)
app.get('/api/db-state', async (req, res) => {
  try {
    const membersRes = await pool.query('SELECT * FROM members');
    const packagesRes = await pool.query('SELECT * FROM packages');
    const memberPackagesRes = await pool.query('SELECT * FROM member_packages');
    const staffRes = await pool.query('SELECT * FROM staff');
    const checkInsRes = await pool.query('SELECT * FROM check_ins ORDER BY timestamp DESC');
    const sessionsRes = await pool.query('SELECT * FROM sessions');
    const biometricsRes = await pool.query('SELECT * FROM biometrics');
    const transactionsRes = await pool.query('SELECT * FROM transactions ORDER BY timestamp DESC');
    const reversalsRes = await pool.query('SELECT * FROM reversals ORDER BY timestamp DESC');
    const groupClassesRes = await pool.query('SELECT * FROM group_classes');
    const groupClassBookingsRes = await pool.query('SELECT * FROM group_class_bookings');
    const leadsRes = await pool.query('SELECT * FROM leads ORDER BY date DESC');
    const scheduleRequestsRes = await pool.query('SELECT * FROM schedule_requests ORDER BY created_at DESC');

    const mappedMembers = mapRows(membersRes.rows, memberMapping);
    const mappedPackages = mapRows(packagesRes.rows, packageMapping);
    const mappedMemberPackages = mapRows(memberPackagesRes.rows, memberPackageMapping);
    const mappedStaff = mapRows(staffRes.rows, staffMapping);
    
    // Filter pts out of staff table
    const mappedPts = mappedStaff.filter(s => s.role === 'pt');
    const mappedStaffNonPt = mappedStaff.filter(s => s.role !== 'pt');

    // Convert decimal columns in transactions and packages to numbers
    const processedPackages = mappedPackages.map(p => ({ ...p, price: parseFloat(p.price) }));
    const processedTransactions = mapRows(transactionsRes.rows, transactionMapping).map(t => {
      // Map guestDetails back if stored as JSON/text
      let guestDetails = t.guestDetails;
      if (typeof guestDetails === 'string') {
        try { guestDetails = JSON.parse(guestDetails); } catch(e) {}
      }
      // Map memberName from guest_details or guest_phone
      let memberName = t.memberName;
      if (t.memberId === 'DROP-IN' && guestDetails) {
        memberName = `Khách vãng lai: ${guestDetails.name || ''} (${guestDetails.phone || ''})`;
      } else {
        const m = mappedMembers.find(mem => mem.id === t.memberId);
        memberName = m ? m.name : 'Hội viên';
      }
      return {
        ...t,
        amount: parseFloat(t.amount),
        guestDetails,
        memberName
      };
    });

    const processedCheckIns = mapRows(checkInsRes.rows, checkInMapping).map(c => {
      let guestDetails = undefined;
      if (c.memberId === 'DROP-IN') {
        guestDetails = { name: c.guestName, phone: c.guestPhone };
      }
      return { ...c, guestDetails };
    });

    res.json({
      members: mappedMembers,
      packages: processedPackages,
      memberPackages: mappedMemberPackages,
      pts: mappedPts,
      checkIns: processedCheckIns,
      sessions: mapRows(sessionsRes.rows, sessionMapping),
      biometrics: mapRows(biometricsRes.rows, biometricMapping).map(b => ({
        ...b,
        weight: parseFloat(b.weight),
        bodyFat: b.bodyFat ? parseFloat(b.bodyFat) : null,
        muscleMass: b.muscleMass ? parseFloat(b.muscleMass) : null,
        waist: b.waist ? parseFloat(b.waist) : null
      })),
      transactions: processedTransactions,
      reversals: mapRows(reversalsRes.rows, reversalMapping).map(r => ({ ...r, amount: parseFloat(r.amount) })),
      groupClasses: mapRows(groupClassesRes.rows, groupClassMapping).map(gc => {
        // Calculate enrolled dynamically
        const enrolled = groupClassBookingsRes.rows.filter(b => b.class_id === gc.id).length;
        return {
          ...gc,
          maxCapacity: parseInt(gc.maxCapacity, 10),
          currentEnrolled: enrolled
        };
      }),
      groupClassBookings: mapRows(groupClassBookingsRes.rows, groupClassBookingMapping),
      staff: mappedStaff,
      leads: leadsRes.rows,
      scheduleRequests: mapRows(scheduleRequestsRes.rows, scheduleRequestMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Database connection error');
  }
});

// 2. MEMBER OPERATIONS
app.post('/api/members', async (req, res) => {
  const { name, phone, email, cccd, password } = req.body;
  try {
    // Check if phone or cccd exists
    const checkExists = await pool.query('SELECT id FROM members WHERE phone = $1 OR cccd = $2', [phone, cccd]);
    if (checkExists.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number or CCCD already exists' });
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM members');
    const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
    const newId = `MB-${String(nextNum).padStart(3, '0')}`;
    const qrCode = `QR_MB_${String(nextNum).padStart(3, '0')}`;

    const insertRes = await pool.query(
      'INSERT INTO members (id, name, phone, email, qr_code, cccd, status, join_date, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8) RETURNING *',
      [newId, name, phone, email, qrCode, cccd, 'active', password || 'GMS@1234']
    );
    res.json(mapRow(insertRes.rows[0], memberMapping));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. PACKAGE OPERATIONS
app.post('/api/packages', async (req, res) => {
  const { id, name, type, price, durationMonths, sessions } = req.body;
  try {
    if (id) {
      // Update
      const updateRes = await pool.query(
        'UPDATE packages SET name = $1, type = $2, price = $3, duration_months = $4, sessions = $5 WHERE id = $6 RETURNING *',
        [name, type, price, durationMonths, sessions, id]
      );
      return res.json(mapRow(updateRes.rows[0], packageMapping));
    } else {
      // Create
      const countRes = await pool.query('SELECT COUNT(*) FROM packages');
      const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
      const newId = type === 'pt' ? `PKG-PT${sessions || 10}` : `PKG-${String(nextNum).padStart(3, '0')}`;
      
      const insertRes = await pool.query(
        'INSERT INTO packages (id, name, type, price, duration_months, sessions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [newId, name, type, price, durationMonths, sessions]
      );
      res.json(mapRow(insertRes.rows[0], packageMapping));
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM packages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Cannot delete package. It is referenced by active subscriptions.' });
  }
});

// 4. SUBSCRIBE PACKAGE
app.post('/api/subscriptions', async (req, res) => {
  const { memberId, packageId, paymentMethod } = req.body;
  try {
    const pkgQuery = await pool.query('SELECT * FROM packages WHERE id = $1', [packageId]);
    const memQuery = await pool.query('SELECT * FROM members WHERE id = $1', [memberId]);
    
    if (pkgQuery.rows.length === 0 || memQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Member or Package not found' });
    }
    const pkg = pkgQuery.rows[0];
    const member = memQuery.rows[0];

    // Find same type active subscriptions to stack dates
    const activeSubs = await pool.query(
      `SELECT mp.* FROM member_packages mp 
       JOIN packages p ON mp.package_id = p.id
       WHERE mp.member_id = $1 AND mp.status = 'active' AND p.type = $2`, 
      [memberId, pkg.type]
    );

    let startDate = new Date();
    if (activeSubs.rows.length > 0) {
      const existingEnd = new Date(activeSubs.rows[0].end_date);
      if (existingEnd >= new Date()) {
        startDate = new Date(existingEnd.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + parseInt(pkg.duration_months, 10));

    const countSubs = await pool.query('SELECT COUNT(*) FROM member_packages');
    const subId = `MP-${String(parseInt(countSubs.rows[0].count, 10) + 1).padStart(3, '0')}`;

    // Insert Sub
    const subRes = await pool.query(
      'INSERT INTO member_packages (id, member_id, package_id, start_date, end_date, remaining_sessions, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [subId, memberId, packageId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], pkg.type === 'pt' ? pkg.sessions : null, 'active']
    );

    // Insert Transaction
    const countTx = await pool.query('SELECT COUNT(*) FROM transactions');
    const txId = `TX-${String(parseInt(countTx.rows[0].count, 10) + 1).padStart(3, '0')}`;
    const txRes = await pool.query(
      'INSERT INTO transactions (id, member_id, package_name, amount, type, payment_method, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7) RETURNING *',
      [txId, memberId, pkg.name, pkg.price, 'sale', paymentMethod, 'completed']
    );

    // Update Member Status
    await pool.query("UPDATE members SET status = 'active' WHERE id = $1", [memberId]);

    res.json({
      subscription: mapRow(subRes.rows[0], memberPackageMapping),
      transaction: mapRow(txRes.rows[0], transactionMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. CHECK-IN
app.post('/api/checkins', async (req, res) => {
  const { memberId, type } = req.body;
  try {
    const memQuery = await pool.query('SELECT * FROM members WHERE id = $1', [memberId]);
    if (memQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hội viên!' });
    }
    const member = mapRow(memQuery.rows[0], memberMapping);

    const activeSubs = await pool.query(
      "SELECT * FROM member_packages WHERE member_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE",
      [memberId]
    );

    if (activeSubs.rows.length === 0) {
      return res.json({ success: false, message: 'Hội viên không có gói tập hoạt động hoặc gói tập đã hết hạn!', member });
    }

    const countCheckins = await pool.query('SELECT COUNT(*) FROM check_ins');
    const newId = `CI-${String(parseInt(countCheckins.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const checkinRes = await pool.query(
      'INSERT INTO check_ins (id, member_id, timestamp, type) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING *',
      [newId, memberId, type || 'auto']
    );

    res.json({
      success: true,
      message: 'Check-in thành công!',
      member,
      checkIn: mapRow(checkinRes.rows[0], checkInMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. CHECK-IN DROP-IN
app.post('/api/checkins/dropin', async (req, res) => {
  const { name, phone, fee, paymentMethod } = req.body;
  try {
    const countTx = await pool.query('SELECT COUNT(*) FROM transactions');
    const txId = `TX-${String(parseInt(countTx.rows[0].count, 10) + 1).padStart(3, '0')}`;
    
    const guestDetails = JSON.stringify({ name, phone });

    const txRes = await pool.query(
      'INSERT INTO transactions (id, member_id, guest_details, package_name, amount, type, payment_method, timestamp, status) VALUES ($1, NULL, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7) RETURNING *',
      [txId, guestDetails, 'Vé tập đơn lẻ (Drop-in)', fee, 'dropin', paymentMethod, 'completed']
    );

    const countCheckins = await pool.query('SELECT COUNT(*) FROM check_ins');
    const ciId = `CI-${String(parseInt(countCheckins.rows[0].count, 10) + 1).padStart(3, '0')}`;
    const checkinRes = await pool.query(
      'INSERT INTO check_ins (id, member_id, timestamp, type, guest_name, guest_phone) VALUES ($1, NULL, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING *',
      [ciId, 'dropin', name, phone]
    );

    res.json({
      success: true,
      transaction: mapRow(txRes.rows[0], transactionMapping),
      checkIn: mapRow(checkinRes.rows[0], checkInMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 7. PT SESSIONS
app.post('/api/sessions', async (req, res) => {
  const { memberId, ptId, dateTime, bookingType } = req.body;
  try {
    // Check if member has remaining pt sessions
    const subQuery = await pool.query(
      "SELECT mp.* FROM member_packages mp JOIN packages p ON mp.package_id = p.id WHERE mp.member_id = $1 AND mp.status = 'active' AND p.type = 'pt' AND mp.remaining_sessions > 0",
      [memberId]
    );

    if (subQuery.rows.length === 0) {
      return res.json({ success: false, message: 'Hội viên không có gói tập PT hoạt động hoặc đã hết số buổi!' });
    }

    const countSessions = await pool.query('SELECT COUNT(*) FROM sessions');
    const newId = `SS-${String(parseInt(countSessions.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const sessionRes = await pool.query(
      'INSERT INTO sessions (id, member_id, pt_id, date_time, status, booking_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newId, memberId, ptId, dateTime, 'pending', bookingType || 'ondemand']
    );

    res.json({
      success: true,
      session: mapRow(sessionRes.rows[0], sessionMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sessions/:id/status', async (req, res) => {
  const { status } = req.body;
  const sessionId = req.params.id;
  try {
    const sessionQuery = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (sessionQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy buổi tập!' });
    }
    const session = sessionQuery.rows[0];

    // Update status
    const updateRes = await pool.query(
      'UPDATE sessions SET status = $1 WHERE id = $2 RETURNING *',
      [status, sessionId]
    );

    // If status is completed, decrement remaining sessions on PT package
    if (status === 'completed') {
      const activePtSub = await pool.query(
        "SELECT mp.* FROM member_packages mp JOIN packages p ON mp.package_id = p.id WHERE mp.member_id = $1 AND mp.status = 'active' AND p.type = 'pt' AND mp.remaining_sessions > 0 ORDER BY mp.end_date ASC LIMIT 1",
        [session.member_id]
      );
      if (activePtSub.rows.length > 0) {
        const sub = activePtSub.rows[0];
        const nextRem = sub.remaining_sessions - 1;
        const nextStatus = nextRem === 0 ? 'expired' : 'active';
        await pool.query(
          'UPDATE member_packages SET remaining_sessions = $1, status = $2 WHERE id = $3',
          [nextRem, nextStatus, sub.id]
        );
      }
    }

    res.json({
      success: true,
      session: mapRow(updateRes.rows[0], sessionMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 8. BIOMETRICS
app.get('/api/biometrics/:memberId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM biometrics WHERE member_id = $1 ORDER BY date ASC',
      [req.params.memberId]
    );
    res.json(mapRows(result.rows, biometricMapping).map(b => ({
      ...b,
      weight: parseFloat(b.weight),
      bodyFat: b.bodyFat ? parseFloat(b.bodyFat) : null,
      muscleMass: b.muscleMass ? parseFloat(b.muscleMass) : null,
      waist: b.waist ? parseFloat(b.waist) : null
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/biometrics', async (req, res) => {
  const { memberId, weight, bodyFat, muscleMass, waist } = req.body;
  try {
    const countBio = await pool.query('SELECT COUNT(*) FROM biometrics');
    const newId = `BM-${String(parseInt(countBio.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const insertRes = await pool.query(
      'INSERT INTO biometrics (id, member_id, date, weight, body_fat, muscle_mass, waist) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6) RETURNING *',
      [newId, memberId, weight, bodyFat, muscleMass, waist]
    );
    
    res.json(mapRow(insertRes.rows[0], biometricMapping));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 9. REVERSALS
app.post('/api/reversals', async (req, res) => {
  const { transactionId, reason } = req.body;
  try {
    const txQuery = await pool.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (txQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch!' });
    }
    const tx = txQuery.rows[0];

    if (tx.status === 'reversed') {
      return res.json({ success: false, message: 'Giao dịch đã được đảo rồi!' });
    }

    const checkPending = await pool.query(
      "SELECT id FROM reversals WHERE transaction_id = $1 AND status = 'pending'",
      [transactionId]
    );
    if (checkPending.rows.length > 0) {
      return res.json({ success: false, message: 'Giao dịch đang chờ duyệt đảo!' });
    }

    const countRev = await pool.query('SELECT COUNT(*) FROM reversals');
    const newId = `RV-${String(parseInt(countRev.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const insertRes = await pool.query(
      'INSERT INTO reversals (id, transaction_id, amount, reason, status, timestamp) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [newId, transactionId, tx.amount, reason, 'pending']
    );

    res.json({
      success: true,
      reversal: mapRow(insertRes.rows[0], reversalMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reversals/:id/approve', async (req, res) => {
  const { action } = req.body; // 'approved' or 'rejected'
  const reversalId = req.params.id;
  try {
    const revQuery = await pool.query('SELECT * FROM reversals WHERE id = $1', [reversalId]);
    if (revQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Yêu cầu đảo không tồn tại!' });
    }
    const rev = revQuery.rows[0];

    const updateRes = await pool.query(
      'UPDATE reversals SET status = $1 WHERE id = $2 RETURNING *',
      [action, reversalId]
    );

    if (action === 'approved') {
      // Set transaction status to reversed
      await pool.query("UPDATE transactions SET status = 'reversed' WHERE id = $1", [rev.transaction_id]);

      // Get transaction detail to cancel subscription
      const txQuery = await pool.query('SELECT * FROM transactions WHERE id = $1', [rev.transaction_id]);
      if (txQuery.rows.length > 0 && txQuery.rows[0].member_id) {
        const memberId = txQuery.rows[0].member_id;
        // Cancel the latest package of the member
        const latestSub = await pool.query(
          'SELECT id FROM member_packages WHERE member_id = $1 ORDER BY start_date DESC LIMIT 1',
          [memberId]
        );
        if (latestSub.rows.length > 0) {
          await pool.query(
            "UPDATE member_packages SET status = 'cancelled' WHERE id = $1",
            [latestSub.rows[0].id]
          );
        }
      }
    }

    res.json({
      success: true,
      reversal: mapRow(updateRes.rows[0], reversalMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 10. LEADS
app.post('/api/leads', async (req, res) => {
  const { name, phone, email, note } = req.body;
  try {
    const countLeads = await pool.query('SELECT COUNT(*) FROM leads');
    const newId = `LD-${String(parseInt(countLeads.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const insertRes = await pool.query(
      'INSERT INTO leads (id, name, phone, email, note, date) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *',
      [newId, name, phone, email, note]
    );
    res.json(insertRes.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 11. STAFF OPERATIONS
app.post('/api/staff', async (req, res) => {
  const { id, name, email, phone, role, password, specialty, shift } = req.body;
  try {
    if (id) {
      const updateRes = await pool.query(
        'UPDATE staff SET name = $1, email = $2, phone = $3, role = $4, password_hash = $5, specialty = $6, shift = $7 WHERE id = $8 RETURNING *',
        [name, email, phone, role, password || 'GMS@1234', specialty, shift, id]
      );
      res.json(mapRow(updateRes.rows[0], staffMapping));
    } else {
      const countStaff = await pool.query('SELECT COUNT(*) FROM staff');
      const nextNum = parseInt(countStaff.rows[0].count, 10) + 1;
      
      let prefix = 'ST';
      if (role === 'admin') prefix = 'AD';
      if (role === 'pt') prefix = 'PT';
      
      const newId = `${prefix}-${String(nextNum).padStart(3, '0')}`;

      const insertRes = await pool.query(
        'INSERT INTO staff (id, name, email, phone, role, password_hash, specialty, shift) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [newId, name, email, phone, role, password || 'GMS@1234', specialty || null, shift || 'Ca Sáng (06:00 - 14:00)']
      );
      res.json(mapRow(insertRes.rows[0], staffMapping));
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Cannot delete staff. There are active assignments/bookings under this staff member.' });
  }
});

app.put('/api/staff/:id/shift', async (req, res) => {
  const { shift } = req.body;
  try {
    const updateRes = await pool.query(
      'UPDATE staff SET shift = $1 WHERE id = $2 RETURNING *',
      [shift, req.params.id]
    );
    res.json(mapRow(updateRes.rows[0], staffMapping));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 12. GROUP CLASSES
app.post('/api/group-classes', async (req, res) => {
  const { id, className, trainerId, dayOfWeek, time, maxCapacity } = req.body;
  try {
    if (id) {
      const updateRes = await pool.query(
        'UPDATE group_classes SET class_name = $1, trainer_id = $2, day_of_week = $3, time = $4, max_capacity = $5 WHERE id = $6 RETURNING *',
        [className, trainerId, dayOfWeek, time, maxCapacity, id]
      );
      res.json(mapRow(updateRes.rows[0], groupClassMapping));
    } else {
      const countClasses = await pool.query('SELECT COUNT(*) FROM group_classes');
      const newId = `GC-${String(parseInt(countClasses.rows[0].count, 10) + 1).padStart(3, '0')}`;

      const insertRes = await pool.query(
        'INSERT INTO group_classes (id, class_name, trainer_id, day_of_week, time, max_capacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [newId, className, trainerId, dayOfWeek, time, maxCapacity]
      );
      res.json(mapRow(insertRes.rows[0], groupClassMapping));
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/group-classes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM group_class_bookings WHERE class_id = $1', [req.params.id]);
    await pool.query('DELETE FROM group_classes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/group-classes/bookings', async (req, res) => {
  const { memberId, classId, date } = req.body;
  try {
    const clsQuery = await pool.query('SELECT * FROM group_classes WHERE id = $1', [classId]);
    if (clsQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học!' });
    }
    const gc = clsQuery.rows[0];

    // Check capacity
    const countBookings = await pool.query(
      'SELECT COUNT(*) FROM group_class_bookings WHERE class_id = $1 AND date = $2',
      [classId, date]
    );
    if (parseInt(countBookings.rows[0].count, 10) >= gc.max_capacity) {
      return res.json({ success: false, message: 'Lớp học đã đủ số lượng học viên đăng ký!' });
    }

    // Check duplicate
    const checkDup = await pool.query(
      'SELECT id FROM group_class_bookings WHERE member_id = $1 AND class_id = $2 AND date = $3',
      [memberId, classId, date]
    );
    if (checkDup.rows.length > 0) {
      return res.json({ success: false, message: 'Hội viên đã đăng ký lớp học này trong ngày này rồi!' });
    }

    // Check active packages (either VIP PKG-003 or package name matching class name)
    const activeSubs = await pool.query(
      `SELECT mp.*, p.name as package_name, p.id as package_id FROM member_packages mp 
       JOIN packages p ON mp.package_id = p.id
       WHERE mp.member_id = $1 AND mp.status = 'active' AND mp.end_date >= CURRENT_DATE`,
      [memberId]
    );

    const classNameLower = gc.class_name.toLowerCase();
    const hasValidSub = activeSubs.rows.some(sub => {
      if (sub.package_id === 'PKG-003') return true; // VIP
      const pkgNameLower = sub.package_name.toLowerCase();
      if (classNameLower.includes('yoga') && pkgNameLower.includes('yoga')) return true;
      if (classNameLower.includes('zumba') && pkgNameLower.includes('zumba')) return true;
      if (classNameLower.includes('bơi') && pkgNameLower.includes('bơi')) return true;
      return false;
    });

    if (!hasValidSub) {
      return res.json({ success: false, message: 'Hội viên không có gói tập lớp học tương ứng (Yoga/Zumba/Bơi) hoặc gói tập đã hết hạn!' });
    }

    const countAllBookings = await pool.query('SELECT COUNT(*) FROM group_class_bookings');
    const newId = `GB-${String(parseInt(countAllBookings.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const insertRes = await pool.query(
      "INSERT INTO group_class_bookings (id, member_id, class_id, date, status) VALUES ($1, $2, $3, $4, 'booked') RETURNING *",
      [newId, memberId, classId, date]
    );

    res.json({
      success: true,
      booking: mapRow(insertRes.rows[0], groupClassBookingMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/group-classes/bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM group_class_bookings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/group-classes/bookings/:id/checkin', async (req, res) => {
  try {
    const updateRes = await pool.query(
      "UPDATE group_class_bookings SET status = 'attended' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json({
      success: true,
      booking: mapRow(updateRes.rows[0], groupClassBookingMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 13. SCHEDULE REQUESTS
app.post('/api/schedule-requests', async (req, res) => {
  const { memberId, ptId, memberPackageId, type, daysOfWeek, timeSlot, sessionsPerWeek } = req.body;
  try {
    // Check duplication of pending request
    const checkQuery = await pool.query(
      "SELECT id FROM schedule_requests WHERE member_id = $1 AND member_package_id = $2 AND status = 'pending'",
      [memberId, memberPackageId]
    );
    if (checkQuery.rows.length > 0) {
      return res.json({ success: false, message: 'Bạn đã có yêu cầu lịch đang chờ duyệt cho gói này!' });
    }

    const countReq = await pool.query('SELECT COUNT(*) FROM schedule_requests');
    const newId = `SR-${String(parseInt(countReq.rows[0].count, 10) + 1).padStart(3, '0')}`;

    const insertRes = await pool.query(
      'INSERT INTO schedule_requests (id, member_id, pt_id, member_package_id, type, days_of_week, time_slot, sessions_per_week, status, pt_note, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE) RETURNING *',
      [newId, memberId, ptId, memberPackageId, type || 'fixed', daysOfWeek || [], timeSlot || '07:00', sessionsPerWeek || 1, 'pending', '']
    );

    res.json({
      success: true,
      request: mapRow(insertRes.rows[0], scheduleRequestMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/schedule-requests/:id/approve', async (req, res) => {
  const { ptNote } = req.body;
  const requestId = req.params.id;
  try {
    const reqQuery = await pool.query('SELECT * FROM schedule_requests WHERE id = $1', [requestId]);
    if (reqQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu lịch!' });
    }
    const request = reqQuery.rows[0];

    if (request.status !== 'pending') {
      return res.json({ success: false, message: 'Yêu cầu này đã được xử lý!' });
    }

    // Update status to approved
    const updateRes = await pool.query(
      "UPDATE schedule_requests SET status = 'approved', pt_note = $1 WHERE id = $2 RETURNING *",
      [ptNote || '', requestId]
    );

    // Generate sessions dynamically into sessions table
    const mpQuery = await pool.query('SELECT * FROM member_packages WHERE id = $1', [request.member_package_id]);
    const mp = mpQuery.rows[0];
    const totalSessions = mp ? mp.remaining_sessions : 10;

    const dayMap = { 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Chủ Nhật': 0 };
    const sortedDays = [...request.days_of_week].sort((a, b) => (dayMap[a] || 0) - (dayMap[b] || 0));
    const [hh, mm] = request.time_slot.split(':').map(Number);

    const getNextDate = (targetDow) => {
      const today = new Date();
      const todayDow = today.getDay();
      const target = dayMap[targetDow] !== undefined ? dayMap[targetDow] : 1;
      let diff = target - todayDow;
      if (diff <= 0) diff += 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      next.setHours(hh, mm, 0, 0);
      return next;
    };

    let sessionCount = 0;
    let currentBaseDate = new Date();

    while (sessionCount < totalSessions) {
      for (const targetDay of sortedDays) {
        if (sessionCount >= totalSessions) break;
        
        // Find next date starting from current base date
        const target = dayMap[targetDay] !== undefined ? dayMap[targetDay] : 1;
        let diff = target - currentBaseDate.getDay();
        if (diff < 0) diff += 7;
        if (diff === 0 && sessionCount > 0) diff += 7; // force next week if already did this day
        
        const sessionDate = new Date(currentBaseDate);
        sessionDate.setDate(currentBaseDate.getDate() + diff);
        sessionDate.setHours(hh, mm, 0, 0);

        const countSes = await pool.query('SELECT COUNT(*) FROM sessions');
        const sId = `SS-${String(parseInt(countSes.rows[0].count, 10) + 1).padStart(3, '0')}`;

        await pool.query(
          'INSERT INTO sessions (id, member_id, pt_id, date_time, status, booking_type, schedule_request_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [sId, request.member_id, request.pt_id, sessionDate.toISOString(), 'confirmed', 'fixed', requestId]
        );
        
        sessionCount++;
        // Update base date to advance
        currentBaseDate = sessionDate;
      }
      // Increment base date to next week if we finish a cycle
      currentBaseDate.setDate(currentBaseDate.getDate() + 1);
    }

    res.json({
      success: true,
      request: mapRow(updateRes.rows[0], scheduleRequestMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/schedule-requests/:id/reject', async (req, res) => {
  const { ptNote } = req.body;
  try {
    const updateRes = await pool.query(
      "UPDATE schedule_requests SET status = 'rejected', pt_note = $1 WHERE id = $2 RETURNING *",
      [ptNote || '', req.params.id]
    );
    res.json({
      success: true,
      request: mapRow(updateRes.rows[0], scheduleRequestMapping)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedule-requests/:id', async (req, res) => {
  try {
    // Delete fixed sessions generated under this request that are still confirmed/pending
    await pool.query(
      "DELETE FROM sessions WHERE schedule_request_id = $1 AND status IN ('pending', 'confirmed')",
      [req.params.id]
    );
    await pool.query('DELETE FROM schedule_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`GMS Backend Server running on port ${PORT}`);
});
