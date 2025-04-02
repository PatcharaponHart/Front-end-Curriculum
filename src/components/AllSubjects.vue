<template>
    <Toast />

    <div class="flex justify-content-between align-items-center mb-3">
        <h2 class="text-primary">วิชาทั้งหมดของสาขา</h2>
    </div>

    <div class="card">
        <div class="search-container">
            <InputText v-model="searchTerm" placeholder="ค้นหาชื่อวิชา, กลุ่มวิชา" style="width: 270px" />
        </div>
        <DataTable :value="filteredCourses" tableStyle="min-width: 50rem" :loading="isLoading">
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
        </DataTable>
    </div>

    <div v-if="isAdmin" class="button-container">
      <Button label="เพิ่มรายวิชา" icon="pi pi-plus" class="p-button-success" @click="openAddDialog" :loading="isSaving" />
    </div>

    <Dialog v-model:visible="isAddDialogVisible" header="เพิ่มรายวิชาใหม่" :modal="true" :style="{ width: '450px' }">
        <div class="form-container p-fluid">
            <div class="field">
                <label for="courseCode">รหัสวิชา</label>
                <InputText id="courseCode" v-model.trim="newCourse.courseCode" required autofocus :disabled="isSaving" maxlength="8" />
            </div>
            <div class="field">
                <label for="courseNameTH">ชื่อวิชา (ไทย)</label>
                <InputText id="courseNameTH" v-model.trim="newCourse.courseNameTH" required :disabled="isSaving" />
            </div>
            <div class="field">
                <label for="courseNameEN">ชื่อวิชา (อังกฤษ)</label>
                <InputText id="courseNameEN" v-model.trim="newCourse.courseNameEN" required :disabled="isSaving" />
            </div>
            <div class="field">
                <label for="credit">หน่วยกิต</label>
                <InputNumber id="credit" v-model="newCourse.credit" mode="decimal" :min="1" :max="9" required :disabled="isSaving" :maxlength="1"
                @keydown="limitInputLength($event, 1)" />
            </div>
            <div class="field">
                <label for="subjectGroup">กลุ่มวิชา</label>
                <InputText id="subjectGroup" v-model.trim="newCourse.subjectGroup" required :disabled="isSaving" />
            </div>
        </div>

        <template #footer>
            <Button label="ยกเลิก" icon="pi pi-times" class="p-button-danger" @click="closeAddDialog" :disabled="isSaving" />
            <Button label="บันทึก" icon="pi pi-check" @click="saveNewCourse" :disabled="!isFormValid || isSaving" :loading="isSaving" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import courseService, { Course } from '@/service/courseService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast'; // Import Toast component
import { useToast } from 'primevue/usetoast'; // Import useToast hook
import { computed, onMounted, reactive, ref } from 'vue';
import { getCurrentUser } from '@/service/authService';
// --- Initialize Toast ---
const toast = useToast();

const currentUser = getCurrentUser();
console.log('ข้อมูลผู้ใช้ปัจจุบัน (currentUser):', currentUser);

// --- State ต่างๆ ---
const courses = ref<Course[]>([]);
const searchTerm = ref('');
const isAddDialogVisible = ref(false);
const isLoading = ref(false); // State สำหรับ loading ตาราง
const isSaving = ref(false); // State สำหรับ loading ตอนกดบันทึก

const initialNewCourseState: Course = {
    courseCode: '',
    courseNameTH: '',
    courseNameEN: '',
    credit: 1,
    subjectGroup: ''
};
const newCourse = reactive<Course>({ ...initialNewCourseState });
    const limitInputLength = (event: KeyboardEvent, maxLength: number) => {
    const target = event.target as HTMLInputElement;
    const value = target.value || '';

    // อนุญาตปุ่มที่ไม่ใช่ตัวเลข/ตัวอักษร เช่น Backspace, Delete, Arrow keys, Tab, Enter, Home, End
    if (
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'].includes(event.key) ||
        // อนุญาต Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) ||
        // อนุญาต Cmd+A (สำหรับ Mac)
        (event.metaKey && event.key.toLowerCase() === 'a')
    ) {
        return; // ไม่ต้องทำอะไร อนุญาตให้กดได้
    }

    // ถ้าความยาวถึง maxLength แล้ว และไม่ได้เลือกข้อความไว้ และปุ่มที่กดเป็นตัวเลข
    if (value.length >= maxLength && target.selectionStart === target.selectionEnd && /\d/.test(event.key)) {
        event.preventDefault(); // ป้องกันการพิมพ์เพิ่ม
    }
};
// --- Computed Properties ---
const filteredCourses = computed(() => {
    // ... (เหมือนเดิม) ...
    const majorCourses = courses.value.filter((course) => course.courseCode.startsWith('01418'));
    if (!searchTerm.value) return majorCourses;
    const lowerSearchTerm = searchTerm.value.toLowerCase();
    return majorCourses.filter((course: Course) => course.courseNameTH.toLowerCase().includes(lowerSearchTerm) || course.courseNameEN.toLowerCase().includes(lowerSearchTerm) || course.subjectGroup.toLowerCase().includes(lowerSearchTerm));
});

const columns = [
    // ... (เหมือนเดิม) ...
    { field: 'courseCode', header: 'รหัสวิชา' },
    { field: 'courseNameTH', header: 'ชื่อวิชา (ไทย)' },
    { field: 'courseNameEN', header: 'ชื่อวิชา (อังกฤษ)' },
    { field: 'credit', header: 'หน่วยกิต' },
    { field: 'subjectGroup', header: 'กลุ่มวิชา' }
];

