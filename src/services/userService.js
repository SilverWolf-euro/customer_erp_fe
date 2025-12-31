import api from "./api";

export async function getAllUsers() {
  const res = await api.get("/api/User/GetAllUsers");
  return res.data;
}

export async function getAllMachineUser() {
  const res = await api.get("/api/User/GetAllMachineUser");
  // Trả về mảng salers (object) để tiện lấy userID, userName
  return res.data?.object || [];
}
// Lấy thông tin user theo userID
export async function getUserById(userId) {
  const res = await api.get(`/api/User/GetUserById/${userId}`);
  return res.data; // { userID, email, fullName }
}
