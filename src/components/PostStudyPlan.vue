<script setup lang="ts">
import { getCurrentUser } from '@/service/authService'; // ตรวจสอบ path ให้ถูกต้อง
import gradeService, { Grades } from '@/service/gradeService'; // ตรวจสอบ path และ export ให้ถูกต้อง
import Button from 'primevue/button'; // จำเป็นถ้าใช้ Button ใน template ที่ไม่ได้แสดง
// import Dropdown from 'primevue/dropdown'; // ถ้าใช้ Dropdown ใน template
import Select from 'primevue/select'; // ถ้าใช้ Select ใน template
import { computed, onMounted, ref } from 'vue';

// --- Interface สำหรับข้อมูล Course ---
interface CourseDisplayData {
    courseCode: string | null; // อาจเป็น null ได้ในตอนแรก
    courseNameTH: string;
    credit: number;
    grade: string | null;
    isModified: boolean;
    wasInitiallyNull?: boolean; // สถานะว่าตอนโหลดมามีเกรดหรือไม่
}

// --- ข้อมูลภาคการศึกษา (Refs) ---
const yr1Sem1 = ref<CourseDisplayData[]>([]);
const yr1Sem2 = ref<CourseDisplayData[]>([]);
const yr2Sem1 = ref<CourseDisplayData[]>([]);
const yr2Sem2 = ref<CourseDisplayData[]>([]);
const yr3Sem1 = ref<CourseDisplayData[]>([]);
const yr3Sem2 = ref<CourseDisplayData[]>([]);
const yr4Sem1 = ref<CourseDisplayData[]>([]);
const yr4Sem2 = ref<CourseDisplayData[]>([]);

// --- ตัวแปรสถานะ ---
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const expandedRows = ref([]); // หากใช้ DataTable ที่มี expand ใน template

// --- ตัวเลือกเกรด ---
const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D']);

// --- รวมภาคการศึกษาทั้งหมด (Computed) ---
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

// --- ฟังก์ชันคำนวณ ---

// คำนวณหน่วยกิตรวมที่นับเกรด (A-F)
const totalCredits = computed(() => {
    let total = 0;
    const gradeValues: { [key: string]: number } = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };
    allSemesters.value.forEach((semester) => {
        semester.courses.forEach((course) => {
            if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
                total += course.credit;
            }
        });
    });
    return total;
});

// คำนวณแต้มคะแนนของวิชา (แสดงผล)
const calculateGradePoint = (grade: string | null, credit: number): string => {
    if (!grade || ['W', 'I'].includes(grade)) return '-';

    const gradeValues: { [key: string]: number } = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };

    // ตรวจสอบเผื่อเป็นเกรดที่ไม่ใช่ A-F แต่หลุดมา (เช่น W, I)
    if (!gradeValues.hasOwnProperty(grade)) return '-';

    return (gradeValues[grade] * credit).toFixed(1);
};

// คำนวณ GPA ของภาคการศึกษา
const calculateSemesterGPA = (courses: CourseDisplayData[]): number => {
    let totalPoints = 0;
    let totalCreditsForGPA = 0;
    const gradeValues: { [key: string]: number } = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };

    courses.forEach((course) => {
        // คำนวณ GPA เฉพาะเกรดที่มีค่า (A-F)
        if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
            totalPoints += gradeValues[course.grade] * course.credit;
            totalCreditsForGPA += course.credit;
        }
    });

    // ป้องกันการหารด้วยศูนย์
    return totalCreditsForGPA === 0 ? 0.0 : totalPoints / totalCreditsForGPA;
};

// คำนวณหน่วยกิตรวมของภาคการศึกษา (ที่นับเกรด A-F)
const calculateSemesterCredits = (courses: CourseDisplayData[]): number => {
    let total = 0;
    const gradeValues: { [key: string]: number } = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };
    courses.forEach((course) => {
        if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
            total += course.credit;
        }
    });
    return total;
};

// คำนวณ GPAX
const calculateGPAX = (): number => {
    let totalPoints = 0;
    let totalCreditsForGPA = 0;
    const gradeValues: { [key: string]: number } = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0
    };

    allSemesters.value.forEach((semester) => {
        semester.courses.forEach((course) => {
            // คำนวณ GPAX เฉพาะเกรดที่มีค่า (A-F)
            if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
                totalPoints += gradeValues[course.grade] * course.credit;
                totalCreditsForGPA += course.credit;
            }
        });
    });

    // ป้องกันการหารด้วยศูนย์
    return totalCreditsForGPA === 0 ? 0.0 : totalPoints / totalCreditsForGPA;
};

