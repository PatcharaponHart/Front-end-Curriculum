import axios from 'axios';

// อัปเดต Interface ให้ตรงกับโครงสร้าง JSON
export interface Course {
  courseCode: string;
  courseNameTH: string;
  courseNameEN: string;
  credit: number;
  subjectGroup: string;
}

// สร้าง Service สำหรับเรียก API 
const API_URL = 'https://localhost:7138/api/Course'; 

export default {
  async getCourse(courseCode: string): Promise<Course | null> {
    try {
      const response = await axios.get<Course>(`${API_URL}?courseCode=${courseCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },

  async getCoursesList(): Promise<Course[] | null> {
    try {
      const response = await axios.get<Course[]>(`${API_URL}/GetCoursesList`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses list:', error);
      return null;
    }
  },

  async pushCourse(course: Course): Promise<boolean> {
    try {
      await axios.post(`${API_URL}/PushCourse`, course);
      return true;
    } catch (error) {
      console.error('Error adding course:', error);
      return false;
    }
  },

  async updateCourse(course: Course): Promise<boolean> {
    try {
      await axios.put(`${API_URL}/UpdateCourse`, course);
      return true;
    } catch (error) {
      console.error('Error updating course:', error);
      return false;
    }
  },

  async deleteCourse(courseCode: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/DeleteCourse?courseCode=${courseCode}`);
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  }
};