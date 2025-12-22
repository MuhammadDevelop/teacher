import React, { useState } from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Backendga yuborish
      const res = await api.post('/register', formData);
      
      // 2. Ismni saqlaymiz (Lekin tokenni EMAS!)
      localStorage.setItem('userFullname', formData.fullname);
      
      // 3. Muvaffaqiyatli xabar
      await Swal.fire({
        icon: 'success',
        title: 'Tabriklaymiz!',
        text: "Ro'yxatdan o'tdingiz. Endi tizimga kirishingiz mumkin.",
        confirmButtonColor: '#10b981',
        confirmButtonText: 'KIRISH SAHIFASIGA O\'TISH',
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-[2.5rem]'
        }
      });

      // 4. Qat'iy ravishda Login sahifasiga yo'naltirish
      navigate('/login', { replace: true }); 

    } catch (err) {
      console.error("Xatolik:", err);
      const errorMsg = err.response?.data?.detail || "Xatolik yuz berdi";
      
      Swal.fire({
        icon: 'error',
        title: 'Xatolik!',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'rounded-[2rem]' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-100 w-full max-w-md border border-emerald-50">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 -rotate-6 shadow-lg shadow-emerald-200">
            OM
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Ro'yxatdan o'tish</h2>
          <p className="text-gray-400 mt-2 font-medium">Ma'lumotlarni kiriting</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="To'liq ismingiz"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-700"
              onChange={(e) => setFormData({...formData, fullname: e.target.value})}
              required 
            />
          </div>

          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-700"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Parol"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-700"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-70"
          >
            {loading ? "YUKLANMOQDA..." : "RO'YXATDAN O'TISH"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium border-t pt-6">
          <span className="text-gray-500">Hisobingiz bormi?</span>
          <button 
            onClick={() => navigate('/login')} 
            className="ml-2 text-emerald-600 font-black hover:underline"
          >
            Kirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;