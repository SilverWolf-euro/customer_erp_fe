import api from "./api";

export const addPriceFinalizationDate = (data) =>
  api.post("/api/Orders/AddPriceFinalizationDate", data);
