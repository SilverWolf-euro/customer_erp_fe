"use client"

import { useState, useEffect } from "react"
import { insertPayment } from "../services/paymentService.js"
import { Plus, X } from "lucide-react"

interface PaymentHistory {
  date: string
  amount: number
  canDelete?: boolean
}

interface Order {
  id: string
  contractNumber: string
  productName: string
  saleDate: string
  totalAmount: number
  paid: number
  paidHistory: PaymentHistory[]
  remaining: number
  quantity: number
  unitPrice: number
  finalPrice?: number | null;
  tempAmount?: number | null;
  finalAmount?: number | null;
  currency?: 'VND' | 'USD';
  paymentTerm: number
  dueDate: string
  priceFinalizationDate?: string
  priceFinalizationStatus?: boolean
}

interface Customer {
  name: string
  salesPerson: string
}

interface UpdateDebtModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  customer: Customer
  onPaymentAdded?: () => void
}

export function UpdateDebtModal({ open, onOpenChange, order, customer, onPaymentAdded }: UpdateDebtModalProps) {
  const [salesPerson, setSalesPerson] = useState(customer.salesPerson)
  const [totalAmount, setTotalAmount] = useState(order.totalAmount !== undefined && order.totalAmount !== null ? order.totalAmount.toString() : "")
  const [paymentTerm, setPaymentTerm] = useState(order.paymentTerm !== undefined && order.paymentTerm !== null ? order.paymentTerm.toString() : "")
  const [dueDate, setDueDate] = useState(order.dueDate)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(
    Array.isArray(order.paidHistory) && order.paidHistory.length > 0
      ? order.paidHistory.map((p) => ({ ...p, canDelete: false }))
      : [],
  )

  // Reset state when order or customer changes
  useEffect(() => {
    setSalesPerson(customer.salesPerson)
    setTotalAmount(order.totalAmount !== undefined && order.totalAmount !== null ? order.totalAmount.toString() : "")
    setPaymentTerm(order.paymentTerm !== undefined && order.paymentTerm !== null ? order.paymentTerm.toString() : "")
    setDueDate(order.dueDate)
    setPaymentHistory(Array.isArray(order.paidHistory) && order.paidHistory.length > 0
      ? order.paidHistory.map((p) => ({ ...p, canDelete: false }))
      : [])
  }, [order, customer])

  const hasExistingPayments = order.paidHistory.length > 0

  useEffect(() => {
    // Calculate due date when payment term changes
    if (paymentTerm) {
      const date = new Date(order.saleDate)
      date.setDate(date.getDate() + Number.parseInt(paymentTerm))
      setDueDate(date.toISOString().split("T")[0])
    }
  }, [paymentTerm, order.saleDate])

  const addPayment = () => {
    setPaymentHistory([...paymentHistory, { date: "", amount: 0, canDelete: true }])
  }

  const removePayment = (index: number) => {
    setPaymentHistory(paymentHistory.filter((_, i) => i !== index))
  }

  const updatePayment = (index: number, field: "date" | "amount", value: string | number) => {
    const newHistory = [...paymentHistory]
    newHistory[index][field] = value as never
    setPaymentHistory(newHistory)
  }

  const calculateRemaining = () => {
    const total = Number.parseFloat(totalAmount) || 0
    const paid = paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
    return total - paid
  }

  const formatCurrency = (amount: number) => {
    const currency = (order as any).currency === 'USD' ? 'USD' : 'VND';
    const locale = currency === 'USD' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const handleUpdate = async () => {
    // Lọc các payment mới (canDelete = true và có đủ thông tin)
    const newPayments = paymentHistory.filter(p => p.canDelete && p.amount > 0 && p.date)
    // Kiểm tra có khoản nào chưa chọn ngày thu
    const missingDate = paymentHistory.some(p => p.canDelete && p.amount > 0 && !p.date)
    if (missingDate) {
      alert('Vui lòng chọn ngày thu cho tất cả các khoản thanh toán mới!');
      return;
    }
    // Tổng số tiền đã thu mới
    const totalNewPaid = newPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    // Số còn phải thu hiện tại
    const remaining = order.remaining
    if (totalNewPaid > remaining) {
      alert("Vui lòng nhập lại Số tiền đã thu")
      return
    }
    try {
      for (const p of newPayments) {
        await insertPayment({
          orderID: order.id,
          amount: p.amount,
          autumnDay: new Date(p.date).toISOString(),
        })
      }
      // Gọi callback reload data nếu có
      if (typeof onPaymentAdded === "function") onPaymentAdded();
      onOpenChange(false)
    } catch (err) {
      alert("Có lỗi khi thêm đợt thanh toán!")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white border border-gray-200 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Cập nhật công nợ</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4 text-gray-900">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                <input
                  type="text"
                  value={customer.name}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sales-person" className="block text-sm font-medium text-gray-700">
                  Sale phụ trách
                </label>
                <input
                  id="sales-person"
                  type="text"
                  value={salesPerson}
                  onChange={(e) => setSalesPerson(e.target.value)}
                  disabled={hasExistingPayments}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    hasExistingPayments ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
                  }`}
                />
                {hasExistingPayments && (
                  <p className="text-xs text-gray-500">Không thể sửa vì đã có khoản thanh toán</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="font-semibold mb-4 text-gray-900">Đơn hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Số hợp đồng</label>
                <input
                  type="text"
                  value={order.contractNumber}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên hàng</label>
                <input
                  type="text"
                  value={order.productName}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giá chốt ({(order as any).currency === 'USD' ? 'USD' : 'VNĐ'})</label>
                <input
                  type="text"
                  value={order.finalPrice && order.finalPrice !== 0 ? formatCurrency(order.finalPrice) : 'Chưa chốt giá'}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ngày bán hàng</label>
                <input
                  type="text"
                  value={order.saleDate}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="total-amount" className="block text-sm font-medium text-gray-700">
                  Số tiền phải thu ({(order as any).currency === 'USD' ? 'USD' : 'VNĐ'})
                </label>
                <input
                  id="total-amount"
                  type="text"
                  value={
                    totalAmount && !isNaN(Number(totalAmount)) && Number(totalAmount) !== 0
                      ? formatCurrency(Number(totalAmount))
                      : formatCurrency(0)
                  }
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
                {hasExistingPayments && (
                  <p className="text-xs text-gray-500">Không thể sửa vì đã có khoản thanh toán</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
                <input
                  id="quantity"
                  type="number"
                  value={order.quantity}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700">Đơn giá ({(order as any).currency === 'USD' ? 'USD' : 'VNĐ'})</label>
                <input
                  id="unit-price"
                  type="number"
                  value={order.unitPrice}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">
                  Ngày đến hạn
                </label>
                <input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">Còn phải thu</label>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    order.priceFinalizationStatus && order.finalAmount != null
                      ? order.finalAmount - paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
                      : order.tempAmount != null
                        ? order.tempAmount - paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
                        : order.remaining
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Lịch sử thanh toán</h3>
              <button
                onClick={addPayment}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm đợt thanh toán
              </button>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có khoản thanh toán nào</div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="space-y-2">
                      <label htmlFor={`payment-date-${index}`} className="block text-xs font-medium text-gray-700">
                        Ngày thu
                      </label>
                      <input
                        id={`payment-date-${index}`}
                        type="date"
                        value={payment.date}
                        onChange={(e) => updatePayment(index, "date", e.target.value)}
                        disabled={!payment.canDelete}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !payment.canDelete ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`payment-amount-${index}`} className="block text-xs font-medium text-gray-700">
                        Số tiền đã thu ({(order as any).currency === 'USD' ? 'USD' : 'VNĐ'})
                      </label>
                      <input
                        id={`payment-amount-${index}`}
                        type="number"
                        value={payment.amount}
                        onChange={(e) => updatePayment(index, "amount", Number.parseFloat(e.target.value))}
                        disabled={!payment.canDelete}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !payment.canDelete ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </div>
                    {payment.canDelete && (
                      <div className="flex items-end">
                        <button
                          onClick={() => removePayment(index)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Tổng số tiền:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  )
}
