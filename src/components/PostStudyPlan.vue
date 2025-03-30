<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { getCurrentUser } from '@/service/authService';
import gradeService from '@/service/gradeService';

// ข้อมูลภาคการศึกษา
const yr1Sem1 = ref([]);
const yr1Sem2 = ref([]);
const yr2Sem1 = ref([]);
const yr2Sem2 = ref([]);
const yr3Sem1 = ref([]);
const yr3Sem2 = ref([]);
const yr4Sem1 = ref([]);
const yr4Sem2 = ref([]);

// ตัวแปรสถานะ
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref(null);
const expandedRows = ref([]);

// ตัวเลือกเกรด
const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W', 'I']);

// รวมภาคการศึกษาทั้งหมด
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

// คำนวณหน่วยกิตรวม
const totalCredits = computed(() => {
    let total = 0;
    allSemesters.value.forEach((semester) => {
        semester.courses.forEach((course) => {
            if (course.grade && course.grade !== 'W' && course.grade !== 'I') {
                total += course.credit;
            }
        });
    });
    return total;
});

// คำนวณแต้มคะแนนของวิชา
const calculateGradePoint = (grade: string, credit: number) => {
    if (!grade || grade === 'W' || grade === 'I') return '-';

    const gradeValues = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };

    return (gradeValues[grade] * credit).toFixed(1);
};

// คำนวณ GPA ของภาคการศึกษา
const calculateSemesterGPA = (courses: any[]) => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
        if (course.grade && course.grade !== 'W' && course.grade !== 'I') {
            const gradeValues = {
                A: 4.0,
                'B+': 3.5,
                B: 3.0,
                'C+': 2.5,
                C: 2.0,
                'D+': 1.5,
                D: 1.0,
                F: 0
            };

            totalPoints += gradeValues[course.grade] * course.credit;
            totalCredits += course.credit;
        }
    });

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

// คำนวณหน่วยกิตรวมของภาคการศึกษา
const calculateSemesterCredits = (courses: any[]) => {
    let total = 0;
    courses.forEach((course) => {
        if (course.grade && course.grade !== 'W' && course.grade !== 'I') {
            total += course.credit;
        }
    });
    return total;
};

// คำนวณ GPAX
const calculateGPAX = () => {
    let totalPoints = 0;
    let totalCreds = 0;

    allSemesters.value.forEach((semester) => {
        semester.courses.forEach((course) => {
            if (course.grade && course.grade !== 'W' && course.grade !== 'I') {
                const gradeValues = {
                    A: 4.0,
                    'B+': 3.5,
                    B: 3.0,
                    'C+': 2.5,
                    C: 2.0,
                    'D+': 1.5,
                    D: 1.0,
                    F: 0
                };

                totalPoints += gradeValues[course.grade] * course.credit;
                totalCreds += course.credit;
            }
        });
    });

    return totalCreds === 0 ? 0 : totalPoints / totalCreds;
};

// เมื่อเปลี่ยนเกรด
const courseGradeChanged = (course: { isModified: boolean; }) => {
    course.isModified = true;
};

// กำหนด class ของแถวตามสถานะ
const getRowClass = (data: { isModified: any; grade: string; }) => {
    return {
        'modified-row': data.isModified,
        'passed-course': data.grade && data.grade !== 'F' && data.grade !== 'W' && data.grade !== 'I'
    };
};

// บันทึกเกรดของรายวิชา
const saveGrade = async (course : any) => {
    if (!course.courseCode) {
        return; // ไม่บันทึกหากไม่มีรหัสวิชา
    }

    try {
        const currentUser = getCurrentUser();

        if (!currentUser.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }

        isSaving.value = true;

        await gradeService.editGrade({
            studentID: currentUser.studentID,
            courseCode: course.courseCode,
            grade: course.grade,
            credit: course.credit
        });

        // ล้างสถานะการแก้ไข
        course.isModified = false;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกเกรด:', error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการบันทึกเกรด';
    } finally {
        isSaving.value = false;
    }
};

