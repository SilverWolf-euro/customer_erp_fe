import React, { useEffect, useState } from 'react';
import fetchAllDashboard from '../services/adminDashBoardService';
import DebtKPIDashboard from './DebtKPIDashboard';
import {
  Bar,
  Line,
  Pie,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const DebtDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (customerId) params.customerId = customerId;
        if (fromMonth) params.fromMonth = fromMonth;
        if (toMonth) params.toMonth = toMonth;
        const response = await fetchAllDashboard({ params });
        setData(response.data.object);
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId, fromMonth, toMonth]);

  // Helper for month labels
  const getMonthLabels = (arr) => arr?.map((item) => item.monthKey);

  // Tổng công nợ phải thu theo tháng (Bar + Line)
  const debtByMonthBarData = {
    labels: getMonthLabels(data?.debtByMonth || []),
    datasets: [
      {
        label: 'Tổng công nợ',
        data: data?.debtByMonth?.map((item) => item.remainingAmount) || [],
        backgroundColor: '#3b82f6',
        yAxisID: 'y',
      },
      {
        label: '% tăng trưởng',
        data: data?.debtByMonth?.map((item) => item.moMPercent || 0),
        type: 'line',
        borderColor: '#f59e42',
        backgroundColor: '#f59e42',
        yAxisID: 'y1',
      },
    ],
  };

  const debtByMonthBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Số tiền (₫)' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: '% tăng trưởng' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  // Phân bổ công nợ quá hạn theo tháng (Stacked Bar)
  const overdueBuckets = ['1-7', '8-15', '16-30', '31-60', '61-90', '>90'];
  const overdueColors = ['#22c55e', '#fde047', '#f59e42', '#f87171', '#ef4444', '#991b1b'];
  const overdueByMonth = {};
  (data?.overdueAgingByMonth || []).forEach((item) => {
    if (!overdueByMonth[item.monthKey]) overdueByMonth[item.monthKey] = {};
    overdueByMonth[item.monthKey][item.bucket] = item.amount;
  });
  const overdueBarData = {
    labels: Object.keys(overdueByMonth),
    datasets: overdueBuckets.map((bucket, idx) => ({
      label: bucket + ' ngày',
      data: Object.values(overdueByMonth).map((month) => month[bucket] || 0),
      backgroundColor: overdueColors[idx],
      stack: 'Stack 0',
    })),
  };
  const overdueBarOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  // Tỷ trọng công nợ theo khách hàng (Pie)
  const debtSharePieData = {
    labels: data?.debtShareByCustomer?.map((c) => c.customerName) || [],
    datasets: [
      {
        data: data?.debtShareByCustomer?.map((c) => c.percent) || [],
        backgroundColor: [
          '#3b82f6', '#f59e42', '#22c55e', '#ef4444', '#fde047', '#a78bfa', '#f87171', '#16a34a', '#991b1b', '#64748b',
        ],
      },
    ],
  };

  // Tổng hợp trạng thái công nợ (Pie)
  const statusPieData = {
    labels: data?.debtStatusSummary?.map((s) => {
      switch (s.status) {
        case 'paid': return 'Đã thu';
        case 'coming-due': return 'Sắp đến hạn';
        case 'overdue': return 'Quá hạn';
        case 'not-due-yet': return 'Chưa đến hạn';
        default: return s.status;
      }
    }) || [],
    datasets: [
      {
        data: data?.debtStatusSummary?.map((s) => s.percent) || [],
        backgroundColor: ['#22c55e', '#fde047', '#ef4444', '#3b82f6'],
      },
    ],
  };

  // Top 5 khách hàng công nợ cao nhất tháng (Stacked Bar)
  const top5ByMonth = {};
  (data?.top5CustomersByMonth || []).forEach((item) => {
    if (!top5ByMonth[item.monthKey]) top5ByMonth[item.monthKey] = [];
    top5ByMonth[item.monthKey].push(item);
  });
  const top5Labels = Object.keys(top5ByMonth);
  const allCustomers = Array.from(new Set((data?.top5CustomersByMonth || []).map((c) => c.customerName)));
  const top5BarData = {
    labels: top5Labels,
    datasets: allCustomers.map((name, idx) => ({
      label: name,
      data: top5Labels.map((month) => {
        const found = top5ByMonth[month].find((c) => c.customerName === name);
        return found ? found.amount : 0;
      }),
      backgroundColor: overdueColors[idx % overdueColors.length],
      stack: 'Stack 0',
    })),
  };
  const top5BarOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  // Bộ lọc
  const customerOptions = data?.debtShareByCustomer?.map((c) => ({ value: c.customerID, label: c.customerName }));

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Dashboard Công nợ</h2>
      {/* KPI Cards */}
      <DebtKPIDashboard />
      {/* Filters */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm mb-1">Khách hàng</label>
          <select
            className="border rounded px-2 py-1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Tất cả khách hàng</option>
            {customerOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Từ tháng</label>
          <input
            type="month"
            className="border rounded px-2 py-1"
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Đến tháng</label>
          <input
            type="month"
            className="border rounded px-2 py-1"
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
          />
        </div>
      </div>
      {/* Charts */}
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Tổng công nợ phải thu theo tháng</h3>
            <Bar data={debtByMonthBarData} options={debtByMonthBarOptions} />
          </div>
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Phân bổ công nợ quá hạn theo tháng</h3>
            <Bar data={overdueBarData} options={overdueBarOptions} />
          </div>
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Tỷ trọng công nợ theo khách hàng</h3>
            <Pie data={debtSharePieData} />
          </div>
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Tổng hợp trạng thái công nợ</h3>
            <Pie data={statusPieData} />
          </div>
          <div className="bg-white rounded shadow p-4 col-span-2">
            <h3 className="font-semibold mb-2">Top 5 khách hàng có công nợ cao nhất theo tháng</h3>
            <Bar data={top5BarData} options={top5BarOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDashboard;
