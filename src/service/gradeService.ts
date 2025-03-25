import axios from 'axios';

// Interface สำหรับ Grades ตามโครงสร้าง C# Model
export interface Grades {
  studentId: string;
  courseCode: string;
  grade: string;
  semester: string;
  academicYear: string;
}

// Base URL สำหรับ API
const API_URL = 'https://localhost:7138/api/Grade';

export default {
  // ดึงรายการเกรดทั้งหมด
  async getGradeList(): Promise<Grades[]> {
    try {
      const response = await axios.get<Grades[]>(`${API_URL}/GetGradeList`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade list:', error);
      throw error;
    }
  },

  // ดึงเกรดเฉพาะรายวิชาของนักศึกษา
  async getGrade(studentId: string, courseCode: string): Promise<Grades> {
    try {
      const response = await axios.get<Grades>(`${API_URL}?studentId=${studentId}&courseCode=${courseCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade:', error);
      throw error;
    }
  },

  // เพิ่มเกรดใหม่
  async pushGrade(grade: Grades): Promise<string> {
    try {
      const response = await axios.post<string>(`${API_URL}/PushGrade`, grade);
      return response.data;
    } catch (error) {
      console.error('Error pushing grade:', error);
      throw error;
    }
  },

  // อัปเดตเกรด
  async updateGrade(grade: Grades): Promise<string> {
    try {
      const response = await axios.put<string>(`${API_URL}/UpdateGrade`, grade);
      return response.data;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  }

  // หมายเหตุ: ฟังก์ชัน Delete ถูก comment ออกใน Controller เดิม
  // จึงไม่ได้เพิ่มฟังก์ชันลบในที่นี้
};