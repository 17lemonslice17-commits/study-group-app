
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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link to="/groups" className="text-sm text-slate-500 hover:text-slate-800">
          ← 모임 목록으로
        </Link>
        <h2 className="text-xl font-semibold text-slate-900 mt-2 mb-6">일정</h2>

        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-4 mb-6 space-y-2">
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            일정 등록
          </button>
        </form>

        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500">{new Date(s.start_at).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">참석 {s.attendee_count}명</p>
              </div>
              <button
                onClick={() => handleToggleAttendance(s.id)}
                className={`text-xs font-medium rounded-full px-3 py-1.5 transition ${
                  s.my_attendance
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.my_attendance ? '✓ 참석함' : '참석 체크'}
              </button>
            </div>
          ))}
        </div>

        {schedules.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-10">등록된 일정이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
