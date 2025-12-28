import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiBell, FiCheckCircle, FiAlertTriangle, FiX, FiChevronRight } from 'react-icons/fi';
import api from '../../api/axios';

const Header = () => {
  const navigate = useNavigate();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/my-stats');
        setStats(res.data);
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
    <header className="h-20 md:h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-[100] px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform duration-300 text-xl">
              T
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-800 text-sm md:text-lg leading-none tracking-tighter uppercase italic">Turon Ta'lim</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase italic">Student Portal</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="flex items-center gap-3 md:gap-5">
          
          {/* BILDIRISHNOMALAR */}
          <div className="relative">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              className={`p-3 md:p-3.5 rounded-2xl transition-all border relative ${
                hasDebt 
                ? 'text-rose-500 bg-rose-50 border-rose-100 shadow-lg shadow-rose-100/50' 
                : 'text-indigo-500 bg-indigo-50 border-indigo-100 shadow-lg shadow-indigo-100/50'
              }`}
            >
              <FiBell size={20} className={hasDebt ? 'animate-bounce' : ''} />
              {hasDebt && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white"></span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotifyOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10 bg-slate-900/10 md:bg-transparent" 
                    onClick={() => setIsNotifyOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-72 xs:w-80 bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.1)] border border-slate-100 p-6 z-[110] origin-top-right"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.3em]">Xabarnoma</h3>
                      <button onClick={() => setIsNotifyOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <FiX size={16} />
                      </button>
                    </div>

                    {hasDebt ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-rose-50 rounded-3xl border-2 border-dashed border-rose-200">
                          <div className="flex items-center gap-3 mb-2 text-rose-600">
                            <FiAlertTriangle size={18} />
                            <h4 className="font-black uppercase text-[10px] tracking-wider italic">To'lov muddati!</h4>
                          </div>
                          <p className="text-[10px] font-black text-slate-600 leading-tight uppercase">
                            Qarz: <span className="text-rose-600">{stats?.remaining_debt?.toLocaleString()} so'm</span>
                          </p>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                          TO'LASH <FiChevronRight />
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center">
                        <FiCheckCircle size={40} className="text-emerald-500 mb-3" />
                        <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Hozircha bo'sh</h4>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-[1.5px] bg-slate-100 mx-1"></div>

          {/* CHIQISH TUGMASI (MINIMALIST) */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <FiLogOut size={16} />
            <span className="hidden sm:inline italic">Chiqish</span>
          </motion.button>

        </div>
      </div>
    </header>
  );
};

export default Header;