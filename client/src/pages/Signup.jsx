import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/signup', { email, password, nickname });
      alert('회원가입 완료! 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">회원가입</h2>
        <p className="text-sm text-slate-500 mb-6">스터디 모임을 만들고 관리해보세요</p>

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
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            가입하기
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="text-indigo-600 font-medium">로그인</Link>
        </p>
      </div>
    </div>
  );
}
