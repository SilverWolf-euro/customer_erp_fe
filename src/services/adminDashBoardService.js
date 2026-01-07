// adminDashBoardService.js
import api from './api';

const fetchAllDashboard = (params) => {
  return api.get('/api/Dashboard/dashboard', { params });
};

export default fetchAllDashboard;