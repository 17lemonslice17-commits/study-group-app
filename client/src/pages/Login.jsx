import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('nickname', res.data.user.nickname);
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">로그인</h2>
        <p className="text-sm text-slate-500 mb-6">모임장에 오신 걸 환영합니다</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            로그인
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          계정이 없나요?{' '}
          <Link to="/signup" className="text-indigo-600 font-medium">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
