import axios from 'axios';

// อัปเดต Interface ให้ตรงกับโครงสร้าง JSON
export interface Student {
  studentID: string;
  firstName: string;
  lastName: string;
  section: string;
  username: string;
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
  }
};