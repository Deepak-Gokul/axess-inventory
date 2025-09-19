import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Item APIs
const createItem = (formdata) => API.post("/dashboard/item", formdata);
const getAllItems = () => API.get("/dashboard/items");
const deleteItem = (id) => API.delete(`/dashboard/${id}`);
const updateItem = (id, formData) => API.put(`/dashboard/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });

// Logs / Item view
const getItemLogs = (id) => API.get(`/dashboard/item/${id}/logs`);
const viewItem = (id) => API.get(`/dashboard/items/${id}`);
const toggleItemStatus = (id, location = null) => API.patch(`/logs/${id}/status`, { location });

// Bulk operations
const createBulk = (formdata) => API.post(`/dashboard/bulk-create-items`, formdata);
const markReceived = (id) => API.patch(`/dashboard/${id}/mark-received`);

// Auth
const adminLogin = (email, password) => API.post('/dashboard/login', { email, password });

export {
    createItem,
    updateItem,
    getAllItems,
    getItemLogs,
    deleteItem,
    viewItem,
    toggleItemStatus,
    adminLogin,
    createBulk,
    markReceived
};

export default API;
