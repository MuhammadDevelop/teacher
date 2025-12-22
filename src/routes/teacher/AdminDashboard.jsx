import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { 
  FiSearch, FiUserCheck, FiEdit2, FiTrash2, FiDollarSign 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/report');
      setStudents(res.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Xatolik',
        text: "Ma'lumotlarni yuklashda xato yuz berdi!",
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- DAVOMAT TARIXINI KO'RISH ---
  const showAttendanceHistory = (student) => {
    const history = student.attendance || [];
    
    if (history.length === 0) {
      Swal.fire('Ma\'lumot yo\'q', 'Bu o\'quvchi hali darslarga qatnashmagan.', 'info');
      return;
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyHtml = `
      <div style="max-height: 400px; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 10px; text-align: left;">Sana</th>
              <th style="padding: 10px; text-align: center;">Dars</th>
              <th style="padding: 10px; text-align: right;">Holat</th>
            </tr>
          </thead>
          <tbody>
            ${sortedHistory.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; text-align: left; font-weight: bold;">${item.date}</td>
                <td style="padding: 10px; text-align: center;">${item.lesson}-dars</td>
                <td style="padding: 10px; text-align: right;">
                  <span style="color: ${item.status === 'keldi' ? '#10b981' : '#ef4444'}; font-weight: 900;">
                    ${item.status === 'keldi' ? 'KELDI ✅' : 'KELMADI ❌'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: `<span style="font-size: 18px;">${student.fullname}</span><br><small style="color: #64748b;">Davomat Tarixi</small>`,
      html: historyHtml,
      width: '500px',
      confirmButtonText: 'Yopish',
      confirmButtonColor: '#6366f1'
    });
  };

  // --- O'CHIRISH ---
  const handleDeleteUser = async (userId, name) => {
    const result = await Swal.fire({
      title: 'Ishonchingiz komilmi?',
      text: `${name} tizimdan butunlay o'chiriladi!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Ha, o\'chirilsin!',
      cancelButtonText: 'Bekor qilish',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setActionLoading(userId);
      try {
        await api.delete(`/admin/user/${userId}`);
        Swal.fire({ icon: 'success', title: 'O\'chirildi!', timer: 1500, showConfirmButton: false });
        fetchAllData();
      } catch (err) {
        Swal.fire('Xatolik!', 'Foydalanuvchini o\'chirib bo\'lmadi.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // --- TO'LOV ---
  const handleUpdatePayment = async (student) => {
    const isNew = !student.payments || student.payments.length === 0;
    const currentAmount = isNew ? "500000" : student.payments[student.payments.length - 1].amount;

    const { value: amount } = await Swal.fire({
      title: isNew ? 'Yangi to\'lov' : 'To\'lovni tahrirlash',
      text: `${student.fullname} uchun summa (so'mda):`,
      input: 'number',
      inputValue: currentAmount,
      showCancelButton: true,
      confirmButtonText: 'Saqlash',
      cancelButtonText: 'Bekor qilish',
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (!value || isNaN(value)) return 'Iltimos, to\'g\'ri summa kiriting!';
      }
    });

    if (amount) {
      setActionLoading(student.id);
      try {
        if (isNew) {
          await api.post(`/admin/payment/add/${student.id}?amount=${amount}`);
          Swal.fire('Tayyor!', 'Yangi to\'lov qo\'shildi.', 'success');
        } else {
          const lastPaymentId = student.payments[student.payments.length - 1].id;
          await api.put(`/admin/payment/${lastPaymentId}?amount=${amount}`);
          Swal.fire('Yangilandi!', 'To\'lov miqdori o\'zgartirildi.', 'success');
        }
        fetchAllData();
      } catch (err) {
        Swal.fire('Xatolik!', 'To\'lovni saqlashda xato.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // --- DAVOMAT QILISH ---
  const handleAdminAttendance = async (studentId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Davomat belgilash',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <label style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase;">Sana tanlang:</label>
          <input id="swal-input-date" type="date" class="swal2-input" style="margin-top: 5px;" value="${new Date().toISOString().split('T')[0]}">
          
          <label style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; margin-top: 15px; display: block;">Dars raqami:</label>
          <input id="swal-input-lesson" type="number" class="swal2-input" style="margin-top: 5px;" placeholder="Dars raqami" value="1">
          
          <label style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; margin-top: 15px; display: block;">Holat:</label>
          <select id="swal-input-status" class="swal2-input" style="margin-top: 5px;">
            <option value="keldi">Keldi ✅</option>
            <option value="kelmadi">Kelmadi ❌</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Saqlash',
      cancelButtonText: 'Bekor qilish',
      preConfirm: () => {
        return {
          date: document.getElementById('swal-input-date').value,
          lesson: document.getElementById('swal-input-lesson').value,
          status: document.getElementById('swal-input-status').value
        }
      }
    });

    if (formValues) {
      const { date, lesson, status } = formValues;
      setActionLoading(studentId);
      try {
        await api.post(`/admin/attendance/mark?user_id=${studentId}&lesson=${lesson}&date=${date}&status=${status}`);
        Swal.fire({
          icon: 'success',
          title: 'Davomat saqlandi!',
          text: `${date} sanasi uchun belgilandi.`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        fetchAllData();
      } catch (err) {
        Swal.fire('Xatolik!', 'Davomatni saqlashda xato.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen pb-20 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Admin <span className="text-indigo-600">Panel</span>
            </h1>
            <p className="text-gray-400 text-sm font-bold tracking-wide uppercase">O'quvchilar: {students.length}</p>
          </div>
          
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Ism bo'yicha qidirish..." 
              className="w-full md:w-80 pl-12 pr-4 py-3.5 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredStudents.map(student => (
            <div key={student.id} className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-opacity ${actionLoading === student.id ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                    {student.fullname.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 leading-none mb-1">{student.fullname}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{student.email}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteUser(student.id, student.fullname)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-colors">
                  <FiTrash2 size={18} />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex justify-between items-center">
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Jami To'lov</p>
                  <p className="font-black text-emerald-600 text-sm tracking-tight">{student.total_paid?.toLocaleString()} UZS</p>
                </div>
                <div className="text-center cursor-pointer" onClick={() => showAttendanceHistory(student)}>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Darslar</p>
                  <p className="font-black text-indigo-600 text-sm underline decoration-dotted">{student.attendance?.length || 0} ta</p>
                </div>
                <button onClick={() => handleUpdatePayment(student)} className="p-3 bg-white rounded-xl shadow-sm text-indigo-500 hover:scale-110 transition-transform">
                  <FiDollarSign size={18} />
                </button>
              </div>

              <button 
                onClick={() => handleAdminAttendance(student.id)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FiUserCheck size={18}/> Davomat qilish
              </button>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-slate-700">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'quvchi</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">To'lov</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Davomat</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map(student => (
                <tr key={student.id} className={`hover:bg-gray-50/30 transition-all group ${actionLoading === student.id ? 'opacity-50' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl text-white flex items-center justify-center font-black text-sm">
                        {student.fullname.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-sm">{student.fullname}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className={`font-black text-sm ${student.total_paid > 0 ? 'text-emerald-600' : 'text-rose-400'}`}>
                        {student.total_paid?.toLocaleString()} UZS
                      </span>
                      <button onClick={() => handleUpdatePayment(student)} className="p-2 text-gray-300 hover:text-indigo-600 transition-all">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => showAttendanceHistory(student)}
                      className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      {student.attendance?.length || 0} dars (ko'rish)
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleAdminAttendance(student.id)} className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <FiUserCheck size={20} />
                      </button>
                      <button onClick={() => handleDeleteUser(student.id, student.fullname)} className="bg-rose-50 text-rose-500 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <FiTrash2 size={20} />
                      </button>
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

export default AdminDashboard;