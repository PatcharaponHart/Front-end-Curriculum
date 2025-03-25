<script setup lang="ts">
import { ref, onMounted } from 'vue';
import studentService, { Student } from '@/service/studentService';
import { getCurrentUser } from '@/service/authService';

const student = ref<Student | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

const fetchStudentData = async () => {
    try {
        const currentUser = getCurrentUser();
        if (currentUser.studentID) {
            student.value = await studentService.getStudent(currentUser.studentID);
        } else {
            throw new Error('ไม่พบรหัสนักศึกษา');
        }
    } catch (error) {
        console.error(error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchStudentData);
</script>

<template>
    <div class="card">
        <h2 class="text-primary">ข้อมูลส่วนตัว</h2>

        <div v-if="isLoading" class="loading">กำลังโหลดข้อมูล...</div>
        <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-else-if="student" class="student-info">
            <p><strong class="text-primary">ชื่อ:</strong> {{ student.firstName }}</p>
            <p><strong class="text-primary">นามสกุล:</strong> {{ student.lastName }}</p>
            <p><strong class="text-primary">รหัสนิสิต:</strong> {{ student.studentID }}</p>
            <p><strong class="text-primary">ภาคการศึกษา:</strong> {{ student.section }}</p>
        </div>
    </div>
</template>

<style scoped>

.h2 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
}

.student-info p {
    margin: 10px 0;
    padding: 5px 0;
    border-bottom: 1px solid #eee;
}

.loading {
    color: #3498db;
    text-align: center;
    padding: 20px;
}

.error {
    color: #e74c3c;
    text-align: center;
    padding: 20px;
    font-weight: bold;
}

strong {
    margin-right: 10px;
}
</style>