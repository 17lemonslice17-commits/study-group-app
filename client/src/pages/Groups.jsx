import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    const name = newGroupName.trim();
    if (!name) return;

    try {
      await api.post('/groups', { name });
      setNewGroupName('');
      await fetchGroups();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
      console.error('모임 생성 실패:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>내 모임 목록</h2>
        <button onClick={handleLogout}>로그아웃</button>
      </div>

      <form onSubmit={handleCreate} style={{ margin: '20px 0' }}>
        <input
          placeholder="새 모임 이름"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button type="submit">모임 만들기</button>
      </form>

      <ul>
        {groups.map((g) => (
          <li key={g.id}>
            <Link to={`/groups/${g.id}`}>
              {g.name}
            </Link>{' '}
            ({g.role}) — 초대코드: {g.invite_code}
          </li>
        ))}
      </ul>

      {groups.length === 0 && <p>아직 소속된 모임이 없습니다.</p>}
    </div>
  );
}

