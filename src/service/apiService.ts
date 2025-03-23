import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://localhost:7138/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// เพิ่ม interceptor เพื่อแนบ token ในทุก request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// จัดการเมื่อ token หมดอายุ
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // token หมดอายุหรือไม่ถูกต้อง
            localStorage.removeItem('token');
            localStorage.removeItem('studentID');
            localStorage.removeItem('studentName');
            // อาจมีการ redirect ไปยังหน้า login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
