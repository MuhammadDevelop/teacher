import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogOut, FiBell, FiMenu, FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiUser } from 'react-icons/fi';
import api from '../../api/axios'; 

const Header = () => {
  const navigate = useNavigate();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState('Talaba');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/my-stats');
        setStats(res.data);
        const storedName = localStorage.getItem('userFullname') || localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
      } catch (e) {
        console.error("Xatolik:", e);
      }
    };
    fetchData();
  }, []);

  const hasDebt = stats?.remaining_debt > 0;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Header: Glassmorphism effekti bilan */}
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-[100] px-4 md:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* Logo qismi */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white font-black shadow-xl shadow-indigo-200/50 group-hover:rotate-6 transition-transform duration-500 text-xl">
                T
              </div>
              <div className="hidden sm:block">
                <h1 className="font-black text-slate-800 text-lg leading-none tracking-tighter uppercase">Turon Ta'lim</h1>
                <p className="text-[10px] font-bold text-indigo-500 tracking-[0.2em] uppercase opacity-70"></p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            
            {/* NOTIFICATION SECTION */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                className={`p-3 rounded-2xl transition-all border-2 relative group ${
                  hasDebt 
                  ? 'text-rose-500 bg-rose-50 border-rose-100 animate-pulse' 
                  : 'text-indigo-500 bg-indigo-50 border-indigo-100'
                }`}
              >
                <FiBell size={20} className="group-hover:rotate-12 transition-transform" />
                {hasDebt && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* MODAL OYNA */}
              {isNotifyOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifyOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(79,70,229,0.15)] border border-indigo-50 p-6 z-20 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Xabarnoma</h3>
                      <button onClick={() => setIsNotifyOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors">
                        <FiX className="text-slate-400" />
                      </button>
                    </div>

                    {hasDebt ? (
                      <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-rose-50 to-white rounded-[1.5rem] border border-rose-100">
                          <FiAlertTriangle size={24} className="text-rose-500 mb-3" />
                          <h4 className="font-black text-rose-600 uppercase text-[10px] mb-2 tracking-widest">To'lov kechikmoqda!</h4>
                          <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">
                            Qarzdorlik: <span className="text-rose-600 underline">{stats.remaining_debt?.toLocaleString()} so'm</span>. Iltimos, to'lovni amalga oshiring.
                          </p>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">
                          To'lov sahifasiga o'tish
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-[1.5rem] border border-emerald-100 flex flex-col items-center text-center">
                        <FiCheckCircle size={32} className="text-emerald-500 mb-3" />
                        <h4 className="font-black text-emerald-600 uppercase text-[10px] tracking-widest">Hammasi joyida!</h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Sizda faol qarzdorlik mavjud emas.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200/60 hidden md:block"></div>

            {/* PROFIL SECTION */}
            <div className="flex items-center gap-4 group cursor-pointer" onClick={handleLogout}>
               <div className="text-right hidden md:block">
                  <p className="text-[11px] font-black text-slate-800 uppercase leading-none tracking-tighter">{userName}</p>
                  <p className={`text-[9px] font-black mt-1 tracking-widest flex items-center justify-end gap-1 ${hasDebt ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {hasDebt ? 'QARZ' : 'FAOL'} <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  </p>
               </div>
               <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm border border-indigo-50 group-hover:border-indigo-200 transition-all overflow-hidden">
                    {userName.charAt(0).toUpperCase()}
                    {/* Logout Hover Overlay */}
                    <div className="absolute inset-0 bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiLogOut size={18} />
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

export default Header;