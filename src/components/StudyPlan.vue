<script setup lang="ts">
import { getCurrentUser } from '@/service/authService'; // ตรวจสอบ path ให้ถูกต้อง
// import planService from '@/service/planService'; // *** ลบ import นี้ออก ***
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Fieldset from 'primevue/fieldset';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
// Interface PlannedCourseData เหมือนเดิม
interface PlannedCourseData {
    courseCode: string | null;
    courseNameTH: string;
    credit: number;
    isSelected: boolean;
    prerequisites?: string[];
}

// Refs ข้อมูลภาคการศึกษา เหมือนเดิม
const yr1Sem1 = ref<PlannedCourseData[]>([]);
const yr1Sem2 = ref<PlannedCourseData[]>([]);
const yr2Sem1 = ref<PlannedCourseData[]>([]);
const yr2Sem2 = ref<PlannedCourseData[]>([]);
const yr3Sem1 = ref<PlannedCourseData[]>([]);
const yr3Sem2 = ref<PlannedCourseData[]>([]);
const yr4Sem1 = ref<PlannedCourseData[]>([]);
const yr4Sem2 = ref<PlannedCourseData[]>([]);

// Refs ตัวแปรสถานะ เหมือนเดิม
const isLoading = ref(true);
// const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null); // เพิ่มสำหรับแจ้งผลสำเร็จชั่วคราว
const confirm = useConfirm();
const toast = useToast();

const getPrerequisiteTooltipMessage = (targetCourse: PlannedCourseData): string | null => {
    // ถ้าเงื่อนไขผ่านแล้ว หรือไม่มี prerequisites ไม่ต้องแสดง Tooltip
    if (arePrerequisitesMet(targetCourse) || !targetCourse.prerequisites || targetCourse.prerequisites.length === 0) {
        return null;
    }

    const unmetPrerequisitesNames: string[] = [];
    for (const prereqCode of targetCourse.prerequisites) {
        const prerequisiteCourse = findCourseByCode(prereqCode);
        // ถ้าหา prerequisite course ไม่เจอ หรือ เจอแต่ยังไม่ได้ติ๊กเลือก
        if (!prerequisiteCourse || !prerequisiteCourse.isSelected) {
            // ใช้ชื่อวิชาถ้าหาเจอ ถ้าไม่เจอ (ซึ่งไม่ควรเกิดถ้า template ถูกต้อง) ให้ใช้รหัสแทน
            unmetPrerequisitesNames.push(prerequisiteCourse?.courseNameTH || prereqCode);
        }
    }

    // ถ้ามีรายชื่อวิชาที่ยังไม่ผ่าน
    if (unmetPrerequisitesNames.length > 0) {
        return `ต้องผ่านวิชา: ${unmetPrerequisitesNames.join(', ')} มาก่อน`;
    }

    return null; // กรณีอื่นๆ (ไม่น่าเกิดถ้า logic ถูก)
};

const findCourseByCode = (code: string): PlannedCourseData | undefined => {
    if (!code) return undefined;
    for (const semester of allSemesters.value) {
        const found = semester.courses.find((c) => {
            // ตรวจสอบทั้งรหัสจริง หรือรหัส Placeholder ที่ map ได้
            const effectiveCode = c.courseCode || getPlaceholderCourseCode(c.courseNameTH);
            return effectiveCode === code;
        });
        if (found) return found;
    }
    return undefined;
};

// --- ฟังก์ชันตรวจสอบว่า Prerequisites ของวิชาถูกเลือกครบหรือยัง ---
const arePrerequisitesMet = (targetCourse: PlannedCourseData): boolean => {
    // ถ้าไม่มีการกำหนด prerequisites หรือไม่มีรายการ prerequisites เลย ถือว่าผ่าน
    if (!targetCourse.prerequisites || targetCourse.prerequisites.length === 0) {
        return true;
    }

    // ตรวจสอบ prerequisites ทีละตัว
    for (const prereqCode of targetCourse.prerequisites) {
        const prerequisiteCourse = findCourseByCode(prereqCode);

        // ถ้าหา prerequisite course ไม่เจอในแผน หรือ เจอแต่ยังไม่ได้ติ๊กเลือก (isSelected = false)
        if (!prerequisiteCourse || !prerequisiteCourse.isSelected) {
            // console.log(`Prerequisite [<span class="math-inline">\{prereqCode\}\] for course \[</span>{targetCourse.courseNameTH}] is NOT selected.`);
            return false; // เงื่อนไขไม่ผ่าน
        }
        // console.log(`Prerequisite [<span class="math-inline">\{prereqCode\}\] for course \[</span>{targetCourse.courseNameTH}] is selected.`);
    }

    // ถ้าวน Loop ครบ แสดงว่า prerequisites ทุกตัวถูกเลือกแล้ว
    // console.log(`All prerequisites for course [${targetCourse.courseNameTH}] are met.`);
    return true; // เงื่อนไขผ่าน
};

