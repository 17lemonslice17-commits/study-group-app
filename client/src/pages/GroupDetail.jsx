import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function GroupDetail() {
  const { groupId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');

  const fetchSchedules = async () => {
    const res = await api.get(`/groups/${groupId}/schedules`);
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, [groupId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    await api.post(`/groups/${groupId}/schedules`, { title, start_at: startAt });
    setTitle('');
    setStartAt('');
    fetchSchedules();
  };

  const handleToggleAttendance = async (scheduleId) => {
    await api.post(`/schedules/${scheduleId}/attendance`);
    fetchSchedules();
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto' }}>
      <Link to="/groups">← 모임 목록으로</Link>
      <h2>일정</h2>

      <form onSubmit={handleAdd} style={{ margin: '20px 0' }}>
        <input
          placeholder="일정 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /><br />
        <input
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        /><br />
        <button type="submit">일정 등록</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {schedules.map((s) => (
          <li key={s.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8 }}>
            <strong>{s.title}</strong><br />
            {new Date(s.start_at).toLocaleString()}<br />
            참석 {s.attendee_count}명
            <button onClick={() => handleToggleAttendance(s.id)} style={{ marginLeft: 10 }}>
              {s.my_attendance ? '✓ 참석함' : '참석 체크'}
            </button>
          </li>
        ))}
      </ul>
      {schedules.length === 0 && <p>등록된 일정이 없습니다.</p>}
    </div>
  );
}
