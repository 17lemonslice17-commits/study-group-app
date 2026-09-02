import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// 로그인 후 저장해둔 토큰을 모든 요청에 자동으로 붙여줌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
