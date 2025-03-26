<template>
    <span>วิชาทั้งหมดของสาขา</span>
    <div class="card">
        <DataTable :value="filteredCourses" tableStyle="min-width: 50rem">
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import courseService, { Course } from '@/service/courseService';

// สร้าง courses แบบ array
const courses = ref<Course[]>([]);

// สร้าง computed property สำหรับกรองวิชา - เพิ่มการระบุ type ให้ course
const filteredCourses = computed(() => 
    courses.value.filter((course: Course) => course.courseCode.startsWith('01418'))
);

// สร้าง columns พร้อม type
const columns = [
    { field: 'courseCode', header: 'รหัสวิชา' },
    { field: 'courseNameTH', header: 'ชื่อวิชา (ไทย)' },
    { field: 'courseNameEN', header: 'ชื่อวิชา (อังกฤษ)' },
    { field: 'credit', header: 'หน่วยกิต' },
    { field: 'subjectGroup', header: 'กลุ่มวิชา' }
];

// โหลดข้อมูลเมื่อ component mount
onMounted(async () => {
    try {
        const coursesList = await courseService.getCoursesList();
        if (coursesList) {
            courses.value = coursesList;
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา:', error);
    }
});
</script>

<style scoped>
.card {
    padding: 1rem;
}
</style>