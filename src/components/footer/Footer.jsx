import React from 'react';
import { FiPhone, FiMail, FiSend, FiHeart, FiMapPin, FiGlobe } from 'react-icons/fi';

const Footer = () => {
  return (
    /* bg-white o'rniga bg-white/40 va backdrop-blur ishlatildi */
    <footer className="bg-white/40 backdrop-blur-md border-t border-white/50 pt-16 pb-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white font-black shadow-xl shadow-indigo-200/50 rotate-3 hover:rotate-0 transition-transform duration-500 text-xl">
                T
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Turon Ta'lim</h3>
                <p className="text-[10px] font-bold text-indigo-500 tracking-[0.3em] uppercase opacity-70">Learning Center</p>
              </div>
            </div>
            <p className="text-slate-500 font-bold leading-relaxed text-xs uppercase tracking-wide opacity-80">
              Biz bilan kelajagingizni barpo eting. Zamonaviy texnologiyalar va tajribali ustozlar jamoasi.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Aloqa Markazi</h4>
            <div className="flex flex-col gap-4 items-center md:items-start">
              <a href="tel:+998889810206" className="group flex items-center gap-4 text-slate-600 hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-indigo-100 group-hover:scale-110 transition-all border border-slate-100">
                  <FiPhone size={16} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <span className="text-sm font-black tracking-tight">+998 88 981 02 06</span>
              </a>
              <a href="mailto:muham20021202@gmail.com" className="group flex items-center gap-4 text-slate-600 hover:text-indigo-600 transition-all">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-indigo-100 group-hover:scale-110 transition-all border border-slate-100">
                  <FiMail size={16} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <span className="text-sm font-black tracking-tight">muham20021202@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Section */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Biz Ijtimoiy Tarmoqda</h4>
            <div className="flex flex-col items-center md:items-start gap-5">
              <a 
                href="https://t.me/MuhammadDevelop" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 group"
              >
                <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Telegram Kanali
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <FiMapPin className="text-indigo-400" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Asaka, Turon ko'chasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-200/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Turon Ta'lim Systems
            </p>
          </div>
          
          <div className="group px-6 py-2.5 bg-white/50 rounded-full border border-white shadow-sm hover:shadow-md transition-all">
            <p className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
              Developed by <span className="text-indigo-600 group-hover:underline">Muhammaddiyor</span> 
              <FiHeart className="text-rose-500 fill-rose-500 animate-pulse" size={12} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;