// --- ฟังก์ชัน UI Helpers ---

// เมื่อเปลี่ยนเกรดใน Dropdown/Select
const courseGradeChanged = (course: CourseDisplayData) => {
    course.isModified = true;
};

// กำหนด class ของแถวตามสถานะ (สำหรับ styling ใน template)
const getRowClass = (data: CourseDisplayData): object => {
    return {
        'modified-row': data.isModified, // แถวที่ถูกแก้ไข
        'passed-course': data.grade && !['F', 'W', 'I'].includes(data.grade), // ผ่าน (ไม่ F, W, I)
        'failed-course': data.grade === 'F' // ตก (F)
    };
};

// --- ฟังก์ชัน Helper สำหรับกำหนด Course Code ---
const getPlaceholderCourseCode = (courseNameTH: string): string | null => {
    const trimmedName = courseNameTH.trim();
    // *** กรุณาปรับแก้ Placeholder Codes ให้ตรงกับที่ Backend คาดหวัง ***
    // ใช้ 'XXXX' หรือ '0000' หรือรหัสเฉพาะอื่นๆ
    const mappings: { [key: string]: string } = {
        'วิชาภาษาไทย': '12230000',
        'วิชาภาษาต่างประเทศ 1 ภาษา (1)': '12240001',
        'วิชาภาษาต่างประเทศ 1 ภาษา (2)': '12240002',
        'วิชาภาษาต่างประเทศ 1 ภาษา (3)': '12240003',
        'กิจกรรมพลศึกษา': '01175xxx',
        'วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ': '01310000',
        'วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์': '01320000',
        'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข': '01330000',
        'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (1)': '01340001',
        'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (2)': '01340002',
        'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก': '01350000',
        'วิชาสารสนเทศ/คอมพิวเตอร์': '01418000',
        'วิชาเฉพาะเลือก (1)': '14450001',
        'วิชาเฉพาะเลือก (2)': '14450002',
        'วิชาเฉพาะเลือก (3)': '14450003',
        'วิชาเฉพาะเลือก (4)': '14450004',
        'วิชาเฉพาะเลือก (5)': '14450005',
        'วิชาเลือกเสรี (1)': '00001111',
        'วิชาเลือกเสรี (2)': '00001112'
        // เพิ่มเติม: ตรวจสอบวิชาอื่นๆ ใน template ที่ courseCode เป็น null และเพิ่ม mapping ที่นี่
    };

    return mappings[trimmedName] || null; // คืนค่ารหัสที่ map เจอ หรือ null ถ้าไม่เจอ
};

// --- ฟังก์ชันบันทึกข้อมูล ---

const otherCourses = ref<CourseDisplayData[]>([]);

const courseDataChanged = (course: CourseDisplayData) => {
    // ทำการอัปเดตข้อมูล course ใน otherCourses ref
    const index = otherCourses.value.findIndex((c) => c.courseCode === course.courseCode);
    if (index !== -1) {
        otherCourses.value[index] = { ...course };
    }
};
const addNewOtherCourse = () => {
    // เพิ่มวิชาใหม่ใน otherCourses ref
    otherCourses.value.push({
        courseCode: '',
        courseNameTH: '',
        grade: '',
        credit: 0,
        isModified: true,
        wasInitiallyNull: true
    });
};
const removeOtherCourse = (course: CourseDisplayData) => {
    // ลบวิชาใน otherCourses ref
    const index = otherCourses.value.findIndex((c) => c.courseCode === course.courseCode);
    if (index !== -1) {
        otherCourses.value.splice(index, 1);
    }
};

