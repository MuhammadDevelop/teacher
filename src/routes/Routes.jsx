import React, { useEffect } from 'react';
import { useRoutes, Navigate, useNavigate } from 'react-router-dom';
import Login from '../routes/login/Login';
import Register_temp from '../routes/register/Register_temp';
import StudentDashboard from '../routes/student/Student';
import AdminDashboard from '../routes/teacher/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // Token bo'lmasa, ogohlantirish berib, Register sahifasiga yuboramiz
      // Bu yerda alert qo'yish ixtiyoriy, foydalanuvchiga halaqit berishi mumkin
      navigate('/register', { replace: true });
    }
  }, [token, navigate]);

  return token ? children : null; 
};

const AppRoutes = () => {
  const token = localStorage.getItem('token');

  const routes = useRoutes([
    // Ochiq sahifalar (Header/Footer chiqmaydigan qismlar App.jsx da sozlangan)
    { path: '/login', element: <Login/> },
    { path: '/register', element: <Register_temp/> },
    
    // Himoyalangan Dashboardlar
    { 
      path: '/student/dashboard', 
      element: <PrivateRoute><StudentDashboard /></PrivateRoute> 
    },
    { 
      path: '/admin/dashboard', 
      element: <PrivateRoute><AdminDashboard/></PrivateRoute> 
    },

    // 1-QOIDANI O'ZGARTIRAMIZ: 
    // Sayt ochilganda ("/") agar login qilmagan bo'lsa, birinchi Register chiqadi
    { 
      path: '/', 
      element: token 
        ? <Navigate to="/student/dashboard" replace /> 
        : <Navigate to="/register" replace /> 
    },
    
    // Noto'g'ri manzil yozilsa ham Registerga yuborgan ma'qul (yoki Login)
    { path: '*', element: <Navigate to="/register" replace /> },
  ]);

  return routes;
};

export default AppRoutes;