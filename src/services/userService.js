import api from "./api";

export async function getAllUsers() {
  const res = await api.get("/api/User/GetAllUsers");
  return res.data;
}


// Lấy thông tin user theo userID
export async function getUserById(userId) {
  const res = await api.get(`/api/User/GetUserById/${userId}`);
  return res.data; // { userID, email, fullName }
}
