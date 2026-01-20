import React, { useState } from "react";
import { insertOrder } from "../services/orderService";

type OrderForm = {
  contractNumber: string;
  productName: string;
  saleDate: string;
  totalAmount: string;
  quantity: string;
  unitPrice: string;
  currency: "VND" | "USD";
  deposit?: string;
  dueDate: string;
  paidAmount: string;
  paidDate: string;
  priceFinalizationDate: string;
  priceFinalizationStatus: boolean;
  note?: string;
  [key: string]: any;
};

interface AddOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contractID: string;
  onOrderAdded?: () => void;
}

export function AddOrderModal({
  isOpen,
  onOpenChange,
  contractID,
  onOrderAdded,
}: AddOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>({
    contractNumber: "",
    productName: "",
    saleDate: "",
    totalAmount: "",
    quantity: "",
    unitPrice: "",
    currency: "VND",
    deposit: "",
    dueDate: "",
    paidAmount: "",
    paidDate: "",
    priceFinalizationDate: "",
    priceFinalizationStatus: false,
    note: "",
  });

  // =========================
  // HANDLE CHANGE (CHUẨN)
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => {
      let next = { ...prev };
      if (name === "priceFinalizationStatus") {
        if (value === "closed") {
          next.priceFinalizationStatus = true;
          // Lấy ngày hôm nay
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          next.priceFinalizationDate = `${yyyy}-${mm}-${dd}`;
        } else {
          next.priceFinalizationStatus = false;
          next.priceFinalizationDate = "";
        }
      } else {
        next[name] = value;
      }
      // Tự động tính lại tổng tiền nếu thay đổi quantity, unitPrice, deposit
      if (["quantity", "unitPrice", "deposit"].includes(name)) {
        const quantity = name === "quantity" ? Number(value) : Number(next.quantity);
        const unitPrice = name === "unitPrice" ? Number(value) : Number(next.unitPrice);
        const deposit = name === "deposit" ? Number(value) : Number(next.deposit || 0);
        let total = quantity * unitPrice - (isNaN(deposit) ? 0 : deposit);
        if (total < 0) total = 0;
        next.totalAmount = String(total);
      }
      return next;
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.contractNumber.trim()) return alert("Vui lòng nhập số hợp đồng");
    if (!form.productName.trim()) return alert("Vui lòng nhập tên hàng");
    if (!form.saleDate) return alert("Vui lòng chọn ngày bán");
    if (!form.dueDate) return alert("Vui lòng chọn ngày đến hạn");


    if (!form.priceFinalizationStatus && !form.priceFinalizationDate) {
      return alert("Vui lòng chọn hạn chốt giá khi chưa chốt giá");
    }

    if (new Date(form.dueDate) <= new Date(form.saleDate)) {
      return alert("Ngày đến hạn phải lớn hơn ngày bán");
    }

    if (+form.quantity <= 0) return alert("Số lượng phải > 0");
    if (+form.unitPrice <= 0) return alert("Đơn giá phải > 0");
    if (+form.totalAmount <= 0) return alert("Số tiền phải thu phải > 0");

    setLoading(true);
    try {
      await insertOrder({
        contractID,
        orderNumber: form.contractNumber,
        productName: form.productName,
        salesDate: new Date(form.saleDate).toISOString(),
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        currency: form.currency === "VND" ? 1 : 0,
        deposit: Number(form.deposit || 0),
        amountReceivable: Number(form.totalAmount),
        dueDate: new Date(form.dueDate).toISOString(),
        amountCollected: Number(form.paidAmount || 0),
        priceFinalizationStatus: form.priceFinalizationStatus,
        priceFinalizationDate: form.priceFinalizationDate,
        note: form.note,
        status: 0,
        isDelete: 0,
      });

      onOrderAdded?.();
      onOpenChange(false);
    } catch (err: any) {
      alert(err?.message || "Có lỗi khi thêm đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto">
        <div className="border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Thêm đơn hàng mới</h2>
          <button onClick={() => onOpenChange(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Số hợp đồng *</label>
              <input name="contractNumber" value={form.contractNumber} onChange={handleChange} placeholder="Nhập hoặc chọn (tối đa 255 ký tự)" className="w-full border p-2 rounded" maxLength={255} />
            </div>
            <div>
              <label className="block font-medium mb-1">Tên hàng *</label>
              <input name="productName" value={form.productName} onChange={handleChange} placeholder="Nhập hoặc chọn (tối đa 50 ký tự)" className="w-full border p-2 rounded" maxLength={50} />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày bán hàng *</label>
              <input type="date" name="saleDate" value={form.saleDate} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày đến hạn *</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">TT chốt giá</label>
              <select name="priceFinalizationStatus" value={form.priceFinalizationStatus ? "closed" : "not_closed"} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="not_closed">Chưa chốt</option>
                <option value="closed">Đã chốt</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Hạn chốt giá *</label>
              <input
                type="date"
                name="priceFinalizationDate"
                value={form.priceFinalizationDate}
                onChange={handleChange}
                disabled={form.priceFinalizationStatus}
                className={`w-full border p-2 rounded ${form.priceFinalizationStatus ? 'bg-gray-100' : ''}`}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Số lượng (Kg) *</label>
              <input name="quantity" value={form.quantity} onChange={e => {
                const raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
                if (/^\d*$/.test(raw)) {
                  handleChange({ ...e, target: { ...e.target, value: raw, name: 'quantity' } });
                }
              }} placeholder="Nhập số lượng" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">Đơn giá *</label>
              <div className="flex">
                <input
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    handleChange({ ...e, target: { ...e.target, value: raw, name: 'unitPrice' } });
                  }}
                  placeholder="Nhập đơn giá"
                  className="flex-1 border border-r-0 p-2 rounded-l"
                  style={{ minWidth: 0 }}
                />
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="border border-l-0 p-2 rounded-r min-w-[90px] max-w-[120px] bg-white"
                  style={{ height: '42px' }}
                >
                  <option value="VND">VNĐ</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Thành tiền *</label>
              <input name="totalAmount" value={form.totalAmount} readOnly className="w-full border p-2 rounded bg-gray-100" tabIndex={-1} />
            </div>
            <div>
              <label className="block font-medium mb-1">Tiền cọc</label>
              <input name="deposit" value={form.deposit} onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, '');
                handleChange({ ...e, target: { ...e.target, value: raw, name: 'deposit' } });
              }} placeholder="Nhập tiền cọc" className="w-full border p-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Ghi chú</label>
            <textarea name="note" value={form.note} onChange={handleChange} placeholder="Nhập ghi chú cho đơn hàng này (nếu có)" className="w-full border p-2 rounded" rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => onOpenChange(false)}>
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
