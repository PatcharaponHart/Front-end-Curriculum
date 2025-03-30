import axios from 'axios';

// Models/Interfaces
export interface Grades {
    studentId: string;
    courseCode: string;
    grade?: string;
    credit: number;
}

export interface StudentGradeCourseDto {
    studentID: string;
    firstName: string;
    lastName: string;
    courseCode: string;
    courseNameTH: string;
    courseNameEN: string;
    grade?: string;
    credit: number;
}

export interface StudentGradesSummaryDto {
    studentID: string;
    firstName: string;
    lastName: string;
    grades: StudentGradeCourseDto[];
    totalCredits: number;
}

// Base URL for API
const API_URL = 'https://localhost:7138/api/Grade';

export default {
    // Get All Grade List
    async getGradeList(): Promise<Grades[]> {
        try {
            const response = await axios.get<Grades[]>(`${API_URL}/GetGradeList`);
            return response.data;
        } catch (error) {
            console.error('Error fetching grade list:', error);
            throw error;
        }
    },

    // Get Student Grades With Courses (All Students)
    async getStudentGradesWithCourses(): Promise<StudentGradeCourseDto[]> {
        try {
            const response = await axios.get<StudentGradeCourseDto[]>(`${API_URL}/grades-with-courses`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student grades with courses:', error);
            throw error;
        }
    },

    // Get Student Grades by Specific Student ID
    async getStudentGradesByStudentId(studentId: string): Promise<StudentGradesSummaryDto> {
        try {
            const response = await axios.get<StudentGradesSummaryDto>(`${API_URL}/GetGradeByStudentId`, {
                params: { studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching student grades by ID:', error);
            throw error;
        }
    },

    // Get Specific Grade for a Student in a Course
    async getGrade(studentId: string, courseCode: string): Promise<Grades> {
        try {
            const response = await axios.get<Grades>(`${API_URL}`, {
                params: { studentId, courseCode }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching grade:', error);
            throw error;
        }
    },

    // Add Single Grade
    async pushGrade(grade: Grades): Promise<string> {
        try {
            const response = await axios.post<string>(`${API_URL}/PushGrade`, grade);
            return response.data;
        } catch (error) {
            console.error('Error pushing grade:', error);
            throw error;
        }
    },

    // Add Multiple Grades
    async pushGrades(grades: Grades[]): Promise<string> {
        try {
            const response = await axios.post<string>(`${API_URL}/PushGrades`, grades);
            return response.data;
        } catch (error) {
            console.error('Error pushing grades:', error);
            throw error;
        }
    },

    // Update Single Grade
    async updateGrade(grade: Grades): Promise<string> {
        try {
            const response = await axios.put<string>(`${API_URL}/UpdateGrade`, grade);
            return response.data;
        } catch (error) {
            console.error('Error updating grade:', error);
            throw error;
        }
    },

    // Edit Grade for a Specific Student
    async editGrade(grade: Grades): Promise<string> {
        try {
            const response = await axios.put<string>(`${API_URL}/UpdateEdit`, grade);
            return response.data;
        } catch (error) {
            console.error('Error editing grade:', error);
            throw error;
        }
    },

    // Update Multiple Grades
    async updateGrades(gradesList: Grades[]): Promise<string> {
        try {
            const response = await axios.put<string>(`${API_URL}/UpdateGrades`, gradesList);
            return response.data;
        } catch (error) {
            console.error('Error updating grades:', error);
            throw error;
        }
    }
};