// Computed allSemesters เหมือนเดิม
const allSemesters = computed(() => [
    { title: 'ปีที่ 1 ภาคการศึกษาที่ 1', courses: yr1Sem1.value },
    { title: 'ปีที่ 1 ภาคการศึกษาที่ 2', courses: yr1Sem2.value },
    { title: 'ปีที่ 2 ภาคการศึกษาที่ 1', courses: yr2Sem1.value },
    { title: 'ปีที่ 2 ภาคการศึกษาที่ 2', courses: yr2Sem2.value },
    { title: 'ปีที่ 3 ภาคการศึกษาที่ 1', courses: yr3Sem1.value },
    { title: 'ปีที่ 3 ภาคการศึกษาที่ 2', courses: yr3Sem2.value },
    { title: 'ปีที่ 4 ภาคการศึกษาที่ 1', courses: yr4Sem1.value },
    { title: 'ปีที่ 4 ภาคการศึกษาที่ 2', courses: yr4Sem2.value }
]);

// Computed และ Functions คำนวณหน่วยกิต เหมือนเดิม
const totalSelectedCredits = computed(() => {
    let total = 0;
    allSemesters.value.forEach((semester) => {
        semester.courses.forEach((course) => {
            if (course.isSelected) {
                // ตรวจสอบ isSelected
                total += course.credit; // บวกหน่วยกิตถ้าถูกเลือก
            }
        });
    });
    return total;
});

const calculateSemesterSelectedCredits = (courses: PlannedCourseData[]): number => {
    let total = 0;
    courses.forEach((course) => {
        if (course.isSelected) {
            // ตรวจสอบ isSelected
            total += course.credit; // บวกหน่วยกิตถ้าถูกเลือก
        }
    });
    return total;
};

// Function getPlaceholderCourseCode เหมือนเดิม
const getPlaceholderCourseCode = (courseNameTH: string): string | null => {
    /* ... เหมือนเดิม ... */
};

// --- ฟังก์ชันบันทึกข้อมูล (ปรับปรุง) ---

const clearSelections = () => {
    confirm.require({
        message: 'คุณแน่ใจหรือไม่ว่าต้องการล้างค่าที่เลือกทั้งหมด?', // ข้อความใน Popup
        header: 'ยืนยันการล้างค่า', // หัวข้อ Popup
        icon: 'pi pi-exclamation-triangle', // ไอคอน (เลือกได้)
        rejectLabel: 'ยกเลิก', // ข้อความปุ่มปฏิเสธ
        acceptLabel: 'ยืนยัน', // ข้อความปุ่มยืนยัน
        rejectClass: 'p-button p-button-danger', // Style ปุ่ม (ตัวเลือก)
        acceptClass: 'p-button-success', // Style ปุ่ม (ตัวเลือก)
        accept: () => {
            // --- ส่วนนี้จะทำงานเมื่อผู้ใช้กดยืนยัน ---
            // เคลียร์ข้อความสถานะเก่า (ถ้ามี)
            errorMessage.value = null;
            successMessage.value = null; // อาจไม่จำเป็น

            // วนลูปผ่านทุกเทอม และทุกวิชาในเทอมนั้นๆ
            allSemesters.value.forEach((semester) => {
                semester.courses.forEach((course) => {
                    // ตั้งค่า isSelected เป็น false
                    course.isSelected = false;
                });
            });

            console.log('All course selections have been cleared.');

            // แสดง Toast แจ้งเตือนว่าสำเร็จ
            toast.add({
                severity: 'success', // ประเภท ('success', 'info', 'warn', 'error')
                summary: 'สำเร็จ', // หัวข้อ Toast
                detail: 'ล้างค่าที่เลือกทั้งหมดเรียบร้อยแล้ว', // รายละเอียด
                life: 3000 // ระยะเวลาแสดงผล (ms)
            });
        },
        reject: () => {
            // --- ส่วนนี้จะทำงานเมื่อผู้ใช้กดยกเลิก (ตัวเลือก) ---
            console.log('Clear selections cancelled.');
            /*
      toast.add({
          severity: 'info',
          summary: 'ยกเลิก',
          detail: 'การล้างค่าถูกยกเลิก',
          life: 3000
       });
       */
        }
    });
};

