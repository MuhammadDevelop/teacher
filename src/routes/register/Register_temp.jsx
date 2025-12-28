import React, { useState } from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '', email: '', password: '', course: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  // Animatsiya variantlari
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullname.trim()) tempErrors.fullname = "Ism-sharifingizni kiriting";
    if (!formData.email) tempErrors.email = "Email manzilingizni kiriting";
    else if (!emailRegex.test(formData.email)) tempErrors.email = "Email formati noto'g'ri";
    if (!formData.password) tempErrors.password = "Parol yaratishingiz shart";
    else if (formData.password.length < 8) tempErrors.password = "Kamida 8 ta belgi";
    if (!formData.course) tempErrors.course = "Kursni tanlang";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await api.post('register', formData);

      // MA'LUMOTLARNI LOCALSTORAGE GA SAQLASH
      localStorage.setItem('userFullname', formData.fullname);
      localStorage.setItem('course_type', formData.course);

      await Swal.fire({
        icon: 'success',
        title: 'Muvaffaqiyatli!',
        text: "Profilingiz tayyor, tizimga kiring.",
        confirmButtonColor: '#10b981',
        customClass: { popup: 'rounded-[2rem]' }
      });
      navigate('/login', { replace: true }); 
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Xatolik!', 
        text: err.response?.data?.detail || "Xatolik yuz berdi",
        customClass: { popup: 'rounded-3xl' } 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) setErrors({ ...errors, [id]: null });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] overflow-x-hidden p-4 sm:p-6">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 sm:w-96 sm:h-96 bg-emerald-200/40 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 sm:w-96 sm:h-96 bg-blue-200/40 rounded-full blur-[80px] sm:blur-[120px]" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/90 backdrop-blur-2xl p-6 sm:p-10 md:p-12 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] w-full max-w-[480px] border border-white"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl text-white text-2xl font-bold mb-4 shadow-lg shadow-emerald-200 ring-4 ring-emerald-50">
            T
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Ro'yxatdan o'tish</h2>
          <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">Kelajak sari birinchi qadam</p>
        </motion.div>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { id: 'fullname', type: 'text', placeholder: 'Ism-sharifingiz', icon: <FiUser /> },
            { id: 'email', type: 'email', placeholder: 'Email manzilingiz', icon: <FiMail /> },
          ].map((field) => (
            <motion.div variants={itemVariants} key={field.id} className="space-y-1">
              <div className={`group flex items-center border-2 rounded-2xl transition-all duration-300 ${errors[field.id] ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50'}`}>
                <span className={`ml-4 transition-colors ${errors[field.id] ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                  {field.icon}
                </span>
                <input id={field.id} type={field.type} placeholder={field.placeholder} className="w-full p-4 sm:p-5 outline-none bg-transparent font-semibold text-slate-700 placeholder:text-slate-400 text-sm sm:text-base" onChange={handleChange} />
                {formData[field.id].length > 3 && !errors[field.id] && <FiCheckCircle className="mr-4 text-emerald-500 animate-pulse" />}
              </div>
              <AnimatePresence>
                {errors[field.id] && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-bold ml-2 flex items-center gap-1">
                    <FiAlertCircle /> {errors[field.id]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          <motion.div variants={itemVariants} className="space-y-1">
            <div className={`group flex items-center border-2 rounded-2xl transition-all ${errors.course ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50'}`}>
              <FiBookOpen className="ml-4 text-slate-400 group-focus-within:text-emerald-500" />
              <select id="course" className="w-full p-4 sm:p-5 outline-none bg-transparent font-semibold text-slate-700 appearance-none cursor-pointer text-sm sm:text-base" onChange={handleChange}>
                <option value="">Yo'nalishni tanlang</option>
                <option value="Foundation">Foundation</option>
                <option value="Dasturlash">Dasturlash</option>
              </select>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <div className={`group flex items-center border-2 rounded-2xl transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50'}`}>
              <FiLock className="ml-4 text-slate-400 group-focus-within:text-emerald-500" />
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Kamida 8 ta belgi" className="w-full p-4 sm:p-5 outline-none bg-transparent font-semibold text-slate-700 placeholder:text-slate-400 text-sm sm:text-base" onChange={handleChange} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-4 p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-bold ml-2 flex items-center gap-1"><FiAlertCircle /> {errors.password}</p>}
          </motion.div>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: '#065f46' }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-bold flex items-center justify-center gap-3 mt-4 hover:shadow-2xl hover:shadow-emerald-200 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Tizimga qo'shilish <FiArrowRight /></>
            )}
          </motion.button>
        </form>

        <motion.p variants={itemVariants} className="mt-8 text-center text-slate-500 font-semibold text-xs sm:text-sm">
          Hisobingiz bormi? 
          <button onClick={() => navigate('/login')} className="ml-2 text-emerald-600 font-black hover:text-emerald-700 underline underline-offset-4 decoration-2">
            Kirish
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;