// บันทึกเกรดของรายวิชาเดียว
const saveGrade = async (course: CourseDisplayData) => {
    // ป้องกันการกดซ้ำซ้อนขณะกำลังบันทึก
    if (isSaving.value) return;

    try {
        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }
        isSaving.value = true; // เริ่มบันทึก
        errorMessage.value = null;

        // --- กำหนด Course Code ---
        let effectiveCourseCode = course.courseCode;
        if (!effectiveCourseCode && course.courseNameTH) {
            effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
        }

        if (!effectiveCourseCode) {
            console.warn(`Save cancelled: Missing or unmappable course code for "${course.courseNameTH}".`);
            errorMessage.value = `ไม่สามารถบันทึกได้: ไม่พบรหัสวิชาที่ถูกต้องสำหรับ "${course.courseNameTH}"`;
            isSaving.value = false; // หยุดสถานะ loading
            return; // ไม่ดำเนินการต่อ
        }
        // --- สิ้นสุดกำหนด Course Code ---

        const payload: Grades = {
            studentId: currentUser.studentID,
            courseCode: effectiveCourseCode,
            grade: course.grade || '', // ส่งค่าว่างถ้าเป็น null
            credit: course.credit
        };

        let apiCalled = false;
        if (course.wasInitiallyNull && course.grade) {
            console.log('Calling PushGrade...', payload);
            await gradeService.pushGrade(payload);
            course.wasInitiallyNull = false; // อัปเดตสถานะว่ามีข้อมูลแล้ว
            apiCalled = true;
        } else if (!course.wasInitiallyNull && course.isModified) {
            // ถ้าตอนแรกมีข้อมูล และมีการแก้ไข (ไม่ว่าจะแก้เป็นเกรดอะไร หรือลบเกรด)
            console.log('Calling EditGrade...', payload);
            await gradeService.editGrade(payload);
            apiCalled = true;
        } else if (course.wasInitiallyNull && !course.grade) {
            // ตอนแรก null, แก้ไข แต่ก็ยังเป็น null -> ไม่ต้องทำอะไร ไม่ถือว่ามีการเปลี่ยนแปลงข้อมูล
            console.log('Skipping save (was initially null, still null/empty)');
            // ควรเคลียร์ isModified ด้วย เพราะถือว่าไม่มีการเปลี่ยนแปลงที่ต้องบันทึก
            course.isModified = false;
        } else {
            // ไม่ได้แก้ไข หรือกรณีอื่นๆ ที่ไม่ต้องเรียก API
            console.log('Skipping save (not modified or other case)');
        }

        // เคลียร์ isModified ถ้า API ถูกเรียกและสำเร็จ
        if (apiCalled) {
            course.isModified = false;
            console.log('Save operation completed for', effectiveCourseCode);
            // อาจจะแสดง Toast แจ้งสำเร็จสำหรับรายการนี้
        }
    } catch (error: any) {
        console.error('Error saving grade:', error.response?.data || error.message || error);
        const backendError = error.response?.data?.title || error.response?.data?.message || error.message;
        errorMessage.value = `เกิดข้อผิดพลาดในการบันทึกเกรดวิชา ${course.courseNameTH}: ` + (backendError || 'ไม่ทราบสาเหตุ');
        // แสดง Toast Error
    } finally {
        isSaving.value = false; // สิ้นสุดการบันทึก (ไม่ว่าจะสำเร็จหรือล้มเหลว)
    }
};

