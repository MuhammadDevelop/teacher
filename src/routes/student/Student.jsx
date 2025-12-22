import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { FiDollarSign, FiCheckCircle, FiClock, FiList, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Ma'lumotlarni yuklash funksiyasi
  const fetchData = async () => {
    try {
      // Backend: @app.get("/my-stats")
      const statsRes = await api.get('/my-stats');
      setStats(statsRes.data);

      // Backend: @app.get("/admin/report") - bu yerda student faqat o'zini ko'rishi uchun
      // Agar backendda /my-payments endpointi bo'lmasa, reportdan filtrlaymiz
      const reportRes = await api.get('/admin/report');
      // Token orqali o'z ID-sini topish (user_id 0 emasligini tekshiring)
      const myData = reportRes.data.find(u => u.id !== 0); 
      setPayments(myData?.payments || []);
      
    } catch (err) {
      console.error("Ma'lumot yuklashda xatolik:", err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. To'lov yuborish funksiyasi
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    try {
      await api.post('/payment', { amount: parseInt(amount) });
      Swal.fire({
        icon: 'success',
        title: 'To\'lov qabul qilindi',
        timer: 1500,
        showConfirmButton: false
      });
      setAmount('');
      fetchData(); // Ma'lumotlarni yangilash
    } catch (err) {
      Swal.fire('Xatolik', 'To\'lov yuborishda xato yuz berdi', 'error');
    }
  };

  // 3. Davomat (Self Attendance)
  const handleSelfAttendance = async () => {
    try {
      await api.post('/attendance/self?lesson=1'); // Default 1-dars
      Swal.fire('Muvaffaqiyatli!', 'Davomat belgilandi', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Xato', err.response?.data?.detail || 'Xatolik', 'warning');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#0F172A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen font-sans pb-20 transition-colors duration-300 text-gray-800 dark:text-gray-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* STATISTIKA KARTALARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Qolgan qarz" value={stats?.remaining_debt} color="border-rose-500 text-rose-500 bg-rose-50/30 dark:bg-rose-500/10" icon={<FiDollarSign/>} unit="so'm" />
          <StatCard title="Jami to'langan" value={stats?.total_paid} color="border-emerald-500 text-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10" icon={<FiCheckCircle/>} unit="so'm" />
          <StatCard title="Ishtirok" value={stats?.lessons_attended} color="border-sky-500 text-sky-500 bg-sky-50/30 dark:bg-sky-500/10" icon={<FiClock/>} unit="ta dars" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DAVOMAT SECTION */}
          <div className="bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col justify-between">
             <div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Bugun darsdami?</h2>
                <p className="opacity-80 font-medium">O'z ishtirokingizni tasdiqlang</p>
             </div>
             <button 
                onClick={handleSelfAttendance}
                className="mt-8 bg-white text-indigo-600 py-4 rounded-2xl font-black hover:bg-opacity-90 transition-all active:scale-95"
             >
                DARSDAMAN
             </button>
          </div>

          {/* TO'LOV SECTION */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-slate-700">
            <h2 className="text-2xl font-black mb-6 text-gray-800 dark:text-slate-200 tracking-tight">To'lov yuborish</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="relative group">
                <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Summani kiriting"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-slate-900 border-2 border-transparent dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none font-bold text-lg transition-all dark:text-white"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
                YUBORISH <FiSend />
              </button>
            </form>
          </div>
        </div>

        {/* TO'LOVLAR RO'YXATI */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <h2 className="text-2xl font-black text-gray-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <FiList className="text-amber-500" /> Oxirgi to'lovlar
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 dark:text-slate-500 text-[10px] uppercase font-black">
                  <th className="px-4 py-2">Sana</th>
                  <th className="px-4 py-2">Miqdor</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="dark:text-slate-300 divide-y divide-gray-50 dark:divide-slate-700">
                {payments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 text-sm">{p.date.split(' ')[0]}</td>
                    <td className="px-4 py-4 font-bold">{p.amount.toLocaleString()} so'm</td>
                    <td className="px-4 py-4">
                      <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-black uppercase">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon, unit }) => (
  <div className={`p-6 rounded-[2rem] border-t-8 ${color} bg-white dark:bg-slate-800 shadow-sm transition-all border dark:border-slate-700`}>
    <div className="flex justify-between items-center mb-2">
      <span className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
      <div className="text-gray-300 dark:text-slate-600">{icon}</div>
    </div>
    <div className="text-2xl font-black text-gray-800 dark:text-white">
      {Number(value || 0).toLocaleString()} <span className="text-xs font-medium text-gray-400 ml-1">{unit}</span>
    </div>
  </div>
);

export default StudentDashboard;