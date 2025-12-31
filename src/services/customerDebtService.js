import api from "./api";

export const fetchCustomerDebts = (params) =>
  api.get("/api/Customer/customer-debts-filter", { params });
