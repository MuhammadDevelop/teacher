import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import me from '../../img/me.jpg'
import api from '../../api/axios'; 
import { 
  FiDollarSign, FiCheckCircle, FiClock, FiSend, 
  FiCalendar, FiBarChart2, FiLoader, 
  FiMessageCircle, FiAward, FiBookOpen, FiUser, FiCamera, FiX, FiLock, FiMail, FiTarget, FiUsers 
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Animatsiya variantlari
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const profileCircleVariant = {
  animate: {
    rotate: 360,
    transition: { duration: 8, repeat: Infinity, ease: "linear" }
  }
};

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: '', email: '', password: '', photo: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('my-stats');
      setStats(res.data);
      setProfileData({
        fullname: res.data.fullname || '',
        email: res.data.email || '',
        password: '', 
        photo: res.data.photo || ''
      });
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAttendance = async () => {
    setActionLoading(true);
    try {
      await api.post('student/attendance-self');
      await Swal.fire({ icon: 'success', title: 'Muvaffaqiyatli!', text: 'Darsga kelganingiz tasdiqlandi ✨', confirmButtonColor: '#6366f1' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Xatolik yuz berdi';
      Swal.fire({ icon: 'warning', title: 'Diqqat', text: msg, confirmButtonColor: '#6366f1' });
    } finally { setActionLoading(false); }
  };

  const handlePaymentRequest = async () => {
    const sum = parseInt(amount);
    if (!sum || sum < 1000) return Swal.fire('Xato', 'Minimal to\'lov 1,000 so\'m', 'error');
    setActionLoading(true);
    try {
      await api.post('student/pay', { amount: sum }); 
      Swal.fire({ icon: 'success', title: 'Yuborildi!', text: "To'lov admin tasdig'iga yuborildi", confirmButtonColor: '#6366f1' });
      setAmount('');
      fetchData();
    } catch (err) { Swal.fire('Xato', 'To\'lov yuborishda xatolik!', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const dataToSend = { ...profileData, photo: profileData.photo || "", password: profileData.password || null };
      if (!dataToSend.password) delete dataToSend.password;
      await api.put('update-profile', dataToSend);
      await Swal.fire({ icon: 'success', title: 'Yangilandi!', confirmButtonColor: '#6366f1' });
      setShowProfileModal(false);
      fetchData(); 
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Xatolik!', text: "Ma'lumotlar saqlanmadi", confirmButtonColor: '#6366f1' });
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 2 }} className="text-indigo-600 mb-6"><FiLoader size={60} /></motion.div>
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="font-black text-slate-400 tracking-[0.3em] uppercase italic text-xs">Yuklanmoqda...</motion.span>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-10 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <motion.div whileHover={{ scale: 1.05 }} className="relative cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <img src={stats?.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="User" className="w-16 h-16 sm:w-24 sm:h-24 rounded-[2rem] object-cover border-4 border-white shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-2 rounded-xl border-2 border-white"><FiCamera size={14} /></div>
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Salom, {stats?.fullname?.split(' ')[0]}!</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1"><FiBookOpen className="text-indigo-500" /> {stats?.course || 'O\'quvchi'}</p>
            </div>
          </div>
          <motion.button whileHover={{ y: -3 }} onClick={() => setShowProfileModal(true)} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 flex items-center justify-center gap-3 shadow-sm">
            <FiUser size={16} /> Profil sozlamalari
          </motion.button>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="QARZ" value={stats?.remaining_debt} color="text-rose-600" icon={<FiDollarSign/>} unit="so'm" />
          <StatCard title="TO'LOV" value={stats?.total_paid} color="text-emerald-600" icon={<FiCheckCircle/>} unit="so'm" />
          <StatCard title="DAVOMAT" value={stats?.attendance?.filter(a => a.status === 'keldi').length} color="text-indigo-600" icon={<FiClock/>} unit="kun" />
          <StatCard title="OXIRGI BAHO" value={stats?.grades?.[stats?.grades?.length - 1]?.grade || 0} color="text-amber-500" icon={<FiBarChart2/>} unit="ball" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            {/* ATTENDANCE ACTION */}
            <motion.div variants={itemVariants} className={`p-1 rounded-[2.5rem] bg-gradient-to-br shadow-xl ${stats?.attendance?.some(a => a.date === new Date().toISOString().split('T')[0]) ? 'from-slate-200 to-slate-300' : 'from-indigo-600 to-violet-700'}`}>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.3rem] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left text-white">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Bugun darsdami?</h2>
                  <p className="opacity-70 text-xs font-bold uppercase mt-1">Davomatni tasdiqlang</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAttendance} disabled={actionLoading || stats?.attendance?.some(a => a.date === new Date().toISOString().split('T')[0])} className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-50">
                  {stats?.attendance?.some(a => a.date === new Date().toISOString().split('T')[0]) ? 'TASDIQLANDI ✅' : 'TASDIQLASH'}
                </motion.button>
              </div>
            </motion.div>

            {/* ATTENDANCE HISTORY */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase italic"><FiCalendar className="text-indigo-500"/> Davomat Tarixi</h3>
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase">So'nggi 14 dars</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {stats?.attendance?.length > 0 ? [...stats.attendance].reverse().slice(0, 14).map((item, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex-shrink-0 snap-center">
                    <div className={`w-16 h-24 rounded-3xl flex flex-col items-center justify-center border-2 ${item.status === 'keldi' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                      <span className="text-[10px] font-black uppercase opacity-60">{new Date(item.date).toLocaleDateString('uz-UZ', { weekday: 'short' })}</span>
                      <span className="text-xl font-black italic my-1">{new Date(item.date).getDate()}</span>
                      <div className={`w-2 h-2 rounded-full ${item.status === 'keldi' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                    </div>
                  </motion.div>
                )) : <p className="text-center w-full text-slate-400 font-bold uppercase italic text-[10px]">Ma'lumot yo'q</p>}
              </div>
            </motion.div>

            {/* INFO BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-sm uppercase italic"><FiMessageCircle className="text-indigo-500"/> O'qituvchi izohi</h3>
                    <div className="p-5 bg-slate-50 rounded-[1.5rem] border-l-4 border-indigo-500 italic text-xs font-bold text-slate-600 leading-relaxed">
                        "{stats?.grades?.[stats?.grades?.length - 1]?.comment || "Hozircha o'qituvchi tomonidan izoh qoldirilmagan."}"
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-sm uppercase italic"><FiAward className="text-amber-500"/> Baholash tartibi</h3>
                    <div className="space-y-3">
                        <GradeInfo ball="5" text="Darsda va vazifada faol ✨" color="bg-emerald-500" />
                        <GradeInfo ball="4" text="Vazifa chala, darsda aktiv 👍" color="bg-blue-500" />
                        <GradeInfo ball="3" text="Darsda sust, vazifa chala ⚠️" color="bg-amber-500" />
                        <GradeInfo ball="2" text="Qatnashmadi / Vazifa yo'q ❌" color="bg-rose-500" />
                    </div>
                </motion.div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* PAYMENT */}
            <motion.div variants={itemVariants} className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-indigo-50">
              <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">To'lov yuborish</h2>
              <div className="space-y-6">
                <div className="relative group">
                  <FiDollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 text-xl transition-transform group-focus-within:scale-125" />
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Summani kiriting..." className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white p-6 pl-16 rounded-[1.5rem] font-black text-slate-800 outline-none transition-all" />
                </div>
                <motion.button whileHover={{ scale: 1.02, backgroundColor: "#4f46e5" }} whileTap={{ scale: 0.98 }} onClick={handlePaymentRequest} disabled={actionLoading} className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all">
                  {actionLoading ? <FiLoader className="animate-spin" /> : <FiSend />} YUBORISH
                </motion.button>
              </div>
            </motion.div>

            {/* MISSION & DEVELOPER SECTION */}
            <motion.div 
              variants={itemVariants} 
              className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 p-8 text-white"
              >
                <FiTarget size={200} />
              </motion.div>

              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-white/80 font-black text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                    <FiTarget className="animate-pulse" /> Loyiha maqsadi
                  </h3>
                  <p className="text-sm font-bold leading-relaxed italic text-white">
                    Ushbu tizim o'quvchilarning bilim olish jarayonini shaffof va adolatli nazorat qilish maqsadida yaratilgan.
                  </p>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <h3 className="text-white/80 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <FiUsers /> Loyiha yaratuvchisi
                  </h3>
                  
                  <div className="flex flex-col items-center sm:items-start gap-5">
                    <div className="relative">
                      <motion.div 
                        variants={profileCircleVariant}
                        animate="animate"
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-cyan-300 opacity-50"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-800"
                      >
                        <img 
                          src={me} 
                          alt="Oridjonov Muhammaddiyor" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        />
                      </motion.div>
                      <div className="absolute -bottom-2 -right-2 bg-cyan-400 p-2 rounded-lg shadow-lg text-indigo-900">
                         <FiCheckCircle size={14} />
                      </div>
                    </div>

                    <div className="text-center sm:text-left">
                      <motion.h4 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl font-black uppercase tracking-tight italic"
                      >
                        Oridjonov Muhammaddiyor
                      </motion.h4>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest">
                          Full-Stack Developer
                        </span>
                        <motion.div 
                          animate={{ rotate: [0, 15, -15, 0] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          🚀
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-[10px] font-bold uppercase tracking-widest opacity-80 italic border-l-2 border-cyan-400 pl-3 text-white/90">
                    Dasturiy yechim va innovatsion g'oya muallifi.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MODAL (PROFIL) */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 100, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 sm:p-12 overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Profil</h2>
                  <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowProfileModal(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500"><FiX size={24}/></motion.button>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <ProfileInput label="Rasm URL" icon={<FiCamera/>} value={profileData.photo} onChange={(v) => setProfileData({...profileData, photo: v})} />
                  <ProfileInput label="To'liq ism" icon={<FiUser/>} value={profileData.fullname} onChange={(v) => setProfileData({...profileData, fullname: v})} required />
                  <ProfileInput label="Email" icon={<FiMail/>} value={profileData.email} onChange={(v) => setProfileData({...profileData, email: v})} required type="email" />
                  <ProfileInput label="Parol" icon={<FiLock/>} value={profileData.password} onChange={(v) => setProfileData({...profileData, password: v})} type="password" placeholder="O'zgartirmaslik uchun bo'sh qoldiring" />
                  <motion.button whileHover={{ scale: 1.02 }} type="submit" disabled={actionLoading} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl mt-6">
                    {actionLoading ? <FiLoader className="animate-spin mx-auto" /> : 'SAQLASH'}
                  </motion.button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// YORDAMCHI KOMPONENTLAR
const StatCard = ({ title, value, color, icon, unit }) => (
  <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="p-6 sm:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-lg flex flex-col justify-between h-40 sm:h-52 group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><span className="text-8xl">{icon}</span></div>
    <div className="flex justify-between items-start relative z-10">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner text-xl sm:text-2xl">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-lg sm:text-2xl font-black tracking-tighter ${color} truncate relative z-10`}>
      {Number(value || 0).toLocaleString()} <span className="text-[9px] ml-1 text-slate-300 font-bold uppercase">{unit}</span>
    </div>
  </motion.div>
);

const GradeInfo = ({ ball, text, color }) => (
    <div className="flex items-center gap-3">
        <span className={`${color} text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shadow-sm`}>{ball}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{text}</span>
    </div>
);

const ProfileInput = ({ label, icon, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">{label}</label>
    <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] focus-within:border-indigo-500 focus-within:bg-white transition-all">
      <span className="ml-5 text-slate-400">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4.5 bg-transparent outline-none font-bold text-sm text-slate-700" required={required} placeholder={placeholder} />
    </div>
  </div>
);

export default StudentDashboard;