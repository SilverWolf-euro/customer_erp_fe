import React, { useState } from 'react';

interface Sale {
  SaleID?: number;
  SaleName: string;
  Email: string;
  Phone: string;
  Initials: string;
}

const initialForm: Sale = {
  SaleName: '',
  Email: '',
  Phone: '',
  Initials: '',
};

const mockSales: Sale[] = [
  { SaleID: 1, SaleName: 'Nguyễn Văn A', Email: 'a@email.com', Phone: '0123456789', Initials: 'NVA' },
  { SaleID: 2, SaleName: 'Trần Thị B', Email: 'b@email.com', Phone: '0987654321', Initials: 'TTB' },
];

const SaleNew: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Sale>(initialForm);
  const [search, setSearch] = useState('');

  const handleOpenModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSale: Sale = {
      ...form,
      SaleID: sales.length ? (sales[sales.length - 1].SaleID || 0) + 1 : 1,
    };
    setSales([...sales, newSale]);
    setShowModal(false);
  };

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.SaleName.toLowerCase().includes(q) ||
      s.Email.toLowerCase().includes(q) ||
      s.Phone.toLowerCase().includes(q) ||
      s.Initials.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <div className="flex-1 flex items-center">
              <h2 className="text-2xl font-bold mr-4 whitespace-nowrap">Danh sách Sale</h2>
              <div className="flex w-full max-w-xs gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm Sale..."
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 flex items-center justify-center hover:bg-blue-100 text-gray-500 hover:text-blue-600"
                  tabIndex={0}
                  aria-label="Tìm kiếm"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
              onClick={handleOpenModal}
            >
              Tạo mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b border-l first:rounded-tl-lg last:rounded-tr-lg border-gray-200">#</th>
                  <th className="py-2 px-4 border-b border-l border-gray-200">Tên Sale</th>
                  <th className="py-2 px-4 border-b border-l border-gray-200">Email</th>
                  <th className="py-2 px-4 border-b border-l border-gray-200">Số điện thoại</th>
                  <th className="py-2 px-4 border-b border-l border-r border-gray-200">Initials</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s, idx) => (
                  <tr key={s.SaleID} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-l border-gray-200 text-center">{idx + 1}</td>
                    <td className="py-2 px-4 border-b border-l border-gray-200">{s.SaleName}</td>
                    <td className="py-2 px-4 border-b border-l border-gray-200">{s.Email}</td>
                    <td className="py-2 px-4 border-b border-l border-gray-200">{s.Phone}</td>
                    <td className="py-2 px-4 border-b border-l border-r border-gray-200">{s.Initials}</td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">Không có Sale phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <span className="text-xl">&times;</span>
            </button>
            <h3 className="text-xl font-semibold mb-4">Tạo Sale mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Tên Sale</label>
                <input
                  type="text"
                  name="SaleName"
                  value={form.SaleName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Số điện thoại</label>
                <input
                  type="text"
                  name="Phone"
                  value={form.Phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Initials</label>
                <input
                  type="text"
                  name="Initials"
                  value={form.Initials}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleNew;
