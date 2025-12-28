import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertCircle, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  // Yo'naltirish funksiyasi
  const redirectByUserRole = (token, serverRole = null) => {
    try {
      let userRole = '';

      if (serverRole) {
        // Agar serverdan role kelsa (Postmandagi kabi), o'shani ishlatamiz
        userRole = String(serverRole).toLowerCase().trim();
      } else {
        // Aks holda tokendan o'qiymiz
        const decoded = jwtDecode(token);
        userRole = String(decoded.role || '').toLowerCase().trim();
      }

      console.log("Kirilayotgan rol:", userRole);

      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        // Agar rol aniqlanmasa, default studentga
        navigate('/student/dashboard', { replace: true });
      }
    } catch (e) {
      console.error("Yo'naltirishda xato:", e);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) redirectByUserRole(token);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // POSTMAN tasdiqlagan endpoint
      const res = await api.post('login', formData);
      
      const token = res.data.access_token;
      const role = res.data.role; // Postmandagi "role": "admin" qismi

      // Ma'lumotlarni saqlash
      localStorage.setItem('token', token);

      // Muvaffaqiyatli kirish xabari
      Swal.fire({
        icon: 'success',
        title: 'Muvaffaqiyatli!',
        text: 'Tizimga kirildi',
        timer: 1500,
        showConfirmButton: false
      });

      // Postmandan kelgan role bo'yicha yo'naltirish
      redirectByUserRole(token, role);

    } catch (err) {
      console.error("Login xatosi:", err.response);
      setErrors({ 
        general: err.response?.data?.detail || "Email yoki parol xato!" 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 sm:p-6 md:p-8 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[250px] h-[250px] bg-indigo-200/50 rounded-full blur-3xl" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-white">
          <div className="text-center mb-10">
            <motion.div whileHover={{ scale: 1.05 }} className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200 mx-auto mb-6">
              T
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Xush kelibsiz!</h1>
            <p className="text-slate-500 mt-2 font-medium">Tizimga kirish uchun login qiling</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative flex items-center group">
                <FiMail className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="Email manzilingiz" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-semibold placeholder:text-slate-400 text-[16px]"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="relative flex items-center group">
                <FiLock className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Parolingiz" 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-semibold text-[16px]"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-400 hover:text-blue-600">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {errors.general && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-bold">
                  <FiAlertCircle /> {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 md:py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all disabled:opacity-50">
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Kirish <FiArrowRight /></>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-semibold">
              Profilingiz yo'qmi? 
              <button onClick={() => navigate('/register')} className="ml-2 text-blue-600 font-black hover:underline underline-offset-4">
                Ro'yxatdan o'tish
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;