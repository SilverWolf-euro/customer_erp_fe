import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../pages/MainLayout.jsx";
import { useAuthStore } from "../store/StoreProvider.jsx";

import Login from "../pages/Login.jsx";
import Debt from "../pages/debt.tsx";
import CustomerNew from "../components/customer-new.tsx";
import SaleNew from "../components/sale-new.tsx";
import DebtKPIDashboard from "../components/DebtKPIDashboard.jsx";
import DebtDashboard from "../components/DebtDashboard.jsx";


function PrivateRoute({ children, page, publicRoute }) {
  const auth = useAuthStore();

  if (!publicRoute && !auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền truy cập page dựa vào danh sách pages từ API login
  if (page && Array.isArray(auth.pages)) {
    if (!auth.pages.includes(page)) {
      // Nếu không có quyền, chuyển về dashboard hoặc trang đầu tiên có quyền
      const firstPage = auth.pages && auth.pages.length > 0 ? `/${auth.pages[0]}` : "/dashboard";
      return <Navigate to={firstPage} replace />;
    }
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Route login ngoài MainLayout */}
      <Route path="/login" element={<Login />} />

      {/* Main Layout for other routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path="/debt" element={<PrivateRoute page="debt"><Debt /></PrivateRoute>} />
        <Route path="/customer-new" element={<PrivateRoute page="customer-new"><CustomerNew /></PrivateRoute>} />
        <Route path="/sale-new" element={<PrivateRoute page="sale-new"><SaleNew /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute page="dashboard"><DebtKPIDashboard /></PrivateRoute>} />
        <Route path="/debt-dashboard" element={<PrivateRoute page="debt-dashboard"><DebtDashboard /></PrivateRoute>} />

        {/* Catch-all route for "Not Found" */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
}
