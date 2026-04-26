import axios from 'axios';

const api = axios.create({
  baseURL: 'https://chatterbox-backend-4v4p.onrender.com',
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('chatUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
