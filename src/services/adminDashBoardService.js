import api from "./api";

const fetchAllDashboard = () => api.get("/api/Dashboard/dashboard");

export default fetchAllDashboard;
