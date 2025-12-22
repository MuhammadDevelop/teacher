import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiUser, FiBell, FiMenu, FiX, FiHome, FiBook, FiSettings, FiMoon, FiSun } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Foydalanuvchi');
  const [userRole, setUserRole] = useState('O\'QUVCHI PANELI');
  
  // DARK MODE HOOK - Localstorage bilan bog'langan
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // 1. Ism va Rolni olish logikasi
    const storedName = localStorage.getItem('userFullname') || localStorage.getItem('userName');
    const token = localStorage.getItem('token');

    if (storedName) setUserName(storedName);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Agar tokenda ism bo'lsa va localstorage-da bo'lmasa, tokendagini olamiz
        if (!storedName) {
           setUserName(decoded.fullname || decoded.full_name || 'Foydalanuvchi');
        }
        // Rolni aniqlash
        setUserRole(decoded.role === 'admin' ? 'ADMIN PANEL' : 'O\'QUVCHI PANELI');
      } catch (e) { 
        console.error("Token decode xatosi:", e); 
      }
    }

    // 2. DARK MODE QO'LLASH (Tailwind 'dark' class orqali)
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Bosh sahifa', path: '/', icon: <FiHome /> },
    { name: 'Kurslar', path: '/courses', icon: <FiBook /> },
    { name: 'Mening profilim', path: '/profile', icon: <FiUser /> },
    { name: 'Sozlamalar', path: '/settings', icon: <FiSettings /> },
  ];

  return (
    <>
      <header className="h-16 md:h-20 bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-slate-800 sticky top-0 z-[100] px-4 md:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* CHAP TOMON: Burger + Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 md:hidden text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <FiMenu size={24} />
            </button>
            
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none">
               T
              </div>
              <span className="font-black text-gray-800 dark:text-white text-lg md:text-xl tracking-tight hidden xs:block">
                Smart <span className="text-indigo-600">LMS</span>
              </span>
            </Link>
          </div>

          {/* O'NG TOMON: Theme Toggle + Profil */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* DARK MODE TUGMASI */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent dark:border-slate-700"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            <button className="p-2.5 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hidden sm:block">
              <FiBell size={20} />
            </button>

            <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 mx-1 hidden md:block"></div>

            {/* Profil bloki */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <h4 className="text-sm font-black text-[#1E293B] dark:text-slate-200 leading-none uppercase tracking-tight">
                  {userName}
                </h4>
                <p className="text-[10px] font-bold text-emerald-500 mt-1.5 tracking-wider">
                  {userRole}
                </p>
              </div>

              {/* Ism birinchi harfi bilan dinamik avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 dark:shadow-none border-2 border-white dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>

              <button 
                onClick={handleLogout}
                className="p-2.5 text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors hidden md:block"
              >
                <FiLogOut size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[110] ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className={`absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-[#1E293B] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-indigo-50/30 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">OM</div>
              <span className="font-black text-gray-800 dark:text-white tracking-tight text-lg">Smart LMS</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 bg-white dark:bg-slate-700 shadow-sm rounded-full">
              <FiX size={18} />
            </button>
          </div>

          <nav className="flex-1 p-5 space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
            <div className="flex items-center gap-3 mb-5 p-2 rounded-2xl border border-gray-50 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-800 dark:text-slate-200 text-sm truncate uppercase">{userName}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{userRole}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all"
            >
              <FiLogOut size={18} /> Tizimdan chiqish
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;