const isFormValid = computed(() => {
    // ... (เหมือนเดิม) ...
    return newCourse.courseCode && newCourse.courseNameTH && newCourse.courseNameEN && newCourse.credit !== null && newCourse.credit >= 0 && newCourse.subjectGroup;
});
const isAdmin = computed(() => {
     // ใช้ .name และเทียบกับค่าที่ถูกต้องสำหรับ Admin
     const adminNameIdentifier = 'แอดมิน  ระบบติดตาม';
     const result = !!currentUser && currentUser.name === adminNameIdentifier;
     console.log(`ตรวจสอบ isAdmin: currentUser.name='${currentUser?.name}', ต้องการ='${adminNameIdentifier}', ผลลัพธ์=${result}`); // แสดง log เพื่อ debug
     return result;
 });
// --- Lifecycle Hooks ---
onMounted(async () => {
    await fetchCourses();
});

// --- Functions ---
async function fetchCourses() {
    isLoading.value = true; // เริ่ม loading
    try {
        console.log('Fetching courses...');
        const coursesList = await courseService.getCoursesList(); // สมมติว่ามีฟังก์ชันนี้ใน service
        if (coursesList) {
            console.log('Courses fetched:', coursesList.length);
            courses.value = coursesList;
        } else {
            console.log('No courses found or service returned null/undefined.');
            courses.value = [];
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา:', error);
        courses.value = [];
        toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถดึงข้อมูลวิชาได้', life: 3000 });
    } finally {
        isLoading.value = false; // สิ้นสุด loading
    }
}

const openAddDialog = () => {
    Object.assign(newCourse, initialNewCourseState);
    isAddDialogVisible.value = true;
};

// const closeAddDialog = () => {
//     if (!isSaving.value) {
//         // ป้องกันการปิดขณะกำลังบันทึก
//         isAddDialogVisible.value = false;
//     }
// };

const closeAddDialog = () => {
    isAddDialogVisible.value = false;
    // เอาเงื่อนไข if (!isSaving.value) ออก
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const saveNewCourse = async () => {
    if (!isFormValid.value || isSaving.value) {
        return;
    }

    // Client-side duplicate check (แนะนำให้คงไว้)
    const enteredCode = newCourse.courseCode;
    const isDuplicate = courses.value.some((course) => course.courseCode === enteredCode);
    if (isDuplicate) {
        toast.add({ severity: 'warn', summary: 'ข้อมูลซ้ำ', detail: `รหัสวิชา ${enteredCode} นี้มีอยู่ในรายการแล้ว กรุณาตรวจสอบ`, life: 4000 });
        return;
    }

    isSaving.value = true;
    const courseToAdd: Course = {
        courseCode: newCourse.courseCode,
        courseNameTH: newCourse.courseNameTH,
        courseNameEN: newCourse.courseNameEN,
        credit: newCourse.credit,
        subjectGroup: newCourse.subjectGroup
    };

    try {
        const success = await courseService.pushCourse(courseToAdd);

        if (success) {
            // 1. แจ้งเตือนว่าสำเร็จ
            toast.add({ severity: 'success', summary: 'สำเร็จ', detail: 'บันทึกข้อมูลวิชาเรียบร้อยแล้ว', life: 3000 });

            // 2. ดึงข้อมูลใหม่
            await fetchCourses();

            // *** 3. หน่วงเวลาก่อนปิด Dialog ***
            const closeDelay = 500; // หน่วงเวลา 800 มิลลิวินาที (ประมาณ 0.8 วินาที) - ปรับค่าได้ตามต้องการ
            console.log(`บันทึกสำเร็จ, รอ ${closeDelay}ms ก่อนปิด Dialog...`);
            await delay(500); // รอตามเวลาที่กำหนด

            // 4. ปิด Dialog หลังจากหน่วงเวลา
            closeAddDialog();
        } else {
            // Backend รายงานว่าไม่สำเร็จ
            console.error('การบันทึกข้อมูลไม่สำเร็จ (Backend รายงาน)');
            toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: `ไม่สามารถบันทึก ${courseToAdd.courseCode} ได้ (อาจมีรหัสนี้อยู่แล้ว)`, life: 4000 });
            // *** ไม่ปิด Dialog ถ้า Backend ล้มเหลว ***
        }
    } catch (error) {
        // เกิด Exception ตอนเรียก API
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'เกิดข้อผิดพลาดในการเชื่อมต่อ หรือบันทึกข้อมูล', life: 3000 });
        // *** ไม่ปิด Dialog ถ้าเกิด Exception ***
    } finally {
        isSaving.value = false; // ปิดสถานะ Loading
    }
};
</script>

<style scoped>
/* ... CSS เหมือนเดิม ... */
.card {
    padding: 1rem;
    font-size: 1.3rem;
}

.search-container {
    margin-bottom: 1rem;
    max-width: 272px;
    margin-left: auto; /* ดันไปทางขวา */
    margin-right: 0;
}

.button-container {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
}

.form-container .field {
    margin-bottom: 1.2rem;
}

.form-container .field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.p-fluid .p-inputtext,
.p-fluid .p-inputnumber {
    width: 100%;
}
</style>
