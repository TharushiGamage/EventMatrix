import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const loggedUser = JSON.parse(localStorage.getItem("resourceUser"));

    if (loggedUser) {
      config.headers["x-user-role"] = loggedUser.role;
      config.headers["x-user-name"] = loggedUser.name;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;