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
    <div style={{ maxWidth: 320, margin: '60px auto' }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
        <input placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">로그인</button>
      </form>
      <p>계정이 없나요? <Link to="/signup">회원가입</Link></p>
    </div>
  );
}
