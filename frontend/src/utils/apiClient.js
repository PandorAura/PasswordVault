// src/utils/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    const url = config.url || "";

    const isAuthRequest =
      url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;