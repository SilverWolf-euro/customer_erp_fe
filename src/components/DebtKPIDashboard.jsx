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
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">Tổng công nợ phải thu tháng này</div>
        <div className="text-xl font-bold text-blue-600">{kpi.totalDebtThisMonth?.toLocaleString()} ₫</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">Tỷ lệ đã thu tháng này</div>
        <div className="text-xl font-bold text-green-600">{kpi.collectedRateThisMonth}%</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">Sắp đến hạn</div>
        <div className="text-xl font-bold text-yellow-600">{kpi.comingDueAmount?.toLocaleString()} ₫</div>
        <div className="text-xs text-gray-400">Số lượng: {kpi.comingDueCount}</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">Công nợ quá hạn</div>
        <div className="text-xl font-bold text-red-600">{kpi.overdueAmount?.toLocaleString()} ₫</div>
        <div className="text-xs text-gray-400">Số lượng: {kpi.overdueCount}</div>
      </div>
    </div>
  );
};

export default DebtKPIDashboard;
