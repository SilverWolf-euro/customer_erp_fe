"use client"
import { useState, useEffect } from "react"
import Select from "react-select"
import { fetchAllCustomers, createContractWithOrder } from "../services/contractService.js"
import { Plus, X } from "lucide-react"

// Format currency helper
function formatCurrency(amount: string | number, currency: 'VND' | 'USD' = 'VND') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';
  let locale = currency === 'USD' ? 'en-US' : 'vi-VN';
  let cur = currency === 'USD' ? 'USD' : 'VND';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}



interface Order {
  contractNumber: string
  productName: string
  saleDate: string
  totalAmount: string
  quantity: string
  unitPrice: string
  currency?: 'VND' | 'USD';
  vat?: number;
  deposit?: string;
  dueDate: string
  paidAmount: string
  paidDate: string
  priceFinalizationDate?: string;
  priceFinalizationStatus?: boolean;
  note?: string;
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
  onDebtAdded?: () => void
}

export function AddDebtModal({ isOpen, onOpenChange, onDebtAdded }: AddDebtModalProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [salesPerson, setSalesPerson] = useState("")
  const [supportPerson, setSupportPerson] = useState("")
  const [contractStatus, setContractStatus] = useState(1)
  // Lưu lỗi cho từng trường
  const [customerError, setCustomerError] = useState("");
  const [orderErrors, setOrderErrors] = useState<any[]>([]);
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



    // Khi chọn customer, tự động fill sale (dùng react-select)
    const handleSelectCustomer = (option: any) => {
      if (!option) {
        setSelectedCustomer(null);
        setCustomerName("");
        setSalesPerson("");
        return;
      }
      setSelectedCustomer(option);
      setCustomerName(option.customerName || "");
      setSalesPerson(option.fullName || "");
    }
  const [orders, setOrders] = useState<Order[]>([
    {
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
      vat: undefined,
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
        currency: "VND",
        deposit: "",
        dueDate: "",
        paidAmount: "",
        paidDate: "",
        priceFinalizationDate: "",
        priceFinalizationStatus: false,
        note: "",
        vat: undefined,
      },
    ])
  }

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const updateOrder = (index: number, field: keyof Order, value: any) => {
    const newOrders = [...orders];
    // Nếu chọn TT chốt giá là "Đã chốt" thì tự động set ngày hiện tại và không cho chỉnh sửa hạn chốt giá
    if (field === 'priceFinalizationStatus' && value === true) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDate = `${yyyy}-${mm}-${dd}`;
      newOrders[index].priceFinalizationDate = currentDate;
      newOrders[index].priceFinalizationStatus = true;
    } else if (field === 'priceFinalizationStatus' && value === false) {
      newOrders[index].priceFinalizationStatus = false;
      newOrders[index].priceFinalizationDate = '';
    } else if (field === 'priceFinalizationDate') {
      // Nếu đã chốt thì không cho chỉnh sửa hạn chốt giá
      if (!newOrders[index].priceFinalizationStatus) {
        newOrders[index].priceFinalizationDate = value;
      }
    } else if (field === 'contractNumber' || field === 'productName' || field === 'saleDate' || field === 'totalAmount' || field === 'quantity' || field === 'unitPrice' || field === 'currency' || field === 'dueDate' || field === 'paidAmount' || field === 'paidDate') {
      (newOrders[index] as any)[field] = value;
    } else if (field === 'deposit') {
      newOrders[index].deposit = value;
    } else if (field === 'vat') {
      newOrders[index].vat = value;
    } else if (field === 'note') {
      newOrders[index].note = value;
    }
    // Tự động tính lại thành tiền nếu thay đổi số lượng, đơn giá, tiền cọc hoặc VAT
    if (['quantity', 'unitPrice', 'deposit', 'vat'].includes(field)) {
      const quantity = field === 'quantity' ? Number(value) : Number(newOrders[index].quantity);
      const unitPrice = field === 'unitPrice' ? Number(value) : Number(newOrders[index].unitPrice);
      const deposit = field === 'deposit' ? Number(value) : Number(newOrders[index].deposit || 0);
      const vat = field === 'vat' ? Number(value) : Number(newOrders[index].vat || 0);
      if (!isNaN(quantity) && !isNaN(unitPrice) && quantity && unitPrice) {
        let total = 0;
        // VAT: 1:0%, 2:5%, 3:8%, 4:10%, 5:KCT
        if (vat === 1 || vat === 5) {
          // 0% hoặc KCT: giữ nguyên thành tiền (không cộng VAT)
          total = quantity * unitPrice - (isNaN(deposit) ? 0 : deposit);
        } else if (vat === 2) {
          total = quantity * unitPrice * 1.05 - (isNaN(deposit) ? 0 : deposit);
        } else if (vat === 3) {
          total = quantity * unitPrice * 1.08 - (isNaN(deposit) ? 0 : deposit);
        } else if (vat === 4) {
          total = quantity * unitPrice * 1.10 - (isNaN(deposit) ? 0 : deposit);
        } else {
          // fallback: giữ logic cũ
          total = quantity * unitPrice * (100 + vat) / 100 - (isNaN(deposit) ? 0 : deposit);
        }
        if (total < 0) total = 0;
        newOrders[index].totalAmount = String(total);
      }
    }
    setOrders(newOrders);
  }

  const handleSave = async () => {
    let hasError = false;
    // Validate khách hàng
    if (!selectedCustomer) {
      setCustomerError("Vui lòng chọn tên khách hàng");
      hasError = true;
    } else {
      setCustomerError("");
    }
    // Validate từng đơn hàng
    const newOrderErrors = orders.map((order) => {
      const err: any = {};
      if (!order.contractNumber) err.contractNumber = "Vui lòng nhập số hợp đồng";
      if (!order.productName) err.productName = "Vui lòng nhập tên hàng";
      if (!order.saleDate) err.saleDate = "Vui lòng chọn ngày bán hàng";
      if (!order.dueDate) err.dueDate = "Vui lòng chọn ngày đến hạn";
      if (!order.vat) err.vat = "Vui lòng chọn VAT";
      // Validate dueDate >= saleDate
      if (order.saleDate && order.dueDate) {
        const sale = new Date(order.saleDate);
        const due = new Date(order.dueDate);
        if (due < sale) {
          err.dueDate = "Ngày đến hạn không được nhỏ hơn Ngày bán hàng";
        }
      }
      // Validate quantity
      if (!order.quantity) {
        err.quantity = "Vui lòng nhập số lượng";
      } else if (isNaN(Number(order.quantity)) || Number(order.quantity) <= 0 || !/^[0-9]+$/.test(order.quantity)) {
        err.quantity = "Số lượng phải là số nguyên dương";
      }
      // Validate unit price
      if (!order.unitPrice) {
        err.unitPrice = "Vui lòng nhập đơn giá";
      } else if (isNaN(Number(order.unitPrice)) || Number(order.unitPrice) <= 0 || !/^[0-9]+$/.test(order.unitPrice)) {
        err.unitPrice = "Đơn giá phải là số nguyên dương";
      }
      if (!order.totalAmount) err.totalAmount = "Vui lòng nhập số tiền phải thu";
        if (!order.priceFinalizationDate) err.priceFinalizationDate = "Vui lòng nhập hạn chốt giá";
      return err;
    });
    setOrderErrors(newOrderErrors);
    if (newOrderErrors.some(e => Object.keys(e).length > 0)) hasError = true;
    if (hasError) return;
    // Chuẩn bị dữ liệu gửi API
    const contract = {
      contractNumber: orders[0].contractNumber,
      customerId: selectedCustomer!.customerID,
      salesId: selectedCustomer!.saleID,
      statusContract: contractStatus,
      isDelete: 0
    };
    const orderItems = orders.map(o => ({
      productName: o.productName,
      orderNumber: o.contractNumber,
      salesDate: o.saleDate,
      quantity: Number(o.quantity || 0),
      unitPrice: Number(o.unitPrice || 0),
      currency: o.currency === 'USD' ? 0 : 1,
      priceFinalizationDate: o.priceFinalizationDate || "",
      priceFinalizationStatus: !!o.priceFinalizationStatus,
      amountReceivable: Number(o.totalAmount || 0),
      dueDate: o.dueDate,
      amountCollected: Number(o.paidAmount || 0),
      status: 0,
      isDelete: 0,
      note: o.note || '',
      vat: o.vat || 8,
    }));
    // Format currency helper
    function formatCurrency(amount: string | number, currency: 'VND' | 'USD' = 'VND') {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return '';
      let locale = currency === 'USD' ? 'en-US' : 'vi-VN';
      let cur = currency === 'USD' ? 'USD' : 'VND';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: cur,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    }
    try {
      await createContractWithOrder({ contract, orderItems });
      // Reset form data only after successful save
      setSelectedCustomer(null);
      setCustomerName("");
      setSalesPerson("");
      setSupportPerson("");
      setContractStatus(1);
      setOrders([
        {
          contractNumber: "",
          productName: "",
          saleDate: "",
          totalAmount: "",
          quantity: "",
          unitPrice: "",
          currency: "VND",
          dueDate: "",
          paidAmount: "",
          paidDate: "",
        },
      ]);
      setCustomerError("");
      setOrderErrors([]);
      if (typeof onDebtAdded === "function") onDebtAdded();
      onOpenChange(false);
    } catch (err) {
      alert("Có lỗi khi thêm công nợ!");
    }
  };

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
                  <Select
                    id="customer-name"
                    classNamePrefix="react-select"
                    placeholder="Chọn khách hàng..."
                    isClearable
                    value={selectedCustomer}
                    getOptionLabel={(option) => option.customerName}
                    getOptionValue={(option) => option.customerID}
                    onChange={handleSelectCustomer}
                    options={customers}
                    className="w-full"
                    styles={{
                      control: (base) => ({ ...base, minHeight: '40px', borderRadius: '0.5rem', borderColor: '#d1d5db' }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    filterOption={(option, input) => {
                      if (!input) return true;
                      const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
                      const label = normalize(option.data.customerName);
                      const id = normalize(option.data.customerID);
                      const search = normalize(input);
                      // Tách từ khoá thành các từ, chỉ cần 1 từ khớp là hiển thị
                      return search.split(' ').some(word => label.includes(word) || id.includes(word));
                    }}
                  />
                  {customerError && (
                    <div className="text-red-600 text-xs mt-1">{customerError}</div>
                  )}
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
                        placeholder="Nhập hoặc chọn (tối đa 255 ký tự)"
                        value={order.contractNumber}
                        onChange={(e) => updateOrder(index, "contractNumber", e.target.value)}
                        maxLength={255}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    {orderErrors[index]?.contractNumber && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].contractNumber}</div>
                    )}
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
                    {orderErrors[index]?.productName && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].productName}</div>
                    )}
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
                    {orderErrors[index]?.saleDate && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].saleDate}</div>
                    )}
                    {order.saleDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Hiển thị: {order.saleDate.split('-').reverse().join('/')}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`due-date-${index}`} className="block text-sm font-medium text-gray-700">
                      Ngày đến hạn <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`due-date-${index}`}
                      type="date"
                      value={order.dueDate}
                      onChange={(e) => updateOrder(index, "dueDate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {orderErrors[index]?.dueDate && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].dueDate}</div>
                    )}
                    {order.dueDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Hiển thị: {order.dueDate.split('-').reverse().join('/')}
                      </div>
                    )}
                  </div>
                  {/* Trạng thái chốt giá (select nhỏ) */}
                  <div className="space-y-2 ">
                    <label htmlFor={`is-closed-${index}`} className="block text-sm font-medium text-gray-700">
                      TT chốt giá
                    </label>
                    <select
                      id={`is-closed-${index}`}
                      value={order.priceFinalizationStatus ? 'closed' : 'not_closed'}
                      onChange={e => updateOrder(index, "priceFinalizationStatus", e.target.value === 'closed')}
                      className="w-1/3 min-w-[90px] max-w-[120px] px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not_closed">Chưa chốt</option>
                      <option value="closed">Đã chốt</option>
                    </select>
                  </div>
                  {/* Hạn chốt giá */}
                  <div className="space-y-2">
                    <label htmlFor={`closing-date-${index}`} className="block text-sm font-medium text-gray-700">
                      Hạn chốt giá <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`closing-date-${index}`}
                      type="date"
                      value={order.priceFinalizationDate || ""}
                      onChange={e => updateOrder(index, "priceFinalizationDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${order.priceFinalizationStatus ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                      disabled={order.priceFinalizationStatus}
                    />
                    {orderErrors[index]?.priceFinalizationDate && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].priceFinalizationDate}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                      Số lượng (Kg)  <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`quantity-${index}`}
                      type="text"
                      placeholder="Nhập số lượng"
                      value={order.quantity ? Number(order.quantity).toLocaleString('vi-VN') : ''}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        // Chỉ cho phép số nguyên dương, bỏ dấu chấm khi lưu
                        const raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
                        if (/^\d*$/.test(raw)) {
                          updateOrder(index, "quantity", raw);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {orderErrors[index]?.quantity && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].quantity}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`unit-price-${index}`} className="block text-sm font-medium text-gray-700">
                      Đơn giá <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        id={`unit-price-${index}`}
                        type="text"
                        placeholder="Nhập đơn giá"
                        value={order.currency === 'USD' && order.unitPrice ? Number(order.unitPrice).toLocaleString('en-US') : order.currency === 'VND' && order.unitPrice ? Number(order.unitPrice).toLocaleString('vi-VN') : order.unitPrice}
                        min={1}
                        step={1}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d]/g, '');
                          if (order.currency === 'VND' && val) {
                            val = String(Number(val));
                          }
                          updateOrder(index, "unitPrice", val);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      
                      <select
                        value={order.currency || 'VND'}
                        onChange={e => updateOrder(index, 'currency', e.target.value)}
                        className="px-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="VND">VNĐ</option>
                        <option value="USD">Đô la Mỹ</option>
                      </select>
                    </div>
                    {orderErrors[index]?.unitPrice && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].unitPrice}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`total-amount-${index}`} className="block text-sm font-medium text-gray-700">
                      Thành tiền <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        id={`total-amount-${index}`}
                        type="text"
                        value={order.currency === 'USD' && order.totalAmount ? Number(order.totalAmount).toLocaleString('en-US') : order.currency === 'VND' && order.totalAmount ? Number(order.totalAmount).toLocaleString('vi-VN') : order.totalAmount}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none cursor-not-allowed"
                        tabIndex={-1}
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      {/* <div className="text-xs text-gray-500 min-w-[70px] text-right">
                        {formatCurrency(order.totalAmount, order.currency as any)}
                      </div> */}
                      {/* VAT select box */}
                        <select
                          value={order.vat === undefined ? '' : order.vat}
                          onChange={e => updateOrder(index, 'vat', e.target.value ? Number(e.target.value) : undefined)}
                          className="px-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[70px]"
                          style={{ width: '80px' }}
                          aria-label="VAT"
                        >
                          <option value="" disabled>VAT</option>
                          <option value={1}>0%</option>
                          <option value={2}>5%</option>
                          <option value={3}>8%</option>
                          <option value={4}>10%</option>
                          <option value={5}>KCT</option>
                        </select>
                    </div>
                    {orderErrors[index]?.totalAmount && (
                      <div className="text-red-600 text-xs mt-1">{orderErrors[index].totalAmount}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`deposit-${index}`} className="block text-sm font-medium text-gray-700">
                      Tiền cọc
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        id={`deposit-${index}`}
                        type="text"
                        placeholder="Nhập tiền cọc"
                        value={order.deposit ? (order.currency === 'USD' ? Number(order.deposit).toLocaleString('en-US') : Number(order.deposit).toLocaleString('vi-VN')) : ''}
                        min={0}
                        step={1}
                        onChange={e => {
                          let val = e.target.value.replace(/[^\d]/g, '');
                          updateOrder(index, 'deposit', val);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      <div className="text-xs text-gray-500 min-w-[70px] text-right">
                        {formatCurrency(order.deposit || 0, order.currency as any)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label htmlFor={`note-${index}`} className="block text-sm font-medium text-gray-700">
                    Ghi chú
                  </label>
                  <textarea
                    id={`note-${index}`}
                    placeholder="Nhập ghi chú cho đơn hàng này (nếu có)"
                    value={order.note || ''}
                    onChange={e => updateOrder(index, 'note', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                  />
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
