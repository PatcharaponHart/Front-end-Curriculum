<script setup lang="ts">
import { getCurrentUser } from '@/service/authService';
import gradeService from '@/service/gradeService';
import Button from 'primevue/button';
import Select from 'primevue/select';
import { computed, onMounted, ref } from 'vue';

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
const courseGradeChanged = (course: { isModified: boolean }) => {
    course.isModified = true;
};

// กำหนด class ของแถวตามสถานะ
const getRowClass = (data: { isModified: any; grade: string }) => {
    return {
        'modified-row': data.isModified,
        'passed-course': data.grade && data.grade !== 'F' && data.grade !== 'W' && data.grade !== 'I'
    };
};

// บันทึกเกรดของรายวิชา
interface CourseDisplayData {
    courseCode: string;
    grade: string | null;
    credit: number;
    isModified: boolean;
    wasInitiallyNull?: boolean; // ทำให้เป็น optional เผื่อกรณีไม่ได้ใส่มา
    // properties อื่นๆ ...
}

const saveGrade = async (course: CourseDisplayData) => {
    // ใช้ Type ที่สร้างขึ้น
    if (!course.courseCode) {
        console.warn('Save cancelled: Missing course code.');
        return;
    }
    try {
        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }
        isSaving.value = true;
        errorMessage.value = null;

        const payload: Grades = {
            studentId: currentUser.studentID,
            courseCode: course.courseCode,
            grade: course.grade || '', // ส่ง '' ถ้า grade เป็น null (หรือจัดการตามที่ Backend ต้องการ)
            credit: course.credit
        };

        // --- ส่วนตัดสินใจ Push หรือ Edit ---
        if (course.wasInitiallyNull && course.grade) {
            // กรณีที่ 1: ตอนแรกไม่มีเกรด (null) แต่ตอนนี้มีแล้ว -> เรียก PushGrade
            console.log('Calling PushGrade (was initially null, now has grade)...');
            await gradeService.pushGrade(payload);
            // ***** เพิ่มบรรทัดนี้ *****
            course.wasInitiallyNull = false; // อัปเดตสถานะว่าตอนนี้มีข้อมูลแล้ว
            // ***** สิ้นสุดการเพิ่ม *****
            course.isModified = false; // เคลียร์ isModified เหมือนเดิม
        } else if (!course.wasInitiallyNull && course.isModified) {
            // กรณีที่ 2: ตอนแรกมีเกรดอยู่แล้ว และมีการแก้ไข -> เรียก EditGrade
            console.log('Calling EditGrade (had initial grade and modified)...');
            await gradeService.editGrade(payload);
            course.isModified = false; // เคลียร์ isModified เหมือนเดิม
        } else if (course.wasInitiallyNull && !course.grade) {
            // กรณีที่ 3: ตอนแรกไม่มีเกรด ตอนนี้ก็ยังไม่มี (หรือลบออก) -> อาจจะไม่ต้องทำอะไร หรือจะลบข้อมูลที่ Backend? (ต้องออกแบบเพิ่ม)
            console.log('Skipping save (was initially null, still null/empty)');
            // ไม่เรียก API
        } else {
            // กรณีอื่นๆ เช่น ตอนแรกมีเกรด แต่ไม่ได้แก้ไข (isModified=false) -> ไม่ต้องทำอะไร
            console.log('Skipping save (not modified or other case)');
            // ไม่เรียก API
        }
        // --- สิ้นสุดการตัดสินใจ ---

        // ถ้ามีการเรียก API สำเร็จ (ไม่มี Error โยนออกมา) ให้เคลียร์สถานะ
        if (!(course.wasInitiallyNull && !course.grade)) {
            // เคลียร์ถ้าไม่ใช่กรณี 3
            course.isModified = false;
        }
        console.log('Save operation completed for', payload.courseCode);
        // แสดงข้อความสำเร็จ
    } catch (error: any) {
        console.error('Error saving grade:', error.response?.data || error.message || error);
        const backendError = error.response?.data?.title || error.response?.data?.message || error.message;
        errorMessage.value = 'เกิดข้อผิดพลาดในการบันทึกเกรด: ' + (backendError || 'ไม่ทราบสาเหตุ');
        // แสดง Toast Error
    } finally {
        isSaving.value = false;
    }
};

