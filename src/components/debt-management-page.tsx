"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, ChevronDown, Calendar } from "lucide-react"
import { AddDebtModal } from "./add-debt-modal.tsx"
import { AddOrderModal } from "./add-order-modal.tsx"
import { UpdateDebtModal } from "./update-debt-modal.tsx"
import { DebtDetailModal } from "./debt-detail-modal.tsx"
import { fetchCustomerDebts } from "../services/customerDebtService.js"
import React from "react"
import { chooseFinalPrice } from "../services/priceFinalizationService.js"
// ...existing code...
import { Dialog } from "@headlessui/react"
// Modal chọn ngày chốt giá
function PriceFinalizationModal({ open, onClose, onSave, order }: { open: boolean, onClose: () => void, onSave: (date: string, finalPrice: number) => void, order: Order | null }) {
  const [finalPrice, setFinalPrice] = useState(order?.unitPrice || 0);
  useEffect(() => {
    setFinalPrice(order?.unitPrice || 0);
  }, [order]);
  if (!order) return null;
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto">
        <Dialog.Title className="text-lg font-semibold mb-4">Chốt giá cho đơn hàng {order.contractNumber}</Dialog.Title>
        <div className="flex flex-col gap-4 mb-4">
          <label className="block text-sm font-medium text-gray-700">Giá chốt</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={finalPrice}
            onChange={e => setFinalPrice(Number(e.target.value))}
            min={0}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-2"
            onClick={() => {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;
              onSave(dateStr, finalPrice);
            }}
          >Chốt giá hôm nay</button>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Đóng</button>
        </div>
      </div>
    </Dialog>
  )
}



interface PaymentHistory {
  date: string
  amount: number
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
  paymentTerm: number
  dueDate: string
  status: "coming-due" | "due" | "overdue" | "paid" | "not-due-yet"
  overdueDay?: number
  quantity: number
  unitPrice: number
  currency?: 'VND' | 'USD';
  priceFinalizationDate?: string
  priceFinalizationStatus?: boolean
  vat?: number

  // Thêm các trường mới từ API
  finalPrice?: number | null;
  tempAmount?: number | null;
  finalAmount?: number | null;
}

interface Customer {
  id: string
  contractId: string
  name: string
  salesPerson: string
  supportPerson: string
  totalDebt: number
  orderCount: number
  orders: Order[]
}



