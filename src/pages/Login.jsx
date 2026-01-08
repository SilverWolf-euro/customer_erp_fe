import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/StoreProvider";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_API}/api/Authenticate/Login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      if (data && data.status === 0 && data.object?.accessToken) {
        localStorage.setItem("accessToken", data.object.accessToken);
        localStorage.setItem("refreshToken", data.object.refreshToken);
        if (data.object.pages) {
          localStorage.setItem("pages", JSON.stringify(data.object.pages));
        }
        // Cập nhật context đăng nhập
        dispatch({
          type: "SET_USER",
          payload: {
            username,
            accessToken: data.object.accessToken,
            refreshToken: data.object.refreshToken,
            pages: data.object.pages || [],
          },
        });
        navigate("/debt-dashboard");
      } else {
        setError("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Chèn logo bên trên chữ E-HRM */}
        <div className="flex justify-center mb-2">
          <img src="/Logo.jpg" alt="Logo" className="h-16" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-4 text-red-600">
          E-DEBT
        </h2>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        <div>
          <label className="block mb-1 font-medium">Tên đăng nhập</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700"
        >
          Đăng nhập
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">
            Hoặc đăng nhập với
          </span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <button
          type="button"
          className="w-full bg-gray-200 text-gray-700 py-2 rounded font-semibold cursor-not-allowed"
          disabled
        >
          Tài khoản Microsoft
        </button>
      </form>
    </div>
  );
};

export default Login;
