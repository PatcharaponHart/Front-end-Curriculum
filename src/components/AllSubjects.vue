<template>
    <span>วิชาทั้งหมดของสาขา</span>
    <div class="card">
        <!-- ช่องค้นหาวิชา -->
        <div class="search-container">
            <InputText v-model="searchTerm" placeholder="ค้นหาชื่อวิชา, กลุ่มวิชา" />
        </div>

        <!-- ตารางแสดงวิชา -->
        <DataTable :value="filteredCourses" tableStyle="min-width: 50rem">
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import courseService, { Course } from '@/service/courseService';

const courses = ref<Course[]>([]);
const searchTerm = ref('');
const filteredCourses = computed(() => {
    return courses.value.filter((course: Course) => 
        course.courseCode.startsWith('01418') && 
        (course.courseNameTH.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
        course.courseNameEN.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        course.subjectGroup.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
});

const columns = [
    { field: 'courseCode', header: 'รหัสวิชา' },
    { field: 'courseNameTH', header: 'ชื่อวิชา (ไทย)' },
    { field: 'courseNameEN', header: 'ชื่อวิชา (อังกฤษ)' },
    { field: 'credit', header: 'หน่วยกิต' },
    { field: 'subjectGroup', header: 'กลุ่มวิชา' }
];

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

.search-container {
    margin-bottom: 1rem;
    max-width: 300px;
    margin-left: 900px; /* เลื่อนไปทางขวา */
}
</style>
