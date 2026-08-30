import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const aiApi = {
    getRecommendation: (data) => axios.post(`${BASE_URL}/ai/recommend`, data),
    ensureCert: (certName) => axios.post(`${BASE_URL}/ai/ensure-cert`, { certName })
};
