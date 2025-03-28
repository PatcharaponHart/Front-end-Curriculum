import axios from 'axios';

// อัปเดต Interface ให้ตรงกับโครงสร้าง JSON
export interface Student {
    studentID: string;
    firstName: string;
    lastName: string;
    section: string;
    username: string;
    password: string;
}

// สร้าง Service สำหรับเรียก API
const API_URL = 'https://localhost:7138/api/Student';

export default {
    async getStudent(studentId: string): Promise<Student | null> {
        try {
            const response = await axios.get<Student>(`${API_URL}?studentId=${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    },

    async registerStudent(studentData: Student): Promise<any> {
        // กำหนด Return Type ให้ชัดเจนขึ้นตามที่ API ตอบกลับ
        try {
            // Endpoint สำหรับ PushStudent คือ /api/Student/PushStudent
            const response = await axios.post(`${API_URL}/PushStudent`, studentData);
            // คืนค่า response data ที่ได้จาก backend (เช่น "Student added Successfully")
            return response.data;
        } catch (error) {
            console.error('Error registering student:', error);
            // โยน error ออกไปเพื่อให้ Component จัดการต่อได้ (แสดง Toast)
            throw error;
        }
    }
    // --- สิ้นสุดฟังก์ชันที่เพิ่ม ---
};
