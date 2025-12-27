import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

const LayoutWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    // Dark mode-ni butkul o'chiramiz va yorqin mavzuni o'rnatamiz
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    
    // Sahifa scroll bo'lganda silliq harakatlanishi uchun
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const noLayoutPages = ['/login', '/register'];
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    /* FON: Faqat oq emas, juda och havograng va binafsha gradient ishlatildi.
       Bu veb-saytga "toza" va "zamonaviy" ko'rinish beradi.
    */
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FDFDFF] via-[#F4F7FF] to-[#F1F4FF] selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Agar layout ko'rinishi kerak bo'lsa, Header chiqadi */}
      {showLayout && <Header />}
      
      {/* Asosiy kontent qismi. 
         Glassmorphism effekti uchun orqa fon biroz xiralashtirilgan bo'lishi mumkin 
      */}
      <main className={`flex-grow flex flex-col transition-all duration-500 ${
        showLayout 
          ? 'w-full max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-10' 
          : 'w-full'
      }`}>
        <div className={showLayout ? "animate-in fade-in slide-in-from-bottom-4 duration-700" : ""}>
          <AppRoutes />
        </div>
      </main>

      {showLayout && <Footer />}
    </div>
  );
};

function App() {
  return <LayoutWrapper />;
}

export default App;