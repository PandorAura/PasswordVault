import apiClient from "../../utils/apiClient";

export async function loginRequest(email, password) {
  const response = await apiClient.post("/api/auth/login", {
    email,
    password,
  });

  const { token } = response.data;

  localStorage.setItem("authToken", token);

  return { email, token };
}

export async function registerRequest(name, email, password) {
  const response = await apiClient.post("/api/auth/register", {
    name,
    email,
    password,
  });

  const { token } = response.data;

  localStorage.setItem("authToken", token);

  return { email, token };
}