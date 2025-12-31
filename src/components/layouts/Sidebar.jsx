import React, { useState, useEffect, useMemo } from "react";
import logo from "../../assets/images/logo.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  activeModule,
  collapsed,
  onUpdateActiveModule,
  onUpdateCollapsed,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const navigate = useNavigate();

  const pages = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("pages") || "[]");
    } catch {
      return [];
    }
  }, []);

  const singleItems = [

    {
      id: "debt-dashboard",
      name: "Tổng quan công nợ",
      icon: "M12 3L2 12h3v8h14v-8h3L12 3zm0 2.84L18.16 12H17v6H7v-6H5.84L12 5.84zM12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
    },
    {
      id: "debt",
      name: "Quản lý công nợ",
      icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    },
    {
      id: "customer-new",
      name: "Thêm khách hàng",
      icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    },
    {
      id: "sale-new",
      name: "Thêm Sale",
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    },
  ];


  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) setMobileOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      if (onUpdateCollapsed) onUpdateCollapsed(!collapsed);
    }
  };



  const selectMenuItem = (moduleId) => {
    if (onUpdateActiveModule) {
      onUpdateActiveModule(moduleId);
    }
    if (isMobile) setMobileOpen(false);
    // Điều hướng cho các module mới
    if (moduleId === "dashboard") navigate("/dashboard");
    else if (moduleId === "debt-dashboard") navigate("/debt-dashboard");
    else if (moduleId === "debt") navigate("/debt");
    else if (moduleId === "customer-new") navigate("/customer-new");
    else if (moduleId === "sale-new") navigate("/sale-new");
    // ...thêm các case khác nếu có
  };

  const isModuleActive = (moduleId) => {
    return activeModule === moduleId;
  };

  const getMenuItemClass = (moduleId) => {
    const base =
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative overflow-hidden group";
    const active = "bg-white/20 text-white shadow-lg";
    const inactive =
      "text-white/85 hover:bg-white/10 hover:text-white hover:translate-x-1";
    return `${base} ${isModuleActive(moduleId) ? active : inactive}`;
  };



  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [activeModule]);

  return (
    <>
      {/* Toggle button nếu cần, bạn có thể bổ sung */}

      <div
        className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-all duration-300 z-40 
          ${collapsed ? "w-16" : "w-64"} 
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-700 px-3">
          {!collapsed && <img src={logo} alt="Logo" className="h-10" />}
          <button
            onClick={() => toggleSidebar()}
            className="p-2 text-white hover:bg-gray-700 rounded"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu đơn */}
        <div className="p-2">
          {singleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => selectMenuItem(item.id)}
              className={getMenuItemClass(item.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={item.icon} />
              </svg>
              {!collapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>


        {/* Đã loại bỏ menu dropdown, chỉ còn menu đơn */}
      </div>
    </>
  );
}
