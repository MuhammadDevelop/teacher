import React, { useEffect } from 'react'; // useEffect qo'shildi
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// Header va Footer faqat kerakli joyda chiqishi uchun yordamchi komponent
const LayoutWrapper = () => {
  const location = useLocation();

  // DARK MODE REFRESH BO'LGANDA SAQLANIB QOLISHI UCHUN
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Login va Register sahifalarida Header/Footer ko'rsatmaymiz
  const noLayoutPages = ['/login', '/register'];
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    // bg-[#F8FAFC] -> dark:bg-[#0F172A] qo'shildi
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      {showLayout && <Header />}
      
      <main className={`flex-grow flex flex-col ${showLayout ? 'w-full max-w-7xl mx-auto p-4 md:p-8' : ''}`}>
        <AppRoutes />
      </main>

      {showLayout && <Footer />}
    </div>
  );
};

function App() {
  return <LayoutWrapper />;
}

export default App;