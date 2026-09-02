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
    <div style={{ maxWidth: 320, margin: '60px auto' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
        <input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <input placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} /><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">가입하기</button>
      </form>
      <p>이미 계정이 있나요? <Link to="/login">로그인</Link></p>
    </div>
  );
}
