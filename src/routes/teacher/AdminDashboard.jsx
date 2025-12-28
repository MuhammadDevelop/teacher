import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiTrash2, FiUsers, FiTrendingUp, 
  FiAlertCircle, FiLock, FiUnlock, FiStar, FiCheckCircle, 
  FiX, FiUploadCloud, FiCalendar, FiUserCheck, FiUserX, FiClock
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, total_revenue: 0, total_outstanding_debt: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [reportRes, usersRes, pendingRes] = await Promise.all([
        api.get('admin/report'),
        api.get('admin/users'),
        api.get('admin/pending-payments')
      ]);
      setStats(reportRes.data);
      setStudents(usersRes.data || []);
      setPendingPayments(pendingRes.data || []);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    const studentIds = Object.keys(attendanceData);
    if (studentIds.length === 0) {
      return Swal.fire('Eslatma', 'Hech bo\'lmasa bitta talabani belgilang', 'info');
    }
    try {
      Swal.fire({ title: 'Saqlanmoqda...', didOpen: () => Swal.showLoading() });
      const requests = studentIds.map(id => 
        api.post('admin/mark-attendance', {
          user_id: Number(id),
          date: attendanceDate,
          status: attendanceData[id]
        })
      );
      await Promise.all(requests);
      Swal.fire({ icon: 'success', title: 'Muvaffaqiyatli saqlandi', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      setShowAttendanceModal(false);
      setAttendanceData({});
    } catch (err) {
      Swal.fire('Xato', err.response?.data?.detail || 'Davomatda xatolik', 'error');
    }
  };

  const handleSetGrade = async (studentId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Baholash',
      html: `
        <select id="swal-grade" class="swal2-input !w-full !m-0 !rounded-2xl border-slate-200">
          <option value="5">5 (A'lo)</option>
          <option value="4">4 (Yaxshi)</option>
          <option value="3">3 (Qoniqarli)</option>
          <option value="2">2 (Qoniqarsiz)</option>
        </select>
        <textarea id="swal-comment" class="swal2-textarea !w-full !m-0 !rounded-2xl !mt-4 border-slate-200" placeholder="Izoh..."></textarea>
      `,
      confirmButtonText: 'Saqlash',
      buttonsStyling: false,
      customClass: { confirmButton: 'bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold' },
      preConfirm: () => ({
        grade: document.getElementById('swal-grade').value,
        comment: document.getElementById('swal-comment').value
      })
    });

    if (formValues) {
      try {
        await api.post('admin/set-grade', { 
          user_id: studentId, 
          grade: parseInt(formValues.grade), 
          comment: formValues.comment 
        });
        Swal.fire({ icon: 'success', title: 'Saqlandi', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        fetchAllData();
      } catch (err) { Swal.fire('Xato', 'Baho saqlanmadi', 'error'); }
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      await api.post(`admin/confirm-payment/${paymentId}`);
      Swal.fire({ icon: 'success', title: 'Tasdiqlandi', toast: true, position: 'top-end', timer: 2000 });
      fetchAllData();
    } catch (err) { Swal.fire('Xato', 'To\'lov tasdiqlanmadi', 'error'); }
  }

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'O\'chirilsinmi?',
      text: "Ma'lumotlarni qayta tiklab bo'lmaydi!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ha, o\'chirish',
      cancelButtonText: 'Bekor qilish',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold mx-2',
        cancelButton: 'bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold mx-2'
      }
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`admin/delete-user/${userId}`);
        Swal.fire('O\'chirildi', '', 'success');
        fetchAllData();
      } catch (err) { Swal.fire('Xato', 'O\'chirib bo\'lmadi', 'error'); }
    }
  };

  const filteredStudents = students.filter(s => s.fullname?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Animatsiya variantlari
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-4 md:p-10 bg-[#F1F5F9] min-h-screen pb-24 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* STATS SECTION */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <StatCard icon={<FiUsers size={24}/>} label="Jami Talabalar" value={stats.total_students} color="bg-indigo-600" />
          <StatCard icon={<FiTrendingUp size={24}/>} label="Umumiy Tushum" value={`${stats.total_revenue?.toLocaleString()} UZS`} color="bg-emerald-500" />
          <StatCard icon={<FiAlertCircle size={24}/>} label="Qarzdorlik" value={`${stats.total_outstanding_debt?.toLocaleString()} UZS`} color="bg-rose-500" />
        </motion.div>

        {/* TOOLBAR */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white"
        >
          <div className="flex items-center gap-4 px-2">
             <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"><FiUnlock size={22}/></div>
             <div>
                <h1 className="text-lg font-black tracking-tight leading-none">ADMIN DASHBOARD</h1>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Boshqaruv tizimi</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-[1.5rem] outline-none text-sm font-semibold border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all" 
                placeholder="Talabalarni qidirish..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <ToolbarBtn onClick={() => setShowAttendanceModal(true)} icon={<FiCalendar size={20}/>} color="bg-amber-500" shadow="shadow-amber-200" />
            <ToolbarBtn 
              onClick={() => setShowConfirmModal(true)} 
              icon={<FiCheckCircle size={20}/>} 
              color="bg-indigo-600" 
              shadow="shadow-indigo-200"
              badge={pendingPayments.length}
            />
          </div>
        </motion.div>

        {/* MAIN TABLE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-10 py-7">Talaba Ma'lumoti</th>
                  <th className="px-10 py-7">Moliyaviy Holat</th>
                  <th className="px-10 py-7 text-center">Amallar</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                {filteredStudents.map((s) => (
                  <motion.tr key={s.id} variants={itemVariants} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                          <div className="relative">
                            {s.image || s.avatar_url ? (
                              <img src={s.image || s.avatar_url} className="w-12 h-12 rounded-[1.25rem] object-cover shadow-md group-hover:scale-105 transition-transform" alt="" />
                            ) : (
                              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-black text-sm uppercase">
                                {s.fullname?.charAt(0)}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                          </div>
                          <div>
                             <p className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{s.fullname}</p>
                             <p className="text-[11px] text-slate-400 font-bold mt-0.5">{s.email || 'pochta kiritilmagan'}</p>
                          </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[12px] ${s.total_debt > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.total_debt > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {s.total_debt?.toLocaleString()} UZS
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex justify-center gap-3">
                          <RowBtn icon={<FiStar/>} theme="amber" onClick={() => handleSetGrade(s.id)} label="Baholash" />
                          <RowBtn icon={<FiTrash2/>} theme="rose" onClick={() => handleDeleteUser(s.id)} label="O'chirish" />
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              Talabalar topilmadi
            </div>
          )}
        </motion.div>
      </div>

      {/* ATTENDANCE MODAL */}
      <AnimatePresence>
        {showAttendanceModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAttendanceModal(false)} />
            <motion.div 
              initial={{ y: 100, scale: 0.95, opacity: 0 }} 
              animate={{ y: 0, scale: 1, opacity: 1 }} 
              exit={{ y: 100, scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">DAVOMAT JURNALI</h3>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sana: {attendanceDate}</p>
                </div>
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-100 border-none rounded-2xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="p-8 pt-4 flex-1 overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
                {students.map((st) => (
                  <div key={st.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                    <span className="text-xs font-black text-slate-700 uppercase">{st.fullname}</span>
                    <div className="flex gap-2 bg-white p-1.5 rounded-[1.5rem] shadow-sm">
                      <AttendToggle active={attendanceData[st.id] === 'present'} icon={<FiUserCheck/>} color="emerald" onClick={() => handleAttendanceChange(st.id, 'present')} />
                      <AttendToggle active={attendanceData[st.id] === 'absent'} icon={<FiUserX/>} color="rose" onClick={() => handleAttendanceChange(st.id, 'absent')} />
                      <AttendToggle active={attendanceData[st.id] === 'late'} icon={<FiClock/>} color="amber" onClick={() => handleAttendanceChange(st.id, 'late')} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 pt-0">
                <button 
                  onClick={submitAttendance} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENTS MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">To'lovlar Tasdig'i</h3>
                 <button onClick={() => setShowConfirmModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><FiX size={20}/></button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {pendingPayments.map(p => (
                  <div key={p.id || p.payment_id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                    <div>
                      <p className="font-black text-xs text-slate-800 uppercase leading-none">{p.fullname}</p>
                      <p className="text-emerald-500 font-extrabold text-sm mt-2">{p.amount?.toLocaleString()} UZS</p>
                    </div>
                    <button 
                      onClick={() => handleConfirmPayment(p.payment_id || p.id)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg shadow-indigo-100 active:scale-90 transition-all uppercase tracking-widest"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                ))}
                {pendingPayments.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><FiCheckCircle size={32} /></div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Navbatda to'lovlar yo'q</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- OPTIMALLASHTIRILGAN KOMPONENTLAR ---

const StatCard = ({ icon, label, value, color }) => (
  <motion.div variants={{hidden: {opacity:0, y:20}, visible: {opacity:1, y:0}}} className={`${color} p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">{icon}</div>
    <div className="relative z-10 min-w-0">
      <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">{label}</p>
      <p className="text-2xl font-black mt-1 truncate tracking-tighter leading-none">{value}</p>
    </div>
  </motion.div>
);

const ToolbarBtn = ({ onClick, icon, color, shadow, badge }) => (
  <motion.button 
    whileHover={{ y: -4, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick} 
    className={`relative p-5 ${color} text-white rounded-[1.5rem] shadow-xl ${shadow} transition-all`}
  >
    {icon}
    {badge > 0 && (
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-[10px] font-black rounded-full flex items-center justify-center border-[3px] border-white ring-4 ring-rose-500/10">
        {badge}
      </span>
    )}
  </motion.button>
);

const RowBtn = ({ icon, theme, onClick, label }) => {
  const themes = {
    amber: "text-amber-500 bg-amber-50 hover:bg-amber-500 hover:text-white hover:shadow-amber-200",
    rose: "text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white hover:shadow-rose-200"
  };
  return (
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-3.5 rounded-2xl transition-all duration-300 shadow-sm font-bold flex items-center gap-2 ${themes[theme]}`}
    >
      {icon}
      <span className="hidden lg:block text-[10px] uppercase font-black">{label}</span>
    </motion.button>
  );
};

const AttendToggle = ({ active, icon, color, onClick }) => {
  const styles = {
    emerald: active ? "bg-emerald-500 text-white" : "text-emerald-500 bg-transparent hover:bg-emerald-50",
    rose: active ? "bg-rose-500 text-white" : "text-rose-500 bg-transparent hover:bg-rose-50",
    amber: active ? "bg-amber-500 text-white" : "text-amber-500 bg-transparent hover:bg-amber-50",
  };
  return (
    <button onClick={onClick} className={`${styles[color]} p-4 rounded-2xl transition-all duration-300 font-bold active:scale-90`}>
      {React.cloneElement(icon, { size: 18, strokeWidth: 3 })}
    </button>
  );
};

export default AdminDashboard;