"use client"

import { useState, useEffect } from "react"
import { fetchAllCustomers, createContractWithOrder } from "../services/contractService.js"
import { Plus, X } from "lucide-react"

interface Order {
  contractNumber: string
  productName: string
  saleDate: string
  totalAmount: string
  quantity: string
  unitPrice: string
  dueDate: string
  paidAmount: string
  paidDate: string
}

interface CustomerOption {
  customerID: string
  customerName: string
  saleID: string
  fullName: string
}

interface AddDebtModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDebtModal({ isOpen, onOpenChange }: AddDebtModalProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [salesPerson, setSalesPerson] = useState("")
  const [contractStatus, setContractStatus] = useState(1)
    // Fetch customers when modal opens
    useEffect(() => {
      if (isOpen) {
        fetchAllCustomers().then(res => {
          if (res?.data?.object) {
            // API mới trả về fullName đúng chuẩn
            const mapped = res.data.object.map((c: any) => ({
              customerID: c.customerID,
              customerName: c.customerName,
              saleID: c.saleID || "", // nếu có
              fullName: c.fullName || ""
            }))
            setCustomers(mapped)
          }
        })
      }
    }, [isOpen])

    // Khi chọn customer, tự động fill sale
    const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value
      const found = customers.find(c => c.customerID === id)
      setSelectedCustomer(found || null)
      setCustomerName(found?.customerName || "")
      setSalesPerson(found?.fullName || "")
    }
  const [orders, setOrders] = useState<Order[]>([
    {
      contractNumber: "",
      productName: "",
      saleDate: "",
      totalAmount: "",
      quantity: "",
      unitPrice: "",
      dueDate: "",
      paidAmount: "",
      paidDate: "",
    },
  ])

  const addOrder = () => {
    setOrders([
      ...orders,
      {
        contractNumber: "",
        productName: "",
        saleDate: "",
        totalAmount: "",
        quantity: "",
        unitPrice: "",
        dueDate: "",
        paidAmount: "",
        paidDate: "",
      },
    ])
  }

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const updateOrder = (index: number, field: keyof Order, value: string) => {
    const newOrders = [...orders]
    newOrders[index][field] = value

    // Auto-calculate due date (nếu cần giữ logic này, có thể bỏ qua nếu không liên quan quantity/unitPrice)

    setOrders(newOrders)
  }

  const handleSave = async () => {
    if (!selectedCustomer) {
      alert("Vui lòng chọn khách hàng!")
      return
    }
    // Chuẩn bị dữ liệu gửi API
    const contract = {
      contractNumber: orders[0].contractNumber,
      customerId: selectedCustomer.customerID,
      salesId: selectedCustomer.saleID,
      contractStatus,
      isDelete: 0
    }
    const orderItems = orders.map(o => ({
      productName: o.productName,
      orderNumber: o.contractNumber,
      salesDate: o.saleDate,
      quantity: Number(o.quantity || 0),
      unitPrice: Number(o.unitPrice || 0),
      amountReceivable: Number(o.totalAmount || 0),
      dueDate: o.dueDate,
      amountCollected: Number(o.paidAmount || 0),
      status: 0,
      isDelete: 0
    }))
    try {
      await createContractWithOrder({ contract, orderItems })
      onOpenChange(false)
    } catch (err) {
      alert("Có lỗi khi thêm công nợ!")
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div
          className="bg-white border border-gray-200 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Thêm công nợ</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4 text-gray-900">Thông tin khách hàng</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">
                    Tên khách hàng <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="customer-name"
                    value={selectedCustomer?.customerID || ""}
                    onChange={handleSelectCustomer}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map(c => (
                      <option key={c.customerID} value={c.customerID}>{c.customerName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="contract-status" className="block text-sm font-medium text-gray-700">
                    Loại hợp đồng <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="contract-status"
                    value={contractStatus}
                    onChange={e => setContractStatus(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Kim loại</option>
                    <option value={2}>Nhựa gỗ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="sales-person" className="block text-sm font-medium text-gray-700">
                    Sale phụ trách
                  </label>
                  <input
                    id="sales-person"
                    type="text"
                    placeholder="Auto-fill sau khi chọn khách hàng"
                    value={salesPerson}
                    onChange={(e) => setSalesPerson(e.target.value)}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Orders */}
            {orders.map((order, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative bg-white">
                {orders.length > 1 && (
                  <button
                    className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => removeOrder(index)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                <h3 className="font-semibold mb-4 text-gray-900">Đơn hàng {index + 1}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor={`contract-${index}`} className="block text-sm font-medium text-gray-700">
                      Số hợp đồng <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`contract-${index}`}
                      type="text"
                      placeholder="Nhập hoặc chọn (tối đa 20 ký tự)"
                      value={order.contractNumber}
                      onChange={(e) => updateOrder(index, "contractNumber", e.target.value)}
                      maxLength={20}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700">
                      Tên hàng <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`product-${index}`}
                      type="text"
                      placeholder="Nhập hoặc chọn (tối đa 50 ký tự)"
                      value={order.productName}
                      onChange={(e) => updateOrder(index, "productName", e.target.value)}
                      maxLength={50}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`sale-date-${index}`} className="block text-sm font-medium text-gray-700">
                      Ngày bán hàng <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`sale-date-${index}`}
                      type="date"
                      value={order.saleDate}
                      onChange={(e) => updateOrder(index, "saleDate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`total-amount-${index}`} className="block text-sm font-medium text-gray-700">
                      Số tiền phải thu (VNĐ) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`total-amount-${index}`}
                      type="number"
                      placeholder="Nhập số tiền"
                      value={order.totalAmount}
                      onChange={(e) => updateOrder(index, "totalAmount", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                      Số lượng <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      placeholder="Nhập số lượng"
                      value={order.quantity}
                      onChange={(e) => updateOrder(index, "quantity", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`unit-price-${index}`} className="block text-sm font-medium text-gray-700">
                      Đơn giá (VNĐ) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`unit-price-${index}`}
                      type="number"
                      placeholder="Nhập đơn giá"
                      value={order.unitPrice}
                      onChange={(e) => updateOrder(index, "unitPrice", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`due-date-${index}`} className="block text-sm font-medium text-gray-700">
                      Ngày đến hạn
                    </label>
                    <input
                      id={`due-date-${index}`}
                      type="date"
                      value={order.dueDate}
                      onChange={(e) => updateOrder(index, "dueDate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`paid-amount-${index}`} className="block text-sm font-medium text-gray-700">
                      Số tiền đã thu (VNĐ)
                    </label>
                    <input
                      id={`paid-amount-${index}`}
                      type="number"
                      placeholder="Nếu có"
                      value={order.paidAmount}
                      onChange={(e) => updateOrder(index, "paidAmount", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`paid-date-${index}`} className="block text-sm font-medium text-gray-700">
                      Ngày thu
                    </label>
                    <input
                      id={`paid-date-${index}`}
                      type="date"
                      value={order.paidDate}
                      onChange={(e) => updateOrder(index, "paidDate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addOrder}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm đơn hàng
            </button>
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
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