watch(
    allSemesters,
    () => {
        // ใช้ nextTick เพื่อรอให้การอัปเดต state เบื้องต้นเสร็จก่อน
        // ป้องกันกรณีที่ watcher ทำงานก่อนที่ v-model จะอัปเดตเสร็จสมบูรณ์
        nextTick(() => {
            // console.log('Watcher: Checking course states after change...');
            let correctionApplied = false;

            // วนลูปตรวจสอบทุกวิชาในแผน
            allSemesters.value.forEach((semester) => {
                semester.courses.forEach((course) => {
                    // ตรวจสอบว่า prerequisite ของวิชานี้ผ่านหรือไม่
                    const prerequisitesAreCurrentlyMet = arePrerequisitesMet(course);

                    // *** เงื่อนไขสำคัญ ***
                    // ถ้า prerequisite ไม่ผ่าน แต่ isSelected ยังเป็น true อยู่
                    if (!prerequisitesAreCurrentlyMet && course.isSelected) {
                        console.warn(`Watcher: Correcting "${course.courseNameTH}". Prerequisites not met but was selected. Forcing isSelected = false.`);
                        // บังคับให้ isSelected เป็น false
                        course.isSelected = false;
                        correctionApplied = true;
                    }
                });
            });

            // if (correctionApplied) {
            //     console.log("Watcher: Corrections applied.");
            // }
        });
    },
    { deep: true }
);

// --- โหลดข้อมูลเมื่อเริ่มต้นคอมโพเนนต์ (ปรับปรุง) ---
onMounted(async () => {
    try {
        isLoading.value = true;
        errorMessage.value = null;
        successMessage.value = null; // เคลียร์ข้อความตอนโหลดใหม่

        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            isLoading.value = false;
            return;
        }

        // โครงสร้างหลักสูตร (Template) - เหมือนเดิม
        const curriculumTemplate = {
            yr1Sem1: [
                { courseCode: '01417111', courseNameTH: 'แคลคูลัส I', credit: 3 },
                { courseCode: '01418111', courseNameTH: 'วิทยาการคอมพิวเตอร์เบื้องต้น', credit: 2 },
                { courseCode: '01418112', courseNameTH: 'แนวคิดการโปรแกรมเบื้องต้น', credit: 3, prerequisites: ['01418111'] },
                { courseCode: '01418141', courseNameTH: 'ทรัพย์สินทางปัญญาและจรรยาบรรณวิชาชีพ', credit: 3 },
                { courseCode: '01999111', courseNameTH: 'ศาสตร์แห่งแผ่นดิน', credit: 2 },
                { courseCode: null, courseNameTH: 'วิชาภาษาไทย', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา (1)', credit: 3 }
            ],
            yr1Sem2: [
                { courseCode: '01417322', courseNameTH: 'พีชคณิตเชิงเส้นเบื้องต้น', credit: 3 },
                { courseCode: '01418113', courseNameTH: 'การโปรแกรมคอมพิวเตอร์', credit: 3 },
                { courseCode: '01418131', courseNameTH: 'การโปรแกรมทางสถิติ', credit: 3 },
                { courseCode: '01418132', courseNameTH: 'หลักมูลการคณนา', credit: 3 },
                { courseCode: null, courseNameTH: 'กิจกรรมพลศึกษา', credit: 1 }, // ใช้ null ถ้าจะ map เป็น placeholder
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์', credit: 3 }
            ],
            yr2Sem1: [
                { courseCode: '01418211', courseNameTH: 'การสร้างซอฟต์แวร์', credit: 3, prerequisites: ['01418113'] },
                { courseCode: '01418231', courseNameTH: 'โครงสร้างข้อมูลและขั้นตอนวิธี', credit: 3, prerequisites: ['01418113'] },
                { courseCode: '01418233', courseNameTH: 'สถาปัตยกรรมคอมพิวเตอร์', credit: 3, prerequisites: ['01418113'] },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (1)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์', credit: 1 }, // Credit 1?
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข', credit: 2 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (1)', credit: 3 }
            ],
            yr2Sem2: [
                { courseCode: '01418221', courseNameTH: 'ระบบฐานข้อมูลเบื้องต้น', credit: 3, prerequisites: ['01418113'] },
                { courseCode: '01418232', courseNameTH: 'การออกแบบและวิเคราะห์ขั้นตอนวิธี', credit: 3, prerequisites: ['01418231'] },
                { courseCode: '01418236', courseNameTH: 'ระบบปฏิบัติการ', credit: 3, prerequisites: ['01418233'] },
                { courseCode: '01418261', courseNameTH: 'หลักพื้นฐานของปัญญาประดิษฐ์', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (2)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา (2)', credit: 3 }
            ],
            yr3Sem1: [
                { courseCode: '01418321', courseNameTH: 'การวิเคราะห์และการออกแบบระบบ', credit: 3, prerequisites: ['01418221'] },
                { courseCode: '01418331', courseNameTH: 'ทฤษฎีการคำนวณ', credit: 3, prerequisites: ['01418132'] },
                { courseCode: '01418351', courseNameTH: 'หลักการเครือข่ายคอมพิวเตอร์และการประมวลผลบนคลาวด์', credit: 3, prerequisites: ['01418236'] },
                { courseCode: '01418390', courseNameTH: 'การเตรียมความพร้อมสหกิจศึกษา', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (3)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา (3)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (2)', credit: 2 } // Credit 2?
            ],
            yr3Sem2: [
                { courseCode: '01418332', courseNameTH: 'ความมั่นคงในระบบสารสนเทศ', credit: 3, prerequisites: ['01418236'] },
                { courseCode: '01418371', courseNameTH: 'การบริหารโครงการและสตาร์ทอัพดิจิทัล', credit: 3, prerequisites: ['01418221'] },
                { courseCode: '01418497', courseNameTH: 'สัมมนา', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (4)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (5)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเลือกเสรี (1)', credit: 3 }
            ],
            yr4Sem1: [{ courseCode: '01418490', courseNameTH: 'สหกิจศึกษา', credit: 6, prerequisites: ['01418390'] }],
            yr4Sem2: [
                { courseCode: '01418499', courseNameTH: 'โครงงานวิทยาการคอมพิวเตอร์', credit: 3, prerequisites: ['01418321'] },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (6)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเลือกเสรี (2)', credit: 3 }
            ]
        };

        const plannedCourseCodes: string[] = []; // กำหนดเป็น Array ว่างเสมอ

        // ฟังก์ชัน map ข้อมูล template (เหมือนเดิม แต่ plannedCourseCodes จะเป็น [] เสมอ)
        const mapSemesterData = (templateCourses: any[], currentPlanCodes: string[]): PlannedCourseData[] => {
            return templateCourses.map((templateCourse) => {
                let effectiveCourseCode = templateCourse.courseCode;
                if (!effectiveCourseCode && templateCourse.courseNameTH) {
                    effectiveCourseCode = getPlaceholderCourseCode(templateCourse.courseNameTH);
                }
                const isSelected = effectiveCourseCode ? currentPlanCodes.includes(effectiveCourseCode) : false;

                return {
                    courseCode: templateCourse.courseCode,
                    courseNameTH: templateCourse.courseNameTH,
                    credit: templateCourse.credit,
                    isSelected: isSelected,
                    prerequisites: templateCourse.prerequisites || [] // *** เพิ่มบรรทัดนี้ ***
                };
            });
        };

        // อัปเดตข้อมูลทุกภาคการศึกษา (ทุก isSelected จะเป็น false)
        yr1Sem1.value = mapSemesterData(curriculumTemplate.yr1Sem1, plannedCourseCodes);
        yr1Sem2.value = mapSemesterData(curriculumTemplate.yr1Sem2, plannedCourseCodes);
        yr2Sem1.value = mapSemesterData(curriculumTemplate.yr2Sem1, plannedCourseCodes);
        yr2Sem2.value = mapSemesterData(curriculumTemplate.yr2Sem2, plannedCourseCodes);
        yr3Sem1.value = mapSemesterData(curriculumTemplate.yr3Sem1, plannedCourseCodes);
        yr3Sem2.value = mapSemesterData(curriculumTemplate.yr3Sem2, plannedCourseCodes);
        yr4Sem1.value = mapSemesterData(curriculumTemplate.yr4Sem1, plannedCourseCodes);
        yr4Sem2.value = mapSemesterData(curriculumTemplate.yr4Sem2, plannedCourseCodes);
    } catch (error: any) {
        // Error อื่นๆ ที่อาจเกิดขึ้น (เช่น ใน getCurrentUser หรือตอน map)
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลเบื้องต้น';
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <h2 class="text-primary">วางแผนการเรียน</h2>

    <div v-if="isLoading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else-if="successMessage" class="success-message">{{ successMessage }}</div>

    <div v-if="!isLoading">
        <div class="card summary-card">
            <div class="gpa-summary">
                <div class="gpa-item">
                    <span class="label">หน่วยกิตรวมที่เลือก:</span>
                    <span class="value">{{ totalSelectedCredits }}/124</span>
                </div>
                <div class="clear-button">
                    <Button label="ล้างค่าที่เลือก" icon="pi pi-refresh" @click="clearSelections" severity="help" />
                </div>
            </div>
        </div>

        <div v-for="(semesterData, index) in allSemesters" :key="index" class="card">
            <Fieldset :legend="semesterData.title" :toggleable="true">
                <DataTable :value="semesterData.courses" tableStyle="min-width: 50rem">
                    <Column header="เลือก" style="width: 10%" bodyClass="text-center">
                        <template #body="slotProps">
                            <span v-tooltip.top="getPrerequisiteTooltipMessage(slotProps.data)">
                                <Checkbox
                                    v-model="slotProps.data.isSelected"
                                    :binary="true"
                                    :disabled="!arePrerequisitesMet(slotProps.data)"
                                    :pt="{
                                        box: ({ props }) => ({
                                            class: props.disabled ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60' : ''
                                        })
                                    }"
                                />
                            </span>
                        </template>
                    </Column>
                    <Column field="courseCode" header="รหัสวิชา" style="width: 20%" />
                    <Column field="courseNameTH" header="ชื่อวิชา" style="width: 40%" />
                    <Column field="credit" header="หน่วยกิต" style="width: 20%" />
                </DataTable>
                <div class="semester-summary">
                    <div>หน่วยกิตที่เลือกในภาคนี้: {{ calculateSemesterSelectedCredits(semesterData.courses) }}</div>
                </div>
            </Fieldset>
        </div>
    </div>
</template>

<style scoped>
/* ... style เดิม ... */

/* เพิ่ม style สำหรับ success message (ตัวอย่าง) */
.card {
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card {
    background-color: #f8f9fa;
}

.success-message {
    color: #10b981; /* สีเขียว */
    text-align: center;
    padding: 1rem;
    margin: 1rem 0;
    background-color: #d1fae5; /* พื้นหลังเขียวอ่อน */
    border-radius: 4px;
    border: 1px solid #a7f3d0;
}

.semester-summary {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: #f1f5f9;
    border-radius: 4px;
}

.gpa-summary {
    display: flex; /* ทำให้เป็น flex container */
    justify-content: space-between; /* ดัน item ไปสุดซ้ายและขวา */
    align-items: center; /* จัดให้อยู่กึ่งกลางแนวตั้ง (สวยงาม) */
    padding: 1rem; /* เพิ่ม padding ตามความเหมาะสม */
    /* อาจมี style อื่นๆ อยู่แล้ว */
}

.gpa-item {
    /* อาจมีสไตล์เดิมอยู่แล้ว หรือเพิ่มเพื่อให้จัดวาง label กับ value ได้ดีขึ้น */
    display: inline-flex; /* ทำให้ label กับ value อยู่ติดกัน */
    align-items: baseline; /* จัดแนวข้อความให้ตรงกันที่ baseline */
}

.gpa-item .label {
    font-weight: bold;
    font-size: 1.2rem; /* <<-- ปรับขนาดตัวอักษร "หน่วยกิตรวมที่เลือก:" ที่นี่ (ตัวอย่าง: 1.1rem) */
    /* color: #6c757d; <<-- ปรับสีตัวอักษร "หน่วยกิตรวมที่เลือก:" (ตัวอย่าง: สีเทาเข้ม) */
    margin-right: 0.5rem; /* เพิ่มระยะห่างระหว่าง label กับ value เล็กน้อย */
}

.gpa-item .value {
    font-size: 1.3rem; /* <<-- ปรับขนาดตัวเลขหน่วยกิต ที่นี่ (ตัวอย่าง: 1.3rem ทำให้ใหญ่กว่า label) */
    color: #007bff; /* <<-- ปรับสีตัวเลขหน่วยกิต ที่นี่ (ตัวอย่าง: สีน้ำเงินหลัก) */
    font-weight: bold; /* ทำให้ตัวเลขดูเด่นขึ้น */
}
</style>