// บันทึกเกรดทั้งหมดที่มีการแก้ไข
const saveAllGrades = async () => {
    // ป้องกันการกดซ้ำซ้อน
    if (isSaving.value) return;

    try {
        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            return;
        }
        isSaving.value = true; // เริ่มบันทึกทั้งหมด
        errorMessage.value = null; // เคลียร์ข้อผิดพลาดเก่า

        const gradesToPush: Grades[] = [];
        const gradesToEdit: Grades[] = [];
        const coursesToResetFlag: CourseDisplayData[] = []; // รายการที่จะเคลียร์ isModified ถ้าสำเร็จ
        const skippedCourses: { name: string; reason: string }[] = [];

        allSemesters.value.forEach((semester) => {
            semester.courses.forEach((course) => {
                if (course.isModified) {
                    // --- กำหนด Course Code ---
                    let effectiveCourseCode = course.courseCode;
                    if (!effectiveCourseCode && course.courseNameTH) {
                        effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
                    }

                    if (!effectiveCourseCode) {
                        console.warn(`Skipping save for course "${course.courseNameTH}" in saveAll due to missing/unmappable code.`);
                        skippedCourses.push({ name: course.courseNameTH, reason: 'ไม่พบรหัสวิชา' });
                        // *** ไม่เคลียร์ isModified ของตัวที่ข้าม *** ผู้ใช้ต้องแก้ไขเอง
                        return; // ข้าม course นี้
                    }
                    // --- สิ้นสุดกำหนด Course Code ---

                    const payload: Grades = {
                        studentId: currentUser.studentID,
                        courseCode: effectiveCourseCode,
                        grade: course.grade || '',
                        credit: course.credit
                    };

                    // ตัดสินใจว่าจะ Push หรือ Edit
                    if (course.wasInitiallyNull && course.grade) {
                        gradesToPush.push(payload);
                        coursesToResetFlag.push(course); // เพิ่มในรายการที่จะเคลียร์ flag
                    } else if (!course.wasInitiallyNull) {
                        // ถ้าตอนแรกมีข้อมูล (ไม่ว่าจะแก้เป็นเกรดอะไร หรือลบ)
                        gradesToEdit.push(payload);
                        coursesToResetFlag.push(course); // เพิ่มในรายการที่จะเคลียร์ flag
                    } else if (course.wasInitiallyNull && !course.grade) {
                        // ตอนแรก null, แก้แล้ว แต่ก็ยังเป็น null -> ไม่ต้องทำอะไร และเคลียร์ flag ได้เลย
                        console.log(`Clearing modified flag for ${effectiveCourseCode} - was null, still null.`);
                        course.isModified = false; // เคลียร์ flag ที่นี่เลย
                    }
                }
            });
        });

        // ตรวจสอบว่ามีอะไรต้องบันทึกหรือไม่
        if (gradesToPush.length === 0 && gradesToEdit.length === 0) {
            console.log('No grades need saving via API.');
            if (skippedCourses.length > 0) {
                errorMessage.value = `มี ${skippedCourses.length} รายการที่ไม่สามารถบันทึกได้เนื่องจากไม่พบรหัสวิชา: ${skippedCourses.map((s) => s.name).join(', ')}`;
            } else {
                errorMessage.value = 'ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก'; // หรือใช้ Toast แจ้งเตือน
            }
            isSaving.value = false;
            return; // ออกจากฟังก์ชันถ้าไม่มีอะไรส่งไป API
        }

        let pushSuccess = true;
        let editSuccess = true;
        let pushErrorMsg: string | null = null;
        let editErrorMsg: string | null = null;

        // --- เรียก API Push ---
        if (gradesToPush.length > 0) {
            console.log('Calling PushGrades with:', gradesToPush);
            try {
                // *** สมมติว่ามี gradeService.pushGrades ที่รับ Array ***
                // ถ้าไม่มี ต้องวนลูปเรียก gradeService.pushGrade ทีละตัว
                await gradeService.pushGrades(gradesToPush);
                console.log('PushGrades successful');
                // อัปเดต wasInitiallyNull สำหรับตัวที่ push สำเร็จ (สำคัญมาก)
                coursesToResetFlag.forEach((course) => {
                    // หา effectiveCode อีกครั้งเผื่อกรณี
                    let effectiveCode = course.courseCode || getPlaceholderCourseCode(course.courseNameTH);
                    if (course.wasInitiallyNull && gradesToPush.some((p) => p.courseCode === effectiveCode)) {
                        course.wasInitiallyNull = false;
                    }
                });
            } catch (pushError: any) {
                pushSuccess = false;
                console.error('Error pushing grades:', pushError.response?.data || pushError.message || pushError);
                pushErrorMsg = 'เกิดข้อผิดพลาดในการเพิ่มเกรดใหม่: ' + (pushError.response?.data?.title || pushError.message || 'ไม่ทราบสาเหตุ');
            }
        }

        // --- เรียก API Edit ---
        if (gradesToEdit.length > 0) {
            console.log('Calling EditGrade (looping) for:', gradesToEdit);
            // *** วนลูปเรียก editGrade ทีละตัว ***
            // (ถ้ามี endpoint /UpdateGrades ที่รับ Array ได้ จะดีกว่า)
            let individualEditErrors = 0;
            try {
                for (const gradePayload of gradesToEdit) {
                    try {
                        await gradeService.editGrade(gradePayload);
                    } catch (singleEditError: any) {
                        individualEditErrors++;
                        console.error(`Error editing grade ${gradePayload.courseCode}:`, singleEditError.response?.data || singleEditError.message || singleEditError);
                        // เก็บข้อผิดพลาดแรก หรือข้อผิดพลาดรวม (อาจจะยาวไป)
                        if (!editErrorMsg) {
                            editErrorMsg = `เกิดข้อผิดพลาดในการอัปเดตเกรดวิชา ${gradePayload.courseCode}: ` + (singleEditError.response?.data?.title || singleEditError.message || 'ไม่ทราบสาเหตุ');
                        }
                    }
                }
                if (individualEditErrors === 0) {
                    console.log('Edit Grades successful');
                } else {
                    console.log(`Edit Grades completed with ${individualEditErrors} errors.`);
                    editSuccess = false; // มี error ในการ edit อย่างน้อย 1 รายการ
                    // editErrorMsg ถูกกำหนดค่าแล้วใน loop
                }
            } catch (loopError: any) {
                // Error ที่เกิดนอกเหนือจากการเรียก API แต่ละตัว (ไม่น่าเกิด)
                editSuccess = false;
                console.error('Unexpected error during editing loop:', loopError);
                if (!editErrorMsg) {
                    // ถ้ายังไม่มี error message จากข้างใน
                    editErrorMsg = 'เกิดข้อผิดพลาดระหว่างการอัปเดตเกรด';
                }
            }
        }

        // --- สรุปผลและเคลียร์ Flag ---
        const allApisSucceeded = pushSuccess && editSuccess;

        if (allApisSucceeded) {
            // เคลียร์ isModified ของรายการที่ process สำเร็จทั้งหมด (อยู่ใน coursesToResetFlag)
            coursesToResetFlag.forEach((course) => {
                course.isModified = false;
            });
            console.log('All processed modified flags cleared.');
            // แสดงข้อความสำเร็จ (อาจรวมถึงรายการที่ข้าม)
            if (skippedCourses.length > 0) {
                errorMessage.value = `บันทึกสำเร็จ ${coursesToResetFlag.length} รายการ มี ${skippedCourses.length} รายการที่ไม่สามารถบันทึกได้: ${skippedCourses.map((s) => s.name).join(', ')}`;
                // ใช้ Toast สีเหลือง (Warning)
            } else {
                // แสดง Toast สีเขียว สำเร็จสมบูรณ์
                console.log('บันทึกข้อมูลทั้งหมดสำเร็จ');
                // อาจจะตั้งค่า Success message ให้แสดงใน template ชั่วคราว
                // successMessage.value = "บันทึกข้อมูลทั้งหมดสำเร็จ";
            }
        } else {
            // มี Error เกิดขึ้น หรือ มีการข้ามรายการ และ API ล้มเหลว
            console.log('Save completed with errors or skipped items.');
            let finalErrorMessage = '';
            if (pushErrorMsg) finalErrorMessage += pushErrorMsg;
            if (editErrorMsg) finalErrorMessage += (finalErrorMessage ? '; ' : '') + editErrorMsg;

            if (skippedCourses.length > 0) {
                finalErrorMessage += (finalErrorMessage ? '; ' : '') + `มี ${skippedCourses.length} รายการที่ไม่สามารถบันทึกได้เนื่องจากไม่พบรหัสวิชา.`;
            }
            errorMessage.value = finalErrorMessage || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุในการบันทึก'; // ข้อความ fallback
            // แสดง Toast Error รวม
            // *** สำคัญ: ไม่เคลียร์ isModified ของรายการที่ API ล้มเหลว ***
        }
    } catch (error: any) {
        console.error('Unexpected error in saveAllGrades:', error);
        if (!errorMessage.value) {
            // ถ้ายังไม่มี error message จากข้างใน
            errorMessage.value = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุในการบันทึกทั้งหมด';
        }
        // แสดง Toast Error
    } finally {
        isSaving.value = false; // สิ้นสุดการบันทึกทั้งหมด
    }
};

