import axios from "axios"

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
})

const createItem = (formdata)=>API.post("/dashboard/item",formdata)
const getAllItems = ()=>API.get("/dashboard/items")
const deleteItem = (id)=>API.delete(`dashboard/${id}`)
const getItemLogs = (id)=>API.get(`/dashboard/item/${id}/logs`)
const viewItem = (id)=>API.get(`/items/${id}`)
const toggleItemStatus =(id,location = null)=>API.patch(`/logs/${id}/status`,{location});
const adminLogin = (email, password) => API.post('/dashboard/login', { email, password });
const updateItem = (id, formData) =>
  API.put(`/dashboard/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const createBulk = (formdata)=>API.post("dashboard/bulk-create-items",formdata)
const markReceived = (id) => API.patch(`/dashboard/${id}/mark-received`);
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
}

export default API