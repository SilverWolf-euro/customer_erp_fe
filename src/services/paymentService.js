import api from "./api";

// Thêm đợt thanh toán mới cho đơn hàng
export const insertPayment = ({ orderID, amount, autumnDay }) => {
  return api.post("/api/Payment/InsertPayment", {
    orderID,
    amount,
    autumnDay,
  });
};
