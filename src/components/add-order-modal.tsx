import React, { useState } from "react";
import { insertOrder } from "../services/orderService";

interface AddOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contractID: string;
  onOrderAdded?: () => void;
}

export function AddOrderModal({ isOpen, onOpenChange, contractID, onOrderAdded }: AddOrderModalProps) {
  const [form, setForm] = useState({
    contractNumber: "",
    productName: "",
    saleDate: "",
    totalAmount: "",
    quantity: "",
    unitPrice: "",
    dueDate: "",
    paidAmount: "",
    paidDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        contractID,
        productName: form.productName,
        orderNumber: form.contractNumber,
        salesDate: form.saleDate ? new Date(form.saleDate).toISOString() : null,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        amountReceivable: Number(form.totalAmount),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        amountCollected: Number(form.paidAmount || 0),
        status: 0,
        isDelete: 0,
      };
      await insertOrder(orderData);
      if (onOrderAdded) onOrderAdded();
      onOpenChange(false);
    } catch {
      alert("Có lỗi khi thêm đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => onOpenChange(false)}
        >
          <span className="text-xl">&times;</span>
        </button>
        <h3 className="text-xl font-semibold mb-4">Thêm đơn hàng mới</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Số hợp đồng *</label>
            <input
              type="text"
              name="contractNumber"
              value={form.contractNumber}
              onChange={handleChange}
              maxLength={20}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
              placeholder="Nhập hoặc chọn (tối đa 20 ký tự)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Tên hàng *</label>
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              maxLength={50}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
              placeholder="Nhập hoặc chọn (tối đa 50 ký tự)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày bán hàng *</label>
            <input
              type="date"
              name="saleDate"
              value={form.saleDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Số tiền phải thu (VNĐ) *</label>
            <input
              type="number"
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
              placeholder="Nhập số tiền"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Số lượng *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
              placeholder="Nhập số lượng"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Đơn giá (VNĐ) *</label>
            <input
              type="number"
              name="unitPrice"
              value={form.unitPrice}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              required
              placeholder="Nhập đơn giá"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày đến hạn</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Số tiền đã thu (VNĐ)</label>
            <input
              type="number"
              name="paidAmount"
              value={form.paidAmount}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Nếu có"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày thu</label>
            <input
              type="date"
              name="paidDate"
              value={form.paidDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
