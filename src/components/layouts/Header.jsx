// Header.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Giải mã JWT, hỗ trợ Unicode cho tên tiếng Việt
function decodeJWT(token) {
  if (!token) return {};
  try {
    const payload = token.split('.')[1];
    // Chuyển base64url về base64
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Bổ sung padding nếu thiếu
    while (base64.length % 4) base64 += '=';
    // Giải mã Unicode
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}


export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
   
  ]);

  const userMenuItems = [
    { icon: "👤", label: "Hồ sơ", action: "profile" },
    { icon: "⚙️", label: "Cài đặt", action: "settings" },
    { icon: "🔒", label: "Đổi mật khẩu", action: "changePassword" },
  ];

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    setShowUserMenu(false);
    // navigate nếu cần
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowUserMenu(false);
    navigate("/login");
  };

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("vi-VN"));
    setCurrentTime(
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-md sticky top-0 z-10">
      {/* Search */}
      <div className="relative w-48 md:w-60 lg:w-72">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100"
          >
            <span className="text-xl">🔔</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-[1.125rem] h-[1.125rem] rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 md:-right-2 w-72 md:w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 m-0">
                  Thông báo
                </h3>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between transition-colors duration-200 cursor-pointer hover:bg-gray-50 ${
                      !notification.read
                        ? "bg-blue-50 hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1 text-sm">
                        {notification.title}
                      </div>
                      <div className="text-gray-600 text-xs mb-1">
                        {notification.message}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full ml-3"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-3 py-3 text-center border-t border-gray-200">
                <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                  Xem tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chào mừng tên người dùng + Đăng xuất */}
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-2xl bg-white border border-gray-200">
          {/* Lấy accessToken từ localStorage và decode */}
          {(() => {
            const accessToken = localStorage.getItem("accessToken") || "";
            const userInfo = decodeJWT(accessToken);
            const fullName = userInfo.unique_name || "Người dùng";
            return (
              <span className="font-semibold text-blue-600">Chào mừng, {fullName}</span>
            );
          })()}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span className="text-base">🚪</span>
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