// บันทึกเกรดทั้งหมดที่มีการแก้ไข
const saveAllGrades = async () => {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }
        isSaving.value = true;
        errorMessage.value = null;

        // สร้าง List แยกสำหรับ Push และ Edit
        const gradesToPush: Grades[] = [];
        const gradesToEdit: Grades[] = [];
        // เก็บ reference ของ course ที่ถูก process ไว้เพื่ออัปเดต flag ทีหลัง
        const processedCourses: any[] = [];

        // รวบรวมและคัดแยกวิชาที่มีการแก้ไข
        allSemesters.value.forEach((semester) => {
            semester.courses.forEach((course: any & { wasInitiallyNull?: boolean }) => {
                // ใช้ Type ที่เหมาะสม
                if (course.isModified && course.courseCode) {
                    const payload: Grades = {
                        studentId: currentUser.studentID,
                        courseCode: course.courseCode,
                        grade: course.grade || '',
                        credit: course.credit
                    };

                    // ตัดสินใจว่าจะ Push หรือ Edit
                    if (course.wasInitiallyNull && course.grade) {
                        gradesToPush.push(payload);
                    } else if (!course.wasInitiallyNull) {
                        gradesToEdit.push(payload);
                    }
                    // เก็บ course ที่ต้องอัปเดต flag ไว้
                    processedCourses.push(course);
                }
            });
        });

        let pushSuccess = true;
        let editSuccess = true;

        // --- เรียก API แยกส่วน ---
        if (gradesToPush.length > 0) {
            console.log('Calling PushGrades with:', gradesToPush);
            try {
                await gradeService.pushGrades(gradesToPush);
                console.log('PushGrades successful');
                // อัปเดต wasInitiallyNull สำหรับตัวที่ push สำเร็จ
                processedCourses.forEach((course) => {
                    if (course.wasInitiallyNull && gradesToPush.some((p) => p.courseCode === course.courseCode && p.studentId === currentUser.studentID)) {
                        course.wasInitiallyNull = false;
                    }
                });
            } catch (pushError: any) {
                pushSuccess = false;
                console.error('Error pushing grades:', pushError.response?.data || pushError.message || pushError);
                errorMessage.value = 'เกิดข้อผิดพลาดในการเพิ่มเกรดใหม่: ' + (pushError.response?.data?.title || pushError.message);
                // อาจจะหยุดการทำงานส่วน Edit ต่อ หรือปล่อยให้ทำต่อก็ได้
            }
        }

        if (gradesToEdit.length > 0) {
            // ต้องแน่ใจว่า gradeService.updateGrades มีอยู่ และเรียก PUT /api/Grade/UpdateGrades
            // และ Backend UpdateGrades จัดการการ Update หลายรายการได้ (อาจจะต้องแก้ C# UpdateGrades ด้วย)
            console.log('Calling UpdateGrades with:', gradesToEdit);
            try {
                await gradeService.updateGrades(gradesToEdit);
                console.log('UpdateGrades successful');
            } catch (editError: any) {
                editSuccess = false;
                console.error('Error updating grades:', editError.response?.data || editError.message || editError);
                // ถ้ามี Error จาก Push ก่อนหน้า อาจจะรวม Error message
                const currentError = errorMessage.value ? errorMessage.value + '; ' : '';
                errorMessage.value = currentError + 'เกิดข้อผิดพลาดในการอัปเดตเกรดเดิม: ' + (editError.response?.data?.title || editError.message);
            }
        }
        // --- สิ้นสุดการเรียก API ---

        // ถ้าไม่มี Error เลย ให้ล้าง isModified ทั้งหมดที่ process ไป
        if (pushSuccess && editSuccess && processedCourses.length > 0) {
            processedCourses.forEach((course) => {
                course.isModified = false;
            });
            console.log('All modified flags cleared.');
            // แสดงข้อความสำเร็จทั้งหมด
        } else if (processedCourses.length === 0) {
            console.log('No grades needed saving.');
        } else {
            // มี Error เกิดขึ้น อาจจะต้องแจ้งผู้ใช้เพิ่มเติม
            console.log('Save completed with errors.');
        }
    } catch (error: any) {
        // Error อื่นๆ นอกเหนือจาก API Call
        console.error('Unexpected error in saveAllGrades:', error);
        if (!errorMessage.value) {
            errorMessage.value = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุในการบันทึกทั้งหมด';
        }
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
                if (course.courseCode) {
                    const gradeInfo = grades.find((g) => g.courseCode === course.courseCode);
                    // เพิ่ม property 'wasInitiallyNull'
                    const wasNull = !gradeInfo; // เป็น true ถ้าไม่เจอ gradeInfo (เกรดเป็น null ตอนโหลด)
                    return {
                        ...course,
                        grade: gradeInfo ? gradeInfo.grade : null,
                        isModified: false,
                        wasInitiallyNull: wasNull // เก็บสถานะเริ่มต้น
                    };
                }
                // กรณีไม่มี courseCode หรือกรณีอื่นๆ
                return { ...course, grade: null, isModified: false, wasInitiallyNull: true }; // สมมติว่าถ้าไม่มี courseCode ก็ถือว่าเริ่มที่ null
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
