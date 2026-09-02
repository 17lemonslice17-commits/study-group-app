const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 서버 살아있는지 확인용
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 회원가입
app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname',
      [email, password_hash, nickname]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 모임 생성 (로그인 필요)
app.post('/api/groups', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '모임 이름을 입력해주세요.' });
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupResult = await client.query(
      'INSERT INTO groups (name, owner_id, invite_code) VALUES ($1, $2, $3) RETURNING *',
      [name, req.user.id, inviteCode]
    );
    const group = groupResult.rows[0];

    await client.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [group.id, req.user.id, 'owner']
    );

    await client.query('COMMIT');
    res.status(201).json(group);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  } finally {
    client.release();
  }
});

// 내가 속한 모임 목록 조회 (로그인 필요)
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, gm.role
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 특정 모임의 일정 목록 조회
app.get('/api/groups/:groupId/schedules', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM attendance a WHERE a.schedule_id = s.id AND a.checked = true) AS attendee_count,
        EXISTS(SELECT 1 FROM attendance a WHERE a.schedule_id = s.id AND a.user_id = $2 AND a.checked = true) AS my_attendance
       FROM schedules s
       WHERE s.group_id = $1
       ORDER BY s.start_at ASC`,
      [groupId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 일정 등록
app.post('/api/groups/:groupId/schedules', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { title, start_at } = req.body;

  if (!title || !start_at) {
    return res.status(400).json({ error: '제목과 일시를 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO schedules (group_id, title, start_at) VALUES ($1, $2, $3) RETURNING *',
      [groupId, title, start_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 출석 체크 토글 (체크되어 있으면 해제, 아니면 체크)
app.post('/api/schedules/:scheduleId/attendance', authenticateToken, async (req, res) => {
  const { scheduleId } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE schedule_id = $1 AND user_id = $2',
      [scheduleId, req.user.id]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO attendance (schedule_id, user_id, checked) VALUES ($1, $2, true)',
        [scheduleId, req.user.id]
      );
    } else {
      await pool.query(
        'UPDATE attendance SET checked = NOT checked WHERE schedule_id = $1 AND user_id = $2',
        [scheduleId, req.user.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
