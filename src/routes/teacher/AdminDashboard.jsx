import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { 
  FiSearch, FiUserCheck, FiTrash2, FiDollarSign, 
  FiUsers, FiTrendingUp, FiAlertCircle, FiRefreshCw, FiStar, FiCalendar, FiLock, FiUnlock
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, total_revenue: 0, total_outstanding_debt: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const usersRes = await api.get('/admin/users');
      const studentData = usersRes.data || [];
      setStudents(studentData);

      const revenue = studentData.reduce((acc, s) => acc + (s.total_paid || 0), 0);
      const debt = studentData.reduce((acc, s) => acc + (s.total_debt || 0), 0);
      
      setStats({
        total_students: studentData.length,
        total_revenue: revenue,
        total_outstanding_debt: debt
      });
    } catch (err) {
      console.error("Yuklashda xato:", err);
      Swal.fire('Xato', 'Ma\'lumotlarni olishda muammo yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- 1. DAVOMAT ---
  const handleMarkAttendance = async (studentId, name) => {
    const { value: formValues } = await Swal.fire({
      title: 'Davomat qayd etish',
      html:
        `<input type="date" id="swal-input1" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">` +
        `<select id="swal-input2" class="swal2-input">
          <option value="keldi">Keldi ✅</option>
          <option value="kelmadi">Kelmadi ❌</option>
        </select>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => [
        document.getElementById('swal-input1').value,
        document.getElementById('swal-input2').value
      ]
    });

    if (formValues) {
      const [date, status] = formValues;
      try {
        await api.post('/admin/mark-attendance', { user_id: studentId, status, date });
        Swal.fire({ icon: 'success', title: 'Saqlandi!', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Xato', 'Davomatni saqlashda xatolik', 'error');
      }
    }
  };

  // --- 2. TO'LOV ---
  const handleAddPayment = async (studentId, name) => {
    const { value: amount } = await Swal.fire({
      title: 'To\'lov kiritish',
      text: `${name} uchun summa:`,
      input: 'number',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
    });

    if (amount) {
      try {
        await api.post('/student/pay', { amount: parseInt(amount) }, { headers: { 'user_id': studentId } });
        Swal.fire('Tayyor!', 'To\'lov saqlandi', 'success');
        fetchAllData();
      } catch (err) {
        Swal.fire('Xato', 'To\'lovda xatolik', 'error');
      }
    }
  };

  // --- 3. BLOKLASH / BLOKDAN CHIQARISH (YANGI) ---
  const handleToggleBlock = async (student) => {
    const isBlocked = student.is_active === false; // Backenddan keladigan statusga qarab
    const result = await Swal.fire({
      title: isBlocked ? 'Blokdan chiqarilsinmi?' : 'Bloklansinmi?',
      text: `${student.fullname} tizimga kira ${isBlocked ? 'oladigan' : 'olmaydigan'} bo'ladi.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isBlocked ? 'Chiqarish' : 'Bloklash',
      confirmButtonColor: isBlocked ? '#10b981' : '#f59e0b',
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/toggle-user/${student.id}`);
        Swal.fire('Bajarildi!', `Foydalanuvchi holati o'zgardi`, 'success');
        fetchAllData();
      } catch (err) {
        Swal.fire('Xato', 'Statusni o\'zgartirib bo\'lmadi', 'error');
      }
    }
  };

  // --- 4. O'CHIRISH ---
  const handleDeleteUser = async (userId, name) => {
    const res = await Swal.fire({ title: 'O\'chirish?', text: `${name} o'chirilsinmi?`, icon: 'error', showCancelButton: true });
    if (res.isConfirmed) {
      try {
        await api.delete(`/admin/delete-user/${userId}`);
        fetchAllData();
      } catch (err) { Swal.fire('Xato', 'O\'chirilmadi', 'error'); }
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <FiRefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="font-bold text-slate-500 uppercase tracking-widest">Yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen pb-24 font-sans transition-all duration-700">
      <div className="max-w-7xl mx-auto">
        
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<FiUsers/>} label="O'quvchilar" value={`${stats.total_students} ta`} color="indigo" />
          <StatCard icon={<FiTrendingUp/>} label="Jami Tushum" value={`${stats.total_revenue.toLocaleString()} UZS`} color="emerald" />
          <StatCard icon={<FiAlertCircle/>} label="Qarzlar" value={`${stats.total_outstanding_debt.toLocaleString()} UZS`} color="rose" />
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Boshqaruv <span className="text-indigo-600 text-lg md:text-3xl">Paneli</span></h1>
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-md focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Talaba qidirish..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Talaba</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Kurs</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800">{s.fullname}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{s.email}</div>
                  </td>
                  <td className="px-8 py-5 text-center text-sm font-semibold text-slate-600">{s.course || '—'}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.is_active === false ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {s.is_active === false ? 'BLOKLANGAN' : 'FAOL'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <ActionButton icon={<FiUserCheck/>} color="indigo" onClick={() => handleMarkAttendance(s.id, s.fullname)} title="Davomat" />
                      <ActionButton icon={<FiDollarSign/>} color="emerald" onClick={() => handleAddPayment(s.id, s.fullname)} title="To'lov" />
                      <ActionButton 
                        icon={s.is_active === false ? <FiUnlock/> : <FiLock/>} 
                        color="amber" 
                        onClick={() => handleToggleBlock(s)} 
                        title={s.is_active === false ? "Blokdan chiqarish" : "Bloklash"} 
                      />
                      <ActionButton icon={<FiTrash2/>} color="rose" onClick={() => handleDeleteUser(s.id, s.fullname)} title="O'chirish" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const themes = {
    indigo: "bg-indigo-600 text-white shadow-indigo-200",
    emerald: "bg-emerald-500 text-white shadow-emerald-200",
    rose: "bg-rose-500 text-white shadow-rose-200"
  };
  return (
    <div className={`${themes[color]} p-8 rounded-[2rem] shadow-2xl flex items-center gap-6 hover:translate-y-[-4px] transition-all`}>
      <div className="text-4xl bg-white/20 p-4 rounded-2xl">{icon}</div>
      <div>
        <p className="opacity-80 text-xs font-bold uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, color, onClick, title }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-500",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-500",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-500"
  };
  return (
    <button onClick={onClick} title={title} className={`${styles[color]} p-3 rounded-xl transition-all hover:text-white active:scale-90 shadow-sm`}>
      {icon}
    </button>
  );
};

export default AdminDashboard;