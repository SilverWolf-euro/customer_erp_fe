import api from "./api";

export const chooseFinalPrice = (data) =>
  api.post("/api/Orders/ChooseFinalPrice", data);
