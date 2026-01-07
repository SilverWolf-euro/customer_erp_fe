"use client"

interface PaymentHistory {
  date: string
  amount: number
}

interface Order {
  contractNumber: string
  productName: string
  saleDate: string
  totalAmount: number
  paidHistory: PaymentHistory[]
  remaining: number
  quantity: number
  unitPrice: number
  dueDate: string
}

interface Customer {
  name: string
  salesPerson: string
  supportPerson: string
}

interface DebtDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  customer: Customer
}

export function DebtDetailModal({ open, onOpenChange, order, customer }: DebtDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết công nợ</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4 text-gray-900">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Tên khách hàng</label>
                <div className="font-medium text-gray-900">{customer.name}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Sale phụ trách</label>
                <div className="font-medium text-gray-900">{customer.salesPerson}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Hỗ trợ phụ trách</label>
                <div className="font-medium text-gray-900">{customer.supportPerson}</div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="font-semibold mb-4 text-gray-900">Thông tin đơn hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Số hợp đồng</label>
                <div className="font-medium text-gray-900">{order.contractNumber}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Tên hàng</label>
                <div className="font-medium text-gray-900">{order.productName}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Ngày bán hàng</label>
                <div className="font-medium text-gray-900">{order.saleDate}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Số tiền phải thu</label>
                <div className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Số lượng</label>
                <div className="font-medium text-gray-900">{order.quantity}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Đơn giá</label>
                <div className="font-medium text-gray-900">{formatCurrency(order.unitPrice)}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">Ngày đến hạn</label>
                <div className="font-medium text-gray-900">{order.dueDate}</div>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="block text-xs text-gray-500">Còn phải thu</label>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(order.remaining)}</div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="font-semibold mb-4 text-gray-900">Lịch sử thanh toán</h3>
            {order.paidHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có khoản thanh toán nào</div>
            ) : (
              <div className="space-y-3">
                {order.paidHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">Đợt thanh toán {index + 1}</div>
                      <div className="text-sm text-gray-500">{payment.date}</div>
                    </div>
                    <div className="text-lg font-semibold text-green-600">{formatCurrency(payment.amount)}</div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Tổng số tiền đã thu:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(order.paidHistory.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
