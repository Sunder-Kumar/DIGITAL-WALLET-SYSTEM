import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://192.168.0.38:5000';

const api = axios.create({
    baseURL: API_BASE_URL
});

export default api;
