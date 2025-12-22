import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Tokenni tekshirish va yo'naltirish funksiyasi
  const redirectByUserRole = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Backenddan faqat 'role' kelyapti: 'admin' yoki 'student'
      if (decoded.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (e) {
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      redirectByUserRole(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/login', { email, password });
      const token = res.data.access_token;

      if (!token) throw new Error("Serverdan token qaytmadi!");
      
      localStorage.setItem('token', token);

      // Muvaffaqiyatli xabar
      Swal.fire({
        icon: 'success',
        title: 'Xush kelibsiz!',
        text: 'Tizimga muvaffaqiyatli kirdingiz',
        timer: 1200,
        showConfirmButton: false,
        position: 'center',
      });

      // 1.2 soniyadan keyin yo'naltirish
      setTimeout(() => {
        redirectByUserRole(token);
      }, 1200);

    } catch (err) {
      console.error("Login xatosi:", err);
      const errorMsg = err.response?.data?.detail || "Email yoki parol noto'g'ri!";
      
      Swal.fire({
        icon: 'error',
        title: 'Kirishda xatolik!',
        text: errorMsg,
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Qayta urinish',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 w-full max-w-md border border-indigo-50">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 rotate-6 shadow-lg shadow-indigo-200">
            OM
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Xush kelibsiz!</h2>
          <p className="text-gray-400 mt-2 font-medium">Profilingizga kiring</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="email" 
              value={email}
              placeholder="Email manzilingiz"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Parolingiz"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-medium"
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Tizimga kirish
                <FiArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-gray-500 font-medium border-t border-gray-50 pt-6">
          Hisobingiz yo'qmi? 
          <button 
            onClick={() => navigate('/register')} 
            className="ml-2 text-indigo-600 font-black hover:underline underline-offset-4"
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;