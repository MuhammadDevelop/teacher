import React from 'react';
import { FiPhone, FiMail, FiSend, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    // bg-white -> dark:bg-[#0F172A] | border-gray-100 -> dark:border-slate-800
    <footer className="bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-slate-800 pt-16 pb-8 px-4 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">Turon Talim o'quv markazi</h3>
            <p className="text-gray-400 dark:text-slate-400 font-medium leading-relaxed">
              Biz bilan ta'lim olish oson va samarali. Tizim orqali darslaringizni nazorat qiling.
            </p>
          </div>

          {/* Quick Links / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Bog'lanish</h4>
            <div className="flex flex-col gap-3 items-center md:items-start">
              <a href="tel:+998889810206" className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors group">
                {/* Ikonka foni: bg-gray-50 -> dark:bg-slate-800 */}
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:scale-110 transition-all">
                  <FiPhone />
                </div>
                +998 88 981 02 06
              </a>
              <a href="mailto:muham20021202@gmail.com" className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:scale-110 transition-all">
                  <FiMail />
                </div>
                muham20021202@gmail.com
              </a>
            </div>
          </div>

          {/* Social / Telegram */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Ijtimoiy tarmoq</h4>
            <a 
              href="https://t.me/MuhammadDevelop" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-sky-500 text-white rounded-2xl font-black hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-none transition-all active:scale-95 group"
            >
              <FiSend className="group-hover:rotate-12 transition-transform" />
              Telegramda yozish
            </a>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-gray-50 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Barcha huquqlar himoyalangan.
          </p>
          <p className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm font-medium">
            Made with <FiHeart className="text-rose-500 fill-rose-500 animate-pulse" /> by Muhammaddiyor
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;