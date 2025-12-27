import axios from 'axios';

const api = axios.create({
  // Oxiriga / qo'shish so'rovlarni to'g'ri shakllanishini ta'minlaydi
  baseURL: 'https://forme-k06z.onrender.com/api/', 
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;