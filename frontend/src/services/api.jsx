import axios from "axios";

export const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Auto-attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/admin/login";
        }
        return Promise.reject(error);
    }
);