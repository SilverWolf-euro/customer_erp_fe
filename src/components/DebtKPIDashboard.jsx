import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fetchAllDashboard from '../services/adminDashBoardService.js';

const DebtKPIDashboard = () => {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const response = await fetchAllDashboard();
        if (response.data?.object?.kpi) {
          setKpi(response.data.object.kpi);
        }
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu KPI');
      } finally {
        setLoading(false);
      }
    };
    fetchKPI();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;
  if (!kpi) return <div>Không có dữ liệu KPI</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* 1. TỔNG CÔNG NỢ CÒN LẠI */}
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">TỔNG CÔNG NỢ CÒN LẠI</div>
        <div className="text-xl font-bold text-blue-600">VNĐ:{kpi.totalOutstanding_VND?.toLocaleString()} ₫</div>
        <div className="text-xl font-bold text-blue-600">USD:{kpi.totalOutstanding_USD?.toLocaleString()} $</div>
      </div>
      {/* 2. CÔNG NỢ ĐẾN HẠN TRONG THÁNG */}
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">CÔNG NỢ ĐẾN HẠN TRONG THÁNG</div>
        <div className="text-xl font-bold text-green-600">VNĐ:{kpi.dueThisMonth_VND?.toLocaleString()} ₫</div>
        <div className="text-xl font-bold text-green-600">USD:{kpi.dueThisMonth_USD?.toLocaleString()} $</div>
      </div>
      {/* 3. CÔNG NỢ SẮP ĐẾN HẠN */}
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">CÔNG NỢ SẮP ĐẾN HẠN(7 NGÀY)</div>
        <div className="text-xl font-bold text-yellow-600">VNĐ:{kpi.comingDueAmount_VND?.toLocaleString()} ₫</div>
        <div className="text-xl font-bold text-yellow-600">USD:{kpi.comingDueAmount_USD?.toLocaleString()} $</div>
        <div className="text-xs text-gray-400">Số lượng: {kpi.comingDueCount_VND} (VND) / {kpi.comingDueCount_USD} (USD)</div>
      </div>
      {/* 4. CÔNG NỢ QUÁ HẠN */}
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">CÔNG NỢ QUÁ HẠN</div>
        <div className="text-xl font-bold text-red-600">VNĐ:{kpi.overdueAmount_VND?.toLocaleString()} ₫</div>
        <div className="text-xl font-bold text-red-600">USD:{kpi.overdueAmount_USD?.toLocaleString()} $</div>
        <div className="text-xs text-gray-400">Số lượng: {kpi.overdueCount_VND} (VND) / {kpi.overdueCount_USD} (USD)</div>
      </div>
    </div>
  );
};

export default DebtKPIDashboard;
