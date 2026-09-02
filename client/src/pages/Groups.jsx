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
      console.error('모임 생성 실패:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">내 모임 목록</h2>
          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-800">
            로그아웃
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="새 모임 이름"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            만들기
          </button>
        </form>

        <div className="space-y-2">
          {groups.map((g) => (
            <Link
              to={`/groups/${g.id}`}
              key={g.id}
              className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{g.name}</span>
                <span className="text-xs text-slate-400">{g.role}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">초대코드: {g.invite_code}</p>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-10">아직 소속된 모임이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