export function DebtManagementPage() {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedOrderForPrice, setSelectedOrderForPrice] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
  const [selectedContractID, setSelectedContractID] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())
  const [userRole] = useState<"director" | "sales">("sales")
  const [statusContract, setStatusContract] = useState(0)

  // Fetch data from API
  const fetchData = async () => {
    try {
      const params: any = {
        search: searchTerm,
        statusContract,
        pageSize: 20,
        currentPage: 1,
      };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (activeTab && activeTab !== "all") {
        const statusMap: Record<string, number> = {
          "coming-due": 1,
          "due": 2,
          "overdue": 3,
          "paid": 4,
          "not-due-yet": 5,
        };
        params.status = statusMap[activeTab] ?? 0;
      }
      const res = await fetchCustomerDebts(params)
      if (res?.data?.object?.listData) {
        // Map API fields to FE fields if needed
        setCustomers(
          res.data.object.listData.map((c: any) => ({
            ...c,
            orders: c.orders.map((o: any) => ({
              ...o,
              contractNumber: o.orderNumber, // map orderNumber to contractNumber for FE
              quantity: o.quantity, // map quantity to Số lượng
              unitPrice: o.unitPrice, // map unitPrice to Đơn giá
              finalPrice: o.finalPrice, // map finalPrice (giá chốt)
              tempAmount: o.tempAmount, // map tempAmount (tạm tính)
              finalAmount: o.finalAmount, // map finalAmount (giá chốt tổng)
              currency: o.currency === 0 ? 'USD' : 'VND', // map currency: 0 -> USD, 1/undefined -> VND
              // status and overdueDay are now provided by API
            })),
          }))
        );
        // setTotalCount(res.data.object.totalCount); // Đã loại bỏ
      } else {
        setCustomers([]);
        // setTotalCount(0); // Đã loại bỏ
      }
    } catch (e) {
      setCustomers([])
      // setTotalCount(0) // Đã loại bỏ
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusContract, activeTab, fromDate, toDate])

  const toggleCustomerExpand = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers)
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId)
    } else {
      newExpanded.add(customerId)
    }
    setExpandedCustomers(newExpanded)
  }

  const getFilteredCustomers = () => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.salesPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.orders.some((order) => order.productName.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      if (activeTab === "all") return true

      return customer.orders.some((order) => {
        if (activeTab === "coming-due") return order.status === "coming-due"
        if (activeTab === "due") return order.status === "due"
        if (activeTab === "overdue") return order.status === "overdue"
        if (activeTab === "paid") return order.status === "paid"
        return true
      })
    })
  }

  const getTabCount = (status: string) => {
    if (status === "all") return customers.length
    return customers.filter((c) => c.orders.some((o) => o.status === status)).length
  }

  const formatCurrency = (amount: number, currency: 'VND' | 'USD' = 'VND') => {
    let locale = currency === 'USD' ? 'en-US' : 'vi-VN';
    let cur = currency === 'USD' ? 'USD' : 'VND';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: Order["status"]) => {
    const styles = {
      "coming-due": "bg-blue-500/10 text-black border-blue-500/20",
      due: "bg-yellow-500/10 text-black border-yellow-500/20",
      overdue: "bg-red-500/50 text-black border-red-500/50",
      paid: "bg-green-500/10 text-black border-green-500/20",
      "not-due-yet": "bg-gray-300/10 text-black border-gray-300/20",
    }
    const labels = {
      "coming-due": "Sắp đến hạn",
      due: "Đến hạn",
      overdue: "Quá hạn",
      paid: "Đã thanh toán",
      "not-due-yet": "Chưa đến hạn",
    }
    return <div className={`px-2 py-0.5 text-xs rounded ${styles[status]}`}>{labels[status]}</div>
  }

  const handleUpdate = (order: Order, customer: Customer) => {
    setSelectedOrder(order)
    setSelectedCustomer(customer)
    setIsUpdateModalOpen(true)
  }

  const handleViewDetail = (order: Order, customer: Customer) => {
    setSelectedOrder(order)
    setSelectedCustomer(customer)
    setIsDetailModalOpen(true)
  }

  const filteredCustomers = getFilteredCustomers()

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Công nợ</h1>
            <p className="text-sm text-gray-600 mt-1">Theo dõi và quản lý công nợ khách hàng</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm công nợ
          </button>
        </div>

        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sales, khách hàng, tên hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded"
              />
              <span>-</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
            {/* Nút chọn statusContract */}
            <div>
              <select
                value={statusContract}
                onChange={e => setStatusContract(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Tất cả</option>
                <option value={1}>Kim loại</option>
                <option value={2}>Nhựa gỗ</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {[
              { value: "all", label: "Tất cả" },
              { value: "coming-due", label: "Sắp đến hạn" },
              { value: "due", label: "Đến hạn" },
              { value: "overdue", label: "Quá hạn" },
              { value: "paid", label: "Đã thanh toán" },
              { value: "not-due-yet", label: "Chưa đến hạn" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    activeTab === tab.value ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {getTabCount(tab.value)}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4 mt-6">
            {filteredCustomers.length === 0 ? (
              <div className="border border-gray-200 bg-white rounded-lg p-12">
                <div className="text-center text-gray-500">Không có kết quả phù hợp với yêu cầu tìm kiếm.</div>
              </div>
            ) : (
              filteredCustomers.map((customer) => {

                // Sắp xếp order theo thứ tự trạng thái mong muốn
                const statusOrder = ["overdue", "due", "coming-due", "not-due-yet", "paid"];
                const sortOrders = (orders: Order[]) => {
                  return [...orders].sort((a, b) => {
                    const aIdx = statusOrder.indexOf(a.status);
                    const bIdx = statusOrder.indexOf(b.status);
                    return aIdx - bIdx;
                  });
                };
                const relevantOrders =
                  activeTab === "all"
                    ? sortOrders(customer.orders)
                    : sortOrders(customer.orders.filter((o) => o.status === activeTab));

                if (relevantOrders.length === 0) return null

                const isExpanded = expandedCustomers.has(customer.id)


                return (
                  <div
                    key={customer.id}
                    className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm"
                  >
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCustomerExpand(customer.id)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Khách hàng</div>
                          <div className="font-semibold text-blue-600 hover:underline">{customer.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Sale phụ trách</div>
                          <div className="text-black">{customer.salesPerson}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Hỗ trợ phụ trách</div>
                          <div className="text-black">{customer.supportPerson}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Tổng công nợ</div>
                          <div className="text-sm font-semibold text-red-600">{formatCurrency(customer.totalDebt, (customer.orders[0]?.currency || 'VND'))}</div>
                        </div>
                        <div className="relative">
                          <div className="text-xs text-gray-500 mb-1">Số đơn hàng</div>
                          <span className="text-black">{customer.orderCount}</span>
                          <button
                            className="absolute top-0 right-0 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            style={{ marginRight: '-8px', marginTop: '-8px' }}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedContractID(customer.contractId);
                              setIsAddOrderModalOpen(true);
                            }}
                          >
                            Thêm đơn mới
                          </button>
                        </div>
                        <div className="flex items-center justify-end">
                          <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Số hợp đồng</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Tên hàng</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Ngày bán</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Số lượng</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Giá tạm tính</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Giá chốt</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Tạm tính</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">
                                  Số tiền phải thu(VAT)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Đã thu</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Còn phải thu</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Ngày đến hạn</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Trạng thái chốt giá</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {relevantOrders.map((order) => (
                                <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                                  <td className="px-4 py-4 text-sm text-black">{order.contractNumber}</td>
                                  <td className="px-4 py-4 text-sm text-black">{order.productName}</td>
                                  <td className="px-4 py-4 text-sm text-black">{order.saleDate}</td>
                                  <td className="px-4 py-4 text-sm text-right text-black">{order.quantity ?? '-'}</td>
                                  <td className={`px-4 py-4 text-sm text-right ${order.finalPrice ? 'text-gray-400' : 'text-black'}`}>{order.unitPrice ? formatCurrency(order.unitPrice, order.currency === 'USD' ? 'USD' : 'VND') : '-'}</td>
                                  <td className="px-4 py-4 text-sm text-right text-black">{order.finalPrice ? formatCurrency(order.finalPrice, order.currency === 'USD' ? 'USD' : 'VND') : '-'}</td>
                                  <td className="px-4 py-4 text-sm text-right text-black">{order.tempAmount ? formatCurrency(order.tempAmount, order.currency === 'USD' ? 'USD' : 'VND') : '-'}</td>
                                  <td className="px-4 py-4 text-sm text-right text-black">
                                    {order.finalAmount ? formatCurrency(order.finalAmount, order.currency === 'USD' ? 'USD' : 'VND') : '-'}
                                    {/* VAT label */}
                                    {order.vat !== undefined && order.vat !== null && (
                                      <span className="ml-1 text-xs text-gray-500 font-semibold">
                                        {(() => {
                                          switch (order.vat) {
                                            case 1: return '(0%)';
                                            case 2: return '(5%)';
                                            case 3: return '(8%)';
                                            case 4: return '(10%)';
                                            case 5: return '(KCT)';
                                            default: return '';
                                          }
                                        })()}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-right">
                                    <div className="space-y-1">
                                      <div className="text-black">{formatCurrency(order.paid, order.currency === 'USD' ? 'USD' : 'VND')}</div>
                                      {order.paidHistory.length > 0 && (
                                        <div className="text-xs text-gray-500">
                                          {order.paidHistory[order.paidHistory.length - 1].date}
                                          {order.paidHistory.length > 1 && (
                                            <button
                                              className="text-blue-600 hover:underline ml-1"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleViewDetail(order, customer)
                                              }}
                                            >
                                              ...
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-right font-semibold text-red-600">{formatCurrency(order.remaining, order.currency === 'USD' ? 'USD' : 'VND')}</td>
                                  <td className="px-4 py-4 text-sm text-black">
                                    {order.dueDate}
                                    {order.status === "overdue" && order.dueDate && (
                                      <div className="text-xs text-red-600 mt-1">
                                        Quá hạn {(() => {
                                          const due = new Date(order.dueDate)
                                          const now = new Date()
                                          due.setHours(0,0,0,0)
                                          now.setHours(0,0,0,0)
                                          const diff = Math.floor((now.getTime() - due.getTime()) / (1000*60*60*24))
                                          return diff > 0 ? diff : 0
                                        })()} ngày
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-black">
                                    {order.priceFinalizationStatus ? (
                                      <span className="text-green-600">Đã chốt giá{order.priceFinalizationDate ? ` (${order.priceFinalizationDate})` : ''}</span>
                                    ) : (
                                      <>
                                        <span className="text-red-600">Chưa chốt giá</span>
                                        {order.priceFinalizationDate && (
                                          <span className="ml-2 text-gray-600">({order.priceFinalizationDate})</span>
                                        )}
                                        <button
                                          className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                          onClick={e => {
                                            e.stopPropagation();
                                            setSelectedOrderForPrice(order);
                                            setIsPriceModalOpen(true);
                                          }}
                                        >Chốt giá</button>
                                      </>
                                    )}
                                  </td>
                                        <PriceFinalizationModal
                                          open={isPriceModalOpen}
                                          onClose={() => setIsPriceModalOpen(false)}
                                          order={selectedOrderForPrice}
                                          onSave={async (date, finalPrice) => {
                                            if (!selectedOrderForPrice || !date || !finalPrice) return;
                                            let finalDate = date;
                                            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                                              finalDate = new Date(date + 'T00:00:00Z').toISOString();
                                            }
                                            await chooseFinalPrice({
                                              orderID: selectedOrderForPrice.id,
                                              priceFinalizationDate: finalDate,
                                              finalPrice: finalPrice
                                            });
                                            setIsPriceModalOpen(false);
                                            setSelectedOrderForPrice(null);
                                            fetchData();
                                          }}
                                        />
                                  <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleViewDetail(order, customer)
                                        }}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded transition-colors"
                                      >
                                        Xem chi tiết
                                      </button>
                                      {userRole !== "director" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleUpdate(order, customer)
                                          }}
                                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                        >
                                          Cập nhật
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <AddDebtModal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} onDebtAdded={fetchData} />
      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onOpenChange={setIsAddOrderModalOpen}
        contractID={selectedContractID || ""}
        onOrderAdded={fetchData}
      />

      {selectedOrder && selectedCustomer && (
          <>
            <UpdateDebtModal
              open={isUpdateModalOpen}
              onOpenChange={setIsUpdateModalOpen}
              order={selectedOrder}
              customer={selectedCustomer}
              onPaymentAdded={() => fetchData()}
            />
            <DebtDetailModal
              open={isDetailModalOpen}
              onOpenChange={setIsDetailModalOpen}
              order={selectedOrder}
              customer={selectedCustomer}
            />
          </>
        )}
    
    </div>
  )
}