// --- โหลดข้อมูลเมื่อเริ่มต้นคอมโพเนนต์ ---
onMounted(async () => {
    try {
        isLoading.value = true; // เริ่มต้น loading
        errorMessage.value = null;
        const currentUser = getCurrentUser();
        if (!currentUser?.studentID) {
            errorMessage.value = 'ไม่พบรหัสนักศึกษา';
            isLoading.value = false;
            return;
        }

        // --- โครงสร้างหลักสูตร (Template) ---
        // *** ตรวจสอบความถูกต้องและครบถ้วนของหลักสูตร และกำหนด courseCode: null สำหรับวิชาไม่มีรหัส ***
        const curriculumTemplate = {
            yr1Sem1: [
                { courseCode: '01417111', courseNameTH: 'แคลคูลัส I', credit: 3 },
                { courseCode: '01418111', courseNameTH: 'วิทยาการคอมพิวเตอร์เบื้องต้น', credit: 2 },
                { courseCode: '01418112', courseNameTH: 'แนวคิดการโปรแกรมเบื้องต้น', credit: 3 },
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
                { courseCode: '01418211', courseNameTH: 'การสร้างซอฟต์แวร์', credit: 3 },
                { courseCode: '01418231', courseNameTH: 'โครงสร้างข้อมูลและขั้นตอนวิธี', credit: 3 },
                { courseCode: '01418233', courseNameTH: 'สถาปัตยกรรมคอมพิวเตอร์', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (1)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาสารสนเทศ/คอมพิวเตอร์', credit: 1 }, // Credit 1?
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข', credit: 2 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (1)', credit: 3 }
            ],
            yr2Sem2: [
                { courseCode: '01418221', courseNameTH: 'ระบบฐานข้อมูลเบื้องต้น', credit: 3 },
                { courseCode: '01418232', courseNameTH: 'การออกแบบและวิเคราะห์ขั้นตอนวิธี', credit: 3 },
                { courseCode: '01418236', courseNameTH: 'ระบบปฏิบัติการ', credit: 3 },
                { courseCode: '01418261', courseNameTH: 'หลักพื้นฐานของปัญญาประดิษฐ์', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (2)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา (2)', credit: 3 }
            ],
            yr3Sem1: [
                { courseCode: '01418321', courseNameTH: 'การวิเคราะห์และการออกแบบระบบ', credit: 3 },
                { courseCode: '01418331', courseNameTH: 'ทฤษฎีการคำนวณ', credit: 3 },
                { courseCode: '01418351', courseNameTH: 'หลักการเครือข่ายคอมพิวเตอร์และการประมวลผลบนคลาวด์', credit: 3 },
                { courseCode: '01418390', courseNameTH: 'การเตรียมความพร้อมสหกิจศึกษา', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (3)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาภาษาต่างประเทศ 1 ภาษา (3)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (2)', credit: 2 } // Credit 2?
            ],
            yr3Sem2: [
                { courseCode: '01418332', courseNameTH: 'ความมั่นคงในระบบสารสนเทศ', credit: 3 },
                { courseCode: '01418371', courseNameTH: 'การบริหารโครงการและสตาร์ทอัพดิจิทัล', credit: 3 },
                { courseCode: '01418497', courseNameTH: 'สัมมนา', credit: 1 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (4)', credit: 6 }, // 6 หน่วยกิต อาจเป็น 2 วิชา?
                { courseCode: null, courseNameTH: 'วิชาเลือกเสรี (1)', credit: 3 }
            ],
            yr4Sem1: [{ courseCode: '01418490', courseNameTH: 'สหกิจศึกษา', credit: 6 }],
            yr4Sem2: [
                { courseCode: '01418499', courseNameTH: 'โครงงานวิทยาการคอมพิวเตอร์', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (5)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเลือกเสรี (2)', credit: 3 }
            ]
        };

        const templateCourseCodes = new Set<string>();
        Object.values(curriculumTemplate)
            .flat()
            .forEach((course) => {
                // วนลูปทุกวิชาใน template
                if (course.courseCode) {
                    templateCourseCodes.add(course.courseCode);
                } else if (course.courseNameTH) {
                    // หารหัส Placeholder และเพิ่มเข้าไปใน Set ถ้ามี
                    const placeholderCode = getPlaceholderCourseCode(course.courseNameTH);
                    if (placeholderCode) {
                        templateCourseCodes.add(placeholderCode);
                    }
                }
            });

        // ดึงข้อมูลเกรดของนักศึกษา
        const studentGradesResponse = await gradeService.getStudentGradesByStudentId(currentUser.studentID);
        const fetchedGrades = studentGradesResponse?.grades ?? []; // ใช้ ?? เพื่อให้เป็น Array ว่างถ้าไม่มี grades property

        // ฟังก์ชัน map ข้อมูล template กับ เกรดที่ดึงมา
        const mapSemesterData = (templateCourses: any[], studentGradesData: any[]): CourseDisplayData[] => {
            return templateCourses.map((templateCourse) => {
                let foundGradeInfo = null;
                let codeToSearch: string | null = null; // ตัวแปรเก็บรหัสที่จะใช้ค้นหา

                // 1. ตรวจสอบว่า template มี courseCode หรือไม่
                if (templateCourse.courseCode) {
                    // ถ้ามี ใช้รหัสจาก template โดยตรง
                    codeToSearch = templateCourse.courseCode;
                } else if (templateCourse.courseNameTH) {
                    // ถ้าไม่มี (เป็น null) ให้ลองหารหัส placeholder จากชื่อวิชา
                    codeToSearch = getPlaceholderCourseCode(templateCourse.courseNameTH);
                    // console.log(`Template code is null for ${templateCourse.courseNameTH}, using placeholder to search: ${codeToSearch}`);
                }

                // 2. ถ้ามีรหัสที่จะใช้ค้นหา (ไม่ว่าจะเป็นรหัสจริง หรือ placeholder)
                if (codeToSearch) {
                    // ค้นหาข้อมูลเกรดใน fetchedGrades โดยใช้รหัสนี้
                    foundGradeInfo = studentGradesData.find((g) => g.courseCode === codeToSearch);
                    // if (foundGradeInfo) {
                    //     console.log(`Found grade for ${codeToSearch}:`, foundGradeInfo);
                    // } else if(templateCourse.courseCode === null) {
                    //      console.log(`Grade not found for placeholder ${codeToSearch} (${templateCourse.courseNameTH})`);
                    // }
                }
                // ถ้า codeToSearch เป็น null (เช่น ชื่อวิชาไม่ตรงกับใน map) foundGradeInfo จะยังเป็น null

                const initialGrade = foundGradeInfo ? foundGradeInfo.grade : null;
                // wasInitiallyNull ยังคงขึ้นอยู่กับว่าเราหาข้อมูลเกรดเจอหรือไม่ สำหรับ representation นี้
                const wasNull = !foundGradeInfo;

                return {
                    courseCode: templateCourse.courseCode, // **สำคัญ**: ยังคงใช้ courseCode จาก template (ซึ่งเป็น null สำหรับวิชาที่ map) เพื่อให้ UI และ logic การ save ทำงานถูกต้อง
                    courseNameTH: templateCourse.courseNameTH,
                    credit: templateCourse.credit,
                    grade: initialGrade, // ใส่เกรดที่หาเจอ (ถ้ามี)
                    isModified: false, // เริ่มต้นยังไม่แก้ไข
                    wasInitiallyNull: wasNull // สถานะว่าตอนโหลดมีข้อมูลเกรดหรือไม่
                };
            });
        };
        // อัปเดตข้อมูลทุกภาคการศึกษา
        yr1Sem1.value = mapSemesterData(curriculumTemplate.yr1Sem1, fetchedGrades);
        yr1Sem2.value = mapSemesterData(curriculumTemplate.yr1Sem2, fetchedGrades);
        yr2Sem1.value = mapSemesterData(curriculumTemplate.yr2Sem1, fetchedGrades);
        yr2Sem2.value = mapSemesterData(curriculumTemplate.yr2Sem2, fetchedGrades);
        yr3Sem1.value = mapSemesterData(curriculumTemplate.yr3Sem1, fetchedGrades);
        yr3Sem2.value = mapSemesterData(curriculumTemplate.yr3Sem2, fetchedGrades);
        yr4Sem1.value = mapSemesterData(curriculumTemplate.yr4Sem1, fetchedGrades);
        yr4Sem2.value = mapSemesterData(curriculumTemplate.yr4Sem2, fetchedGrades);

        const otherCoursesDataFromDB = fetchedGrades
            .filter((grade: { courseCode: string }) => !templateCourseCodes.has(grade.courseCode)) // 2. เอาเฉพาะที่ *ไม่มี* ใน template codes
            .map((grade: { courseNameTH: string; courseCode: any; credit: any; grade: any }): CourseDisplayData => {
                // 3. แปลงเป็น CourseDisplayData
                // *** ข้อควรระวัง: การจัดการ courseNameTH และ credit สำหรับ Other Courses ***
                // ถ้า API ไม่ได้คืน courseNameTH และ credit มาด้วย ต้องหาวิธีจัดการ
                // วิธีที่ดีที่สุด: ปรับ API ให้คืนข้อมูลเหล่านี้มาด้วย
                // วิธีแก้ปัญหาเฉพาะหน้า (ถ้า API แก้ไม่ได้):
                const courseName = grade.courseNameTH || `(รหัส: ${grade.courseCode})`; // ใช้ชื่อจาก DB ถ้ามี, หรือแสดงรหัสแทน
                // const creditValue = grade.credit ?? 0; // ใช้หน่วยกิตจาก grade service ถ้ามี, หรือ 0 (ผู้ใช้อาจต้องแก้เอง แต่ช่อง disable ไปแล้ว?) -> ควรให้ API ส่งมา

                return {
                    courseCode: grade.courseCode,
                    courseNameTH: courseName,
                    // credit: creditValue, // ใช้หน่วยกิตที่ถูกต้องจาก API
                    credit: grade.credit, // สมมติว่า grade object มี credit อยู่แล้ว
                    grade: grade.grade || null,
                    isModified: false, // เพิ่งโหลดมา ยังไม่แก้ไข
                    wasInitiallyNull: false // มีข้อมูลใน DB แล้ว = false
                };
            });

        otherCourses.value = otherCoursesDataFromDB; // กำหนดค่าให้กับ Ref
    } catch (error: any) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.response?.data || error.message || error);
        errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (error.response?.data?.message || error.message || 'ไม่ทราบสาเหตุ');
    } finally {
        isLoading.value = false; // สิ้นสุด loading
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

        <div class="card">
            <Fieldset legend="วิชาอื่นๆ" :toggleable="true">
                <DataTable :value="otherCourses" tableStyle="min-width: 50rem" dataKey="courseCode" :rowClass="getRowClass">
                    <Column field="courseCode" header="รหัสวิชา" style="width: 15%">
                        <template #body="slotProps">
                            <InputText v-model="slotProps.data.courseCode" placeholder="รหัสวิชา" @input="courseDataChanged(slotProps.data)" :disabled="!slotProps.data.wasInitiallyNull" />
                        </template>
                    </Column>
                    <Column field="courseNameTH" header="ชื่อวิชา" style="width: 25%">
                        <template #body="slotProps">
                            <InputText v-model="slotProps.data.courseNameTH" placeholder="ชื่อวิชา" @input="courseDataChanged(slotProps.data)" style="width: 100%" :disabled="!slotProps.data.wasInitiallyNull" />
                        </template>
                    </Column>
                    <Column field="grade" header="เกรดวิชา" style="width: 20%">
                        <template #body="slotProps">
                            <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 80px" appendTo="body" @change="courseGradeChanged(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="credit" header="จำนวนหน่วยกิต" style="width: 15%">
                        <template #body="slotProps">
                            <InputNumber v-model="slotProps.data.credit" placeholder="หน่วยกิต" @input="courseDataChanged(slotProps.data)" :min="0" :max="10" :disabled="!slotProps.data.wasInitiallyNull" />
                        </template>
                    </Column>
                    <Column field="gradePoint" header="แต้มคะแนน" style="width: 15%">
                        <template #body="slotProps">
                            {{ calculateGradePoint(slotProps.data.grade, slotProps.data.credit) }}
                        </template>
                    </Column>
                    <Column style="width: 10%">
                        <template #body="slotProps">
                            <div class="flex items-center space-x-2">
                                <Button icon="pi pi-save" outlined severity="success" @click="saveGrade(slotProps.data)" :disabled="!slotProps.data.isModified" />
                                <Button v-if="slotProps.data.wasInitiallyNull" icon="pi pi-trash" outlined severity="danger" @click="removeOtherCourse(slotProps.data)" class="ml-2" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <div class="semester-summary">
                    <div>จำนวนหน่วยกิตวิชาอื่นๆ: {{ calculateSemesterCredits(otherCourses) }}</div>
                    <div>เกรดเฉลี่ยวิชาอื่นๆ: {{ calculateSemesterGPA(otherCourses).toFixed(2) }}</div>
                </div>
                <Button label="เพิ่มวิชาใหม่" icon="pi pi-plus" @click="addNewOtherCourse" class="mt-3" />
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
