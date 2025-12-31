// Thêm mới customer

import api from "./api";

export const fetchAllCustomers = () => api.get("/api/Customer/GetAllCustomers");
export async function insertCustomer({ saleID, customerName, taxCode, address, isDelete = 0 }) {
	return api.post("/api/Customer/InsertCustomer", {
		saleID,
		customerName,
		taxCode,
		address,
		isDelete
	});
}
export default fetchAllCustomers;