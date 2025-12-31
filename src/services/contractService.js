import api from "./api";

export const fetchAllCustomers = () => api.get("/api/Customer/GetAllCustomers");
export const createContractWithOrder = (data) => api.post("/api/Contract/CreateContractWithOrder", data);