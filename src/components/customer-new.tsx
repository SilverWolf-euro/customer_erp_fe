
import React, { useState, useEffect } from 'react';
import { fetchAllCustomers } from '../services/customerService';
import { getAllUsers } from '../services/userService';
import api from '../services/api';

interface Customer {
	CustomerID?: string; // char(36)
	CustomerName: string;
	SaleName: string;
	saleID?: string;
	Address: string;
	TaxCode: string;
}

const initialForm: Customer = {
	CustomerName: '',
	SaleName: '',
	saleID: '',
	Address: '',
	TaxCode: '',
};

// Xóa mockCustomers, chỉ dùng API

const CustomerNew: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState<Customer>(initialForm);
	const [search, setSearch] = useState('');
	const [sales, setSales] = useState<{ userID: string, fullName: string }[]>([]);

	// Lấy danh sách Sale (user)
	useEffect(() => {
		getAllUsers().then(res => {
			if (res?.object) {
				setSales(res.object.map((u: any) => ({ userID: u.userID, fullName: u.fullName })));
			}
		});
	}, []);

	// Lấy danh sách khách hàng từ API khi load component
	useEffect(() => {
		fetchAllCustomers().then(res => {
			if (res?.data?.object) {
				const mapped = res.data.object.map((c: any) => ({
					CustomerID: c.customerID,
					CustomerName: c.customerName,
					SaleName: c.fullName || '',
					saleID: c.saleID || '',
					Address: c.address || '',
					TaxCode: c.taxCode || ''
				}));
				setCustomers(mapped);
			}
		});
	}, []);

	const handleOpenModal = () => {
		setForm(initialForm);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setForm({ ...form, [e.target.name]: e.target.value });
		};

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			// Gọi API tạo mới customer
			try {
				const payload = {
					saleID: form.saleID,
					customerName: form.CustomerName,
					taxCode: form.TaxCode,
					address: form.Address,
					isDelete: 0
				};
				await api.post('/api/Customer/InsertCustomer', payload);
				// Sau khi tạo mới, reload lại danh sách
				fetchAllCustomers().then(res => {
					if (res?.data?.object) {
						const mapped = res.data.object.map((c: any) => ({
							CustomerID: c.customerID,
							CustomerName: c.customerName,
							SaleName: c.fullName || '',
							saleID: c.saleID || '',
							Address: c.address || '',
							TaxCode: c.taxCode || ''
						}));
						setCustomers(mapped);
					}
				});
				setShowModal(false);
			} catch (err) {
				alert('Có lỗi khi tạo mới khách hàng!');
			}
		};

	// Lọc danh sách theo search
	const filteredCustomers = customers.filter((c) => {
		const s = search.toLowerCase();
		return (
		c.CustomerName.toLowerCase().includes(s) ||
		c.SaleName.toLowerCase().includes(s) ||
		c.Address.toLowerCase().includes(s) ||
		c.TaxCode.toLowerCase().includes(s)
		);
	});

	return (
		<div className="p-6 min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto">
				<div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
						<div className="flex-1 flex items-center">
							<h2 className="text-2xl font-bold mr-4 whitespace-nowrap">Danh sách khách hàng</h2>
							<div className="flex w-full max-w-xs gap-2">
								<input
									type="text"
									placeholder="Tìm kiếm khách hàng..."
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
									<th className="py-2 px-4 border-b border-l border-gray-200">Tên khách hàng</th>
									<th className="py-2 px-4 border-b border-l border-gray-200">Tên Sale</th>
									<th className="py-2 px-4 border-b border-l border-gray-200">Địa chỉ</th>
									<th className="py-2 px-4 border-b border-l border-r border-gray-200">Mã số thuế</th>
								</tr>
							</thead>
							<tbody>
								{filteredCustomers.map((c, idx) => (
									<tr key={c.CustomerID} className="hover:bg-gray-50">
										<td className="py-2 px-4 border-b border-l border-gray-200 text-center">{idx + 1}</td>
										<td className="py-2 px-4 border-b border-l border-gray-200">{c.CustomerName}</td>
										<td className="py-2 px-4 border-b border-l border-gray-200">{c.SaleName}</td>
										<td className="py-2 px-4 border-b border-l border-gray-200">{c.Address}</td>
										<td className="py-2 px-4 border-b border-l border-r border-gray-200">{c.TaxCode}</td>
									</tr>
								))}
								{filteredCustomers.length === 0 && (
									<tr>
															<td colSpan={5} className="py-4 text-center text-gray-400">Không có khách hàng phù hợp</td>
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
						<h3 className="text-xl font-semibold mb-4">Tạo khách hàng mới</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block mb-1 font-medium">Tên khách hàng</label>
								<input
									type="text"
									name="CustomerName"
									value={form.CustomerName}
									onChange={handleChange}
									className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
									required
								/>
							</div>
														<div>
															<label className="block mb-1 font-medium">Tên Sale</label>
															<select
																name="saleID"
																value={form.saleID}
																onChange={handleChange}
																className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
																required
															>
																<option value="">Chọn Sale phụ trách</option>
																{sales.map(s => (
																	<option key={s.userID} value={s.userID}>{s.fullName}</option>
																))}
															</select>
														</div>
							<div>
											<div>
												<label className="block mb-1 font-medium">Địa chỉ</label>
												<input
													type="text"
													name="Address"
													value={form.Address}
													onChange={handleChange}
													className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
													required
												/>
											</div>
											<div>
												<label className="block mb-1 font-medium">Mã số thuế</label>
												<input
													type="text"
													name="TaxCode"
													value={form.TaxCode}
													onChange={handleChange}
													className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
													required
												/>
											</div>
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

export default CustomerNew;
