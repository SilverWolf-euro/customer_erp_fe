import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar.jsx";
import TopNavbar from "../components/layouts/Header.jsx";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState("debt-dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  // Map route to module key
  const routeModuleMap = {
    debt: "debt",
    "customer-new": "customer-new",
    "sale-new": "sale-new",
    dashboard: "dashboard",
    "debt-dashboard": "debt-dashboard",
  };

  // Page titles for each module
  const pageTitles = {
    debt: "Quản lý công nợ",
    "customer-new": "Thêm khách hàng",
    "sale-new": "Thêm Sale",
    dashboard: "KPI Công nợ",
    "debt-dashboard": "Tổng quan công nợ",
  };

  // Page descriptions for each module
  const pageDescriptions = {
    debt: "Quản lý các khoản công nợ",
    "customer-new": "Tạo mới khách hàng",
    "sale-new": "Tạo mới Sale",
    dashboard: "Bảng KPI công nợ",
    "debt-dashboard": "Bảng tổng quan công nợ",
  };

  const routeName = location.pathname.replace("/", "") || "debt-dashboard";
  const moduleKey = routeModuleMap[routeName] || "debt-dashboard";
  const pageTitle = pageTitles[moduleKey] || "EUROSTARK";
  const pageDescription =
    pageDescriptions[moduleKey] || "Hệ thống quản lý sản xuất";

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };


  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    // Map moduleId to route
    const routeMap = {
      debt: "/debt",
      "customer-new": "/customer-new",
      "sale-new": "/sale-new",
      dashboard: "/dashboard",
      "debt-dashboard": "/debt-dashboard",
    };
    const targetRoute = routeMap[moduleId];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };


  const updateActiveModuleFromRoute = () => {
    const routeName = location.pathname.replace("/", "") || "debt-dashboard";
    const moduleKey = routeModuleMap[routeName] || "debt-dashboard";
    setActiveModule(moduleKey);
  };

  useEffect(() => {
    checkMobile();
    updateActiveModuleFromRoute();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    updateActiveModuleFromRoute();
  }, [location.pathname]);

  return (
    <div className="app-container">
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          activeModule={activeModule}
          collapsed={sidebarCollapsed}
          onUpdateActiveModule={handleModuleChange}
          onUpdateCollapsed={setSidebarCollapsed}
        />

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 flex flex-col ${sidebarCollapsed && !isMobile ? "ml-16" : "ml-0 lg:ml-64"
            }`}
          style={{ overflowY: "auto", height: "100vh" }} // Ensure the content area is scrollable
        >
          <TopNavbar pageTitle={pageTitle} pageDescription={pageDescription} />
          <main className="flex-1 px-6 pt-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
