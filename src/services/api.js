// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API, // lấy từ .env cho CRA
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Nếu cần token thì mở interceptor này
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });


export default api;
