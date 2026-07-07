import axios from "axios";

const api = axios.create({
  baseURL: "https://gse-backend-iulf.onrender.com/api",
});

export default api;