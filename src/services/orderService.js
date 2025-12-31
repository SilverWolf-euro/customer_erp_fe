import api from "./api";

// Thêm mới đơn hàng
export async function insertOrder(orderData) {
  return api.post("/api/Orders/InsertOrder", orderData);
}
