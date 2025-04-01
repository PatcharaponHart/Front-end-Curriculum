<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gradeService, { StudentGradesSummaryDto } from '@/service/gradeService';
import { getCurrentUser } from '@/service/authService';

const studentCredits = ref<StudentGradesSummaryDto | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

const fetchStudentCredits = async () => {
    try {
        const currentUser = getCurrentUser();
        if (currentUser.studentID) {
            studentCredits.value = await gradeService.getStudentGradesByStudentId(currentUser.studentID);
        } else {
            throw new Error('ไม่พบรหัสนักศึกษา');
        }
    } catch (error) {
        console.error(error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยกิต';
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchStudentCredits);
</script>

<template>
    <div class="card">
        <h2 class="text-primary">หน่วยกิตสะสม</h2>

        <div v-if="isLoading" class="loading">กำลังโหลดข้อมูล...</div>
        <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-else-if="studentCredits" class="credits-info">
            <p><strong class="text-primary">หน่วยกิตทั้งหมด:</strong> {{ studentCredits.totalCredits }}</p>
            <p><strong class="text-primary">จำนวนวิชาทั้งหมด:</strong> {{ studentCredits.grades.length }}</p>
        </div>
    </div>
</template>

<style scoped>
.h2 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
}

.credits-info p {
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