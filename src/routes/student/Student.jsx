import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; 
import { 
  FiDollarSign, FiCheckCircle, FiClock, FiSend, 
  FiLock, FiCalendar, FiBarChart2, FiActivity, FiInfo, FiLoader 
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState('');

  // MA'LUMOTLARNI YUKLASH
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('my-stats');
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 1. DAVOMAT FUNKSIYASI (Backend: /api/student/attendance-self)
  const handleAttendance = async () => {
    setActionLoading(true);
    try {
      await api.post('student/attendance-self');
      await Swal.fire({
        icon: 'success',
        title: 'Muvaffaqiyatli!',
        text: 'Darsga kelganingiz tasdiqlandi ✨',
        confirmButtonColor: '#6366f1',
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'warning',
        title: 'Diqqat',
        text: err.response?.data?.detail || 'Xatolik yuz berdi',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. TO'LOV YUBORISH (Backend: /api/student/pay)
  const handlePaymentRequest = async () => {
    const sum = parseInt(amount);
    if (!sum || sum < 1000) {
      return Swal.fire('Xato', 'Minimal to\'lov 1,000 so\'m', 'error');
    }

    setActionLoading(true);
    try {
      await api.post('student/pay', { amount: sum }); 
      Swal.fire({
        icon: 'success',
        title: 'Yuborildi!',
        text: "To'lov admin tasdig'iga yuborildi",
        confirmButtonColor: '#6366f1',
      });
      setAmount('');
      fetchData();
    } catch (err) {
      Swal.fire('Xato', 'To\'lov yuborishda xatolik!', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-indigo-600 mb-4">
        <FiLoader size={50} />
      </motion.div>
      <span className="font-bold text-slate-400 tracking-widest animate-pulse">YUKLANMOQDA...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        
        {/* STATISTIKA SECTION - Mobil ekranda 2 tadan joylashadi */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title="QARZ" value={stats?.remaining_debt} color="text-rose-600" icon={<FiDollarSign/>} unit="so'm" delay={0.1} />
          <StatCard title="TO'LOV" value={stats?.total_paid} color="text-emerald-600" icon={<FiCheckCircle/>} unit="so'm" delay={0.2} />
          <StatCard title="DAVOMAT" value={stats?.attendance?.length} color="text-indigo-600" icon={<FiClock/>} unit="kun" delay={0.3} />
          <StatCard title="BAHO" value={stats?.grades?.[0]?.grade || 0} color="text-amber-500" icon={<FiBarChart2/>} unit="ball" delay={0.4} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* DAVOMAT QISMI */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 space-y-6">
            <div className={`relative overflow-hidden p-1 bg-gradient-to-br rounded-[2rem] sm:rounded-[2.5rem] shadow-xl ${
               stats?.attendance?.some(a => a.date === new Date().toISOString().split('T')[0]) 
               ? 'from-slate-200 to-slate-300' : 'from-indigo-600 to-violet-700'
            }`}>
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-10 rounded-[1.8rem] sm:rounded-[2.3rem] flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-2xl text-white">
                    <FiActivity size={24} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Bugun darsdami?</h2>
                </div>

                <button 
                  onClick={handleAttendance}
                  disabled={actionLoading}
                  className="w-full py-5 sm:py-6 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <FiLoader className="animate-spin mx-auto" size={20} /> : 'TASDIQLASH'}
                </button>
              </div>
            </div>

            {/* DAVOMAT KALENDARI - Mobil versiyasi */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg border border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-3 mb-6">
                <FiCalendar className="text-indigo-500" /> Oxirgi davomat
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-4">
                {stats?.attendance?.slice(-10).map((day, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-600">{new Date(day.date).getDate()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* TO'LOV TIZIMI */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-indigo-50">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">To'lov qilish</h2>
              
              <div className="space-y-6">
                {/* Tayyor summalar - Mobil uchun qulay */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50000, 100000, 200000].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val.toString())}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold border border-slate-100 transition-colors"
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Summani kiriting"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white p-5 pl-12 rounded-2xl font-bold text-slate-800 outline-none text-[16px]"
                  />
                </div>

                <button 
                  onClick={handlePaymentRequest}
                  disabled={actionLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                >
                  {actionLoading ? <FiLoader className="animate-spin" size={20} /> : <FiSend />}
                  YUBORISH
                </button>

                <div className="p-4 bg-amber-50 rounded-xl flex gap-3 items-start border border-amber-100">
                  <FiInfo className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-bold text-amber-700 leading-tight uppercase">
                    To'lov admin tomonidan tasdiqlangach hisobingizga qo'shiladi.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Kichik karta komponenti (Mobil moslashuvchan)
const StatCard = ({ title, value, color, icon, unit, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-slate-50 shadow-md flex flex-col justify-between h-32 sm:h-44"
  >
    <div className="flex justify-between items-start">
      <div className="hidden sm:flex w-12 h-12 bg-slate-50 text-indigo-500 rounded-xl items-center justify-center shadow-inner">
        {icon}
      </div>
      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-base sm:text-2xl font-black tracking-tight ${color}`}>
      {Number(value || 0).toLocaleString()} 
      <span className="text-[8px] sm:text-[10px] ml-1 text-slate-300 font-bold uppercase">{unit}</span>
    </div>
  </motion.div>
);

export default StudentDashboard;