// บันทึกเกรดทั้งหมดที่มีการแก้ไข
const saveAllGrades = async () => {
    try {
        const currentUser = getCurrentUser();

        if (!currentUser.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }

        isSaving.value = true;

        const modifiedCourses: { studentID: any; courseCode: any; grade: any; credit: any; }[] = [];

        // รวบรวมวิชาที่มีการแก้ไข
        allSemesters.value.forEach((semester) => {
            semester.courses.forEach((course) => {
                if (course.isModified && course.courseCode) {
                    modifiedCourses.push({
                        studentID: currentUser.studentID,
                        courseCode: course.courseCode,
                        grade: course.grade,
                        credit: course.credit
                    });
                }
            });
        });

        if (modifiedCourses.length === 0) {
            return; // ไม่มีข้อมูลที่ต้องบันทึก
        }

        // บันทึกข้อมูลทั้งหมด
        await gradeService.pushGrades(modifiedCourses);

        // ล้างสถานะการแก้ไข
        allSemesters.value.forEach((semester) => {
            semester.courses.forEach((course) => {
                if (course.isModified) {
                    course.isModified = false;
                }
            });
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกเกรด:', error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการบันทึกเกรดทั้งหมด';
    } finally {
        isSaving.value = false;
    }
};

// โหลดข้อมูลเมื่อเริ่มต้นคอมโพเนนต์
onMounted(async () => {
    try {
        // ดึงข้อมูลผู้ใช้ปัจจุบัน
        const currentUser = getCurrentUser();

        if (!currentUser.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            isLoading.value = false;
            return;
        }

        // เตรียมข้อมูลโครงสร้างหลักสูตร (ข้อมูลดิบจากโค้ดเดิม)
        const curriculumTemplate = {
            yr1Sem1: [
                { courseCode: '01417111', courseNameTH: 'แคลคูลัส I', credit: 3 },
                { courseCode: '01418111', courseNameTH: 'วิทยาการคอมพิวเตอร์เบื้องต้น', credit: 2 },
                { courseCode: '01418112', courseNameTH: 'แนวคิดการโปรแกรมเบื้องต้น', credit: 3 },
                { courseCode: '01418141', courseNameTH: 'ทรัพย์สินทางปัญญาและจรรยาบรรณวิชาชีพ', credit: 3 },
                { courseCode: '01999111', courseNameTH: 'ศาสตร์แห่งแผ่นดิน', credit: 2 },
                { courseCode: '', courseNameTH: 'วิชาภาษาไทย', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา', credit: 3 }
            ],
            // เพิ่มข้อมูลภาคการศึกษาอื่นๆ ให้ครบตามโครงสร้างโค้ดเดิม
            yr1Sem2: [
                { courseCode: '01417322', courseNameTH: 'พีชคณิตเชิงเส้นเบื้องต้น', credit: 3 },
                { courseCode: '01418113', courseNameTH: 'การโปรแกรมคอมพิวเตอร์', credit: 3 },
                { courseCode: '01418131', courseNameTH: 'การโปรแกรมทางสถิติ', credit: 3 },
                { courseCode: '01418132', courseNameTH: 'หลักมูลการคณนา', credit: 3 },
                { courseCode: '01175xxx', courseNameTH: 'กิจกรรมพลศึกษา', credit: 1 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์', credit: 3 }
            ],
            // ข้อมูลปีที่ 2-4 ตามโครงสร้างเดิม
            yr2Sem1: [
                { courseCode: '01418211', courseNameTH: 'การสร้างซอฟต์แวร์', credit: 3 },
                { courseCode: '01418231', courseNameTH: 'โครงสร้างข้อมูลและขั้นตอนวิธี', credit: 3 },
                { courseCode: '01418233', courseNameTH: 'สถาปัตยกรรมคอมพิวเตอร์', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาเฉพาะเลือก', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์', credit: 1 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข', credit: 2 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ', credit: 3 }
            ],
            yr2Sem2: [
                { courseCode: '01418221', courseNameTH: 'ระบบฐานข้อมูลเบื้องต้น', credit: 3 },
                { courseCode: '01418232', courseNameTH: 'การออกแบบและวิเคราะห์ขั้นตอนวิธี', credit: 3 },
                { courseCode: '01418236', courseNameTH: 'ระบบปฏิบัติการ', credit: 3 },
                { courseCode: '01418261', courseNameTH: 'หลักพื้นฐานของปัญญาประดิษฐ์', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาเฉพาะเลือก', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา', credit: 3 }
            ],
            yr3Sem1: [
                { courseCode: '01418321', courseNameTH: 'การวิเคราะห์และการออกแบบระบบ', credit: 3 },
                { courseCode: '01418331', courseNameTH: 'ทฤษฎีการคำนวณ', credit: 3 },
                { courseCode: '01418351', courseNameTH: 'หลักการเครือข่ายคอมพิวเตอร์และการประมวลผลบนคลาวด์', credit: 3 },
                { courseCode: '01418390', courseNameTH: 'การเตรียมความพร้อมสหกิจศึกษา', credit: 1 },
                { courseCode: '', courseNameTH: 'วิชาเฉพาะเลือก', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก', credit: 1 },
                { courseCode: '', courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ', credit: 2 }
            ],
            yr3Sem2: [
                { courseCode: '01418332', courseNameTH: 'ความมั่นคงในระบบสารสนเทศ', credit: 3 },
                { courseCode: '01418371', courseNameTH: 'การบริหารโครงการและสตาร์ทอัพดิจิทัล', credit: 3 },
                { courseCode: '01418497', courseNameTH: 'สัมมนา', credit: 1 },
                { courseCode: '', courseNameTH: 'วิชาเฉพาะเลือก', credit: 6 },
                { courseCode: '', courseNameTH: 'วิชาเลือกเสรี', credit: 3 }
            ],
            yr4Sem1: [{ courseCode: '01418490', courseNameTH: 'สหกิจศึกษา', credit: 6 }],
            yr4Sem2: [
                { courseCode: '01418499', courseNameTH: 'โครงงานวิทยาการคอมพิวเตอร์', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาเฉพาะเลือก', credit: 3 },
                { courseCode: '', courseNameTH: 'วิชาเลือกเสรี', credit: 3 }
            ]
        };

        // ดึงข้อมูลเกรดของนักศึกษา
        const studentGrades = await gradeService.getStudentGradesByStudentId(currentUser.studentID);

        // อัปเดตข้อมูลด้วยเกรดที่มีอยู่
        const updateSemesterWithGrades = (semesterData: any[], grades: any[]) => {
            return semesterData.map((course) => {
                // ถ้ามีรหัสวิชา ตรวจสอบว่ามีเกรดหรือไม่
                if (course.courseCode) {
                    const gradeInfo = grades.find((g) => g.courseCode === course.courseCode);
                    if (gradeInfo) {
                        return {
                            ...course,
                            grade: gradeInfo.grade,
                            isModified: false
                        };
                    }
                }
                // กรณีไม่พบข้อมูลเกรด
                return { ...course, grade: null, isModified: false };
            });
        };

        // อัปเดตข้อมูลทุกภาคการศึกษา
        yr1Sem1.value = updateSemesterWithGrades(curriculumTemplate.yr1Sem1, studentGrades.grades);
        yr1Sem2.value = updateSemesterWithGrades(curriculumTemplate.yr1Sem2, studentGrades.grades);
        yr2Sem1.value = updateSemesterWithGrades(curriculumTemplate.yr2Sem1, studentGrades.grades);
        yr2Sem2.value = updateSemesterWithGrades(curriculumTemplate.yr2Sem2, studentGrades.grades);
        yr3Sem1.value = updateSemesterWithGrades(curriculumTemplate.yr3Sem1, studentGrades.grades);
        yr3Sem2.value = updateSemesterWithGrades(curriculumTemplate.yr3Sem2, studentGrades.grades);
        yr4Sem1.value = updateSemesterWithGrades(curriculumTemplate.yr4Sem1, studentGrades.grades);
        yr4Sem2.value = updateSemesterWithGrades(curriculumTemplate.yr4Sem2, studentGrades.grades);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยกิต';
    } finally {
        isLoading.value = false;
    }
});
</script>
<template>
    <h2 class="text-primary">บันทึกแผนการเรียน</h2>

    <div v-if="isLoading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else>
        <!-- สรุปเกรดเฉลี่ย -->
        <div class="card summary-card">
            <div class="gpa-summary">
                <div class="gpa-item">
                    <span class="label">เกรดเฉลี่ยรวม (GPAX):</span>
                    <span class="value">{{ calculateGPAX().toFixed(2) }}</span>
                </div>
                <div class="gpa-item">
                    <span class="label">หน่วยกิตรวม:</span>
                    <span class="value">{{ totalCredits }}/124</span>
                </div>
                <div class="save-button">
                    <Button label="บันทึกข้อมูลทั้งหมด" icon="pi pi-save" @click="saveAllGrades" :disabled="isSaving" />
                </div>
            </div>
        </div>

        <!-- แต่ละภาคการศึกษา -->
        <div v-for="(semesterData, index) in allSemesters" :key="index" class="card">
            <Fieldset :legend="semesterData.title" :toggleable="true">
                <DataTable :value="semesterData.courses" tableStyle="min-width: 50rem" v-model:expandedRows="expandedRows" dataKey="courseCode" :rowClass="getRowClass">
                    <Column field="courseCode" header="รหัสวิชา" style="width: 15%" />
                    <Column field="courseNameTH" header="ชื่อวิชา" style="width: 25%" />
                    <Column field="grade" header="เกรดวิชา" style="width: 20%">
                        <template #body="slotProps">
                            <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 80px" appendTo="body" @change="courseGradeChanged(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="credit" header="จำนวนหน่วยกิต" style="width: 15%" />
                    <Column field="gradePoint" header="แต้มคะแนน" style="width: 15%">
                        <template #body="slotProps">
                            {{ calculateGradePoint(slotProps.data.grade, slotProps.data.credit) }}
                        </template>
                    </Column>
                    <Column style="width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-save" outlined severity="success" @click="saveGrade(slotProps.data)" :disabled="!slotProps.data.isModified" />
                        </template>
                    </Column>
                </DataTable>
                <div class="semester-summary">
                    <div>จำนวนหน่วยกิตภาคการศึกษานี้: {{ calculateSemesterCredits(semesterData.courses) }}</div>
                    <div>เกรดเฉลี่ยภาคการศึกษานี้: {{ calculateSemesterGPA(semesterData.courses).toFixed(2) }}</div>
                </div>
            </Fieldset>
        </div>
    </div>
</template>

<style scoped>
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

.gpa-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
}

.gpa-item {
    display: flex;
    align-items: center;
    margin-right: 1rem;
}

.gpa-item .label {
    font-weight: bold;
    margin-right: 0.5rem;
}

.gpa-item .value {
    font-size: 1.2rem;
    color: #3b82f6;
}

.semester-summary {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: #f1f5f9;
    border-radius: 4px;
}

.modified-row {
    background-color: #fff9db !important;
}

.passed-course {
    background-color: #f0f9ff !important;
}

.loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #3b82f6;
}

.error-message {
    color: #ef4444;
    text-align: center;
    padding: 1rem;
    margin: 1rem 0;
    background-color: #fee2e2;
    border-radius: 4px;
}
</style>
