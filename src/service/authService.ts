import axios from 'axios';

// ✅ กำหนด Base URL API (ไม่รวม /login)
const API_BASE_URL = 'https://localhost:7138/api/auth';

// ✅ กำหนด Key สำหรับ localStorage
const storageKey = {
  TOKEN: 'token',
  STUDENT_ID: 'studentID',
  STUDENT_NAME: 'studentName',
};

// ✅ ฟังก์ชันจัดการ token และข้อมูลผู้ใช้
const setAuthData = (token: string, studentID: string, studentName: string) => {
  localStorage.setItem(storageKey.TOKEN, token);
  localStorage.setItem(storageKey.STUDENT_ID, studentID);
  localStorage.setItem(storageKey.STUDENT_NAME, studentName);
};

const clearAuthData = () => {
  Object.values(storageKey).forEach((key) => localStorage.removeItem(key));
};

// ✅ Interceptor เพื่อแนบ token ทุก request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(storageKey.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ ฟังก์ชัน Login
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });

    // Debug response
    console.log('API Response:', response.data);

    // ✅ ใช้ชื่อตัวแปรให้ตรงกับ API Response
    const { token, studentID, name } = response.data;

    if (!token) {
      throw new Error('ไม่พบ Token จากเซิร์ฟเวอร์');
    }

    // บันทึก token ลง localStorage
    setAuthData(token, studentID, name);

    return true;
  } catch (error: any) {
    console.error('Login Error:', error);
    throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
};

// ✅ ตรวจสอบว่า Login อยู่หรือไม่
export const isLoggedIn = (): boolean => !!localStorage.getItem(storageKey.TOKEN);

// ✅ ออกจากระบบ และ redirect
export const logout = (): void => {
  clearAuthData();
  window.location.href = '/login'; // หรือใช้ router.push('/login') ถ้าใช้ Vue Router
};

// ✅ ดึงข้อมูลผู้ใช้ที่ Login อยู่
export const getCurrentUser = () => ({
  token: localStorage.getItem(storageKey.TOKEN),
  studentID: localStorage.getItem(storageKey.STUDENT_ID),
  name: localStorage.getItem(storageKey.STUDENT_NAME),
});
