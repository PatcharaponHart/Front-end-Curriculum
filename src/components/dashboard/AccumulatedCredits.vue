<script setup lang="ts">
import { getCurrentUser } from '@/service/authService';
import gradeService, { StudentGradesSummaryDto } from '@/service/gradeService';
import { onMounted, ref } from 'vue';

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
            <p>
                <strong class="text-primary">หน่วยกิตทั้งหมด:</strong> <strong>{{ studentCredits.totalCredits }}</strong>
            </p>
            <p>
                <strong class="text-primary">จำนวนวิชาทั้งหมด:</strong> <strong>{{ studentCredits.grades.length }}</strong>
            </p>
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
    font-size: 16px;
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
    margin-right: 8px;
}
</style>
