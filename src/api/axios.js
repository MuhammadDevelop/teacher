import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy ishlatayotganingiz uchun
});

// HAR QANDAY SO'ROV KETISHDAN OLDIN TOKENNI QO'SHISH
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend kutayotgan formatda tokenni yuboramiz
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AGAR TOKEN ESKIRGAN BO'LSA (401), AVTOMATIK LOGIN'GA QAYTARISH
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Noto'g'ri tokenni o'chirish
      window.location.href = '/login'; // Login sahifasiga haydash
    }
    return Promise.reject(error);
  }
);

export default api;