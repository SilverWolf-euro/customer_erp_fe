import api from "./api";

// Đăng nhập
export async function login({ username, password, isRememberPassword }) {
	return api.post("/api/Authenticate/Login", {
		username,
		password,
		isRememberPassword,
	});
}