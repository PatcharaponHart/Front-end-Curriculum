<script setup lang="ts">
import { getCurrentUser } from '@/service/authService'; // ตรวจสอบ path ให้ถูกต้อง
import gradeService, { Grades } from '@/service/gradeService'; // ตรวจสอบ path และ export ให้ถูกต้อง
import Button from 'primevue/button'; // จำเป็นถ้าใช้ Button ใน template ที่ไม่ได้แสดง
// import Dropdown from 'primevue/dropdown'; // ถ้าใช้ Dropdown ใน template
import Select from 'primevue/select'; // ถ้าใช้ Select ใน template
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
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

const confirm = useConfirm();
const toast = useToast(); // เพิ่มบรรทัดนี้

// --- ตัวเลือกเกรด ---
const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D']);

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
    // รวมหน่วยกิตจากวิชาอื่นๆ
    if (otherCourses.value && Array.isArray(otherCourses.value)) {
        // ตรวจสอบเผื่อ otherCourses ยังไม่มีค่าหรือไม่ได้เป็น array
        otherCourses.value.forEach((course) => {
            // นับหน่วยกิตเฉพาะเกรดที่มีค่า (A-F)
            if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
                total += course.credit;
            }
        });
    }
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
    // รวมวิชาอื่นๆ
    if (otherCourses.value && Array.isArray(otherCourses.value)) {
        // ตรวจสอบเผื่อ otherCourses ยังไม่มีค่าหรือไม่ได้เป็น array
        otherCourses.value.forEach((course) => {
            // คำนวณ GPAX เฉพาะเกรดที่มีค่า (A-F)
            if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
                totalPoints += gradeValues[course.grade] * course.credit;
                totalCreditsForGPA += course.credit;
            }
        });
    }

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
        วิชาภาษาไทย: '12230000',
        'วิชาภาษาต่างประเทศ 1 ภาษา (1)': '12240001',
        'วิชาภาษาต่างประเทศ 1 ภาษา (2)': '12240002',
        'วิชาภาษาต่างประเทศ 1 ภาษา (3)': '12240003',
        กิจกรรมพลศึกษา: '01175xxx',
        วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ: '01310000',
        วิชาศึกษาทั่วไปกลุ่มสาระสุนทรียศาสตร์: '01320000',
        วิชาศึกษาทั่วไปกลุ่มสาระอยู่ดีมีสุข: '01330000',
        'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (1)': '01340001',
        'วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ (2)': '01340002',
        วิชาศึกษาทั่วไปกลุ่มสาระพลเมืองไทยและพลเมืองโลก: '01350000',
        'วิชาสารสนเทศ/คอมพิวเตอร์': '01418000',
        'วิชาเฉพาะเลือก (1)': '14450001',
        'วิชาเฉพาะเลือก (2)': '14450002',
        'วิชาเฉพาะเลือก (3)': '14450003',
        'วิชาเฉพาะเลือก (4)': '14450004',
        'วิชาเฉพาะเลือก (5)': '14450005',
        'วิชาเฉพาะเลือก (6)': '14450006',
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
        credit: 1,
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
    console.log('--- saveGrade ENTERED ---', new Date().toISOString(), course.courseCode); // เพิ่ม Log เช็ค
    // ป้องกันการกดซ้ำซ้อนขณะกำลังบันทึก
    if (isSaving.value) {
        console.log('saveGrade: Already saving, returning.');
        return;
    }

    // --- กำหนด Course Code (ทำก่อนเพื่อใช้ใน message) ---
    let effectiveCourseCode = course.courseCode;
    if (!effectiveCourseCode && course.courseNameTH) {
        effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
    }

    if (!effectiveCourseCode) {
        // ไม่ควรเกิดถ้า UI validation ดีพอ แต่กันไว้
        errorMessage.value = `ไม่สามารถบันทึกได้: ไม่พบรหัสวิชาสำหรับ "${course.courseNameTH}"`;
        console.error('saveGrade: Cannot proceed without effectiveCourseCode for', course.courseNameTH);
        return;
    }
    // --- สิ้นสุดกำหนด Course Code ---

    // *** สร้างข้อความยืนยันแบบไดนามิก ***
    const gradeToDisplay = course.grade || 'ค่าว่าง (ลบเกรด)'; // แสดงผลถ้าเกรดเป็น null/empty
    const confirmationMessage = `คุณต้องการบันทึกเกรด '${gradeToDisplay}' สำหรับวิชา ${effectiveCourseCode} - ${course.courseNameTH} หรือไม่?`;

    confirm.require({
        message: confirmationMessage, // <--- ใช้ข้อความที่สร้างขึ้น
        header: 'ยืนยันการบันทึกรายการเดียว',
        icon: 'pi pi-question-circle', // เปลี่ยนไอคอนตามความเหมาะสม
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-success',
        acceptLabel: 'บันทึก', // แก้ Label ให้ชัดเจน
        rejectLabel: 'ยกเลิก',
        accept: async () => {
            console.log('saveGrade: Accepted confirmation for', effectiveCourseCode);
            try {
                const currentUser = getCurrentUser();
                if (!currentUser?.studentID) {
                    errorMessage.value = 'ไม่พบรหัสนักศึกษา';
                    return;
                }
                isSaving.value = true;
                errorMessage.value = null;

                // effectiveCourseCode คำนวณไว้แล้วด้านบน
                const payload: Grades = {
                    studentId: currentUser.studentID,
                    courseCode: effectiveCourseCode!, // ใช้ ! เพราะเช็คแล้วว่าไม่ null
                    grade: course.grade || '',
                    credit: course.credit
                };

                let apiCalled = false;
                // ... (ตรรกะการเรียก pushGrade/editGrade เหมือนเดิม) ...
                if (course.wasInitiallyNull && course.grade) {
                    console.log('Calling PushGrade...', payload);
                    await gradeService.pushGrade(payload);
                    course.wasInitiallyNull = false;
                    apiCalled = true;
                } else if (!course.wasInitiallyNull && course.isModified) {
                    console.log('Calling EditGrade...', payload);
                    await gradeService.editGrade(payload);
                    apiCalled = true;
                } else if (course.wasInitiallyNull && !course.grade && course.isModified) {
                    // เพิ่ม isModified เช็คด้วย
                    console.log('Skipping save (was initially null, still null/empty)');
                    // ถ้าตอนแรก Null, แก้แล้วแต่ยัง Null -> ไม่ต้องเรียก API แต่เคลียร์ Flag ได้
                    course.isModified = false; // เคลียร์ flag เพราะ user action เสร็จแล้ว แต่ไม่มีไรส่ง
                } else {
                    console.log('Skipping save (not modified or other case)');
                    // ถ้าไม่เข้าเงื่อนไขอื่น และไม่ modified ก็ไม่ต้องทำไร
                    // ถ้า modified แต่เข้าเงื่อนไขอื่นไม่ได้ แปลว่า logic ผิดพลาด ควร log ไว้
                    if (course.isModified) {
                        console.warn("Course marked as modified but didn't match save conditions:", course);
                    }
                }

                if (apiCalled) {
                    course.isModified = false; // เคลียร์หลัง API สำเร็จเท่านั้น
                    console.log('Save operation completed for', effectiveCourseCode);
                    // Toast แจ้งสำเร็จรายการเดียว
                    toast.add({
                        severity: 'success',
                        summary: 'บันทึกสำเร็จ',
                        detail: `บันทึกเกรดสำหรับวิชา ${course.courseNameTH || effectiveCourseCode} เรียบร้อยแล้ว`,
                        life: 3000 // แสดงผล 3 วินาที
                    });
                }
            } catch (error: any) {
                console.error('Error saving grade:', error.response?.data || error.message || error);
                const backendError = error.response?.data?.title || error.response?.data?.message || error.message;
                const errorDetail = `เกิดข้อผิดพลาดในการบันทึกเกรดวิชา ${course.courseNameTH || effectiveCourseCode}: ` + (backendError || 'ไม่ทราบสาเหตุ');
                errorMessage.value = errorDetail;
                // Toast Error
                toast.add({
                    severity: 'error',
                    summary: 'เกิดข้อผิดพลาด',
                    detail: errorDetail,
                    life: 5000 // แสดงผลนานขึ้นสำหรับข้อผิดพลาด
                });
            } finally {
                isSaving.value = false;
            }
        },
        reject: () => {
            console.log('saveGrade: Rejected confirmation for', effectiveCourseCode);
            // (Optional) ทำอะไรบางอย่างถ้าผู้ใช้กดยกเลิก
            // ไม่ต้อง set isSaving เพราะยังไม่ได้เริ่ม
        }
    });
    console.log('saveGrade: confirm.require() called for', effectiveCourseCode); // เช็คว่าเรียก confirm
};

// บันทึกเกรดทั้งหมดที่มีการแก้ไข
const saveAllGrades = async () => {
    console.log('--- saveAllGrades ENTERED ---', new Date().toISOString());
    // ป้องกันการกดซ้ำซ้อน
    if (isSaving.value) {
        console.log('saveAllGrades: Already saving, returning.');
        return;
    }

    // --- *** 1. ค้นหารายการที่จะบันทึกและเตรียมข้อมูล **ก่อน** เรียก confirm *** ---
    const gradesToPush: Grades[] = [];
    const gradesToEdit: Grades[] = [];
    const coursesToResetFlag: CourseDisplayData[] = [];
    const skippedCourses: { name: string; reason: string }[] = [];
    const coursesToConfirm: { name: string; grade: string | null; code: string | null }[] = []; // เก็บข้อมูลสำหรับแสดงใน popup

    const currentUser = getCurrentUser(); // ดึง user มาก่อน
    if (!currentUser?.studentID) {
        errorMessage.value = 'ไม่พบรหัสนักศึกษา';
        return; // ออกก่อนถ้าไม่มี user ID
    }

    // รวมทุก Courses จากทุก Semester และ Other Courses
    const allCoursesToCheck = [
        ...allSemesters.value.flatMap((s) => s.courses),
        ...(otherCourses.value || []) // เผื่อ otherCourses เป็น null/undefined
    ];

    allCoursesToCheck.forEach((course) => {
        if (course.isModified) {
            let effectiveCourseCode = course.courseCode;
            if (!effectiveCourseCode && course.courseNameTH) {
                effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
            }

            if (!effectiveCourseCode) {
                console.warn(`Skipping save for course "${course.courseNameTH}" in saveAll due to missing/unmappable code.`);
                skippedCourses.push({ name: course.courseNameTH, reason: 'ไม่พบรหัสวิชา' });
                // ไม่ต้องเคลียร์ isModified ที่นี่ ปล่อยให้ user แก้ไข
                return; // ข้าม course นี้
            }

            // เพิ่มรายการนี้สำหรับแสดงใน popup
            coursesToConfirm.push({
                name: course.courseNameTH,
                grade: course.grade,
                code: effectiveCourseCode // ใช้ effective code
            });

            // เตรียม Payload สำหรับ API call
            const payload: Grades = {
                studentId: currentUser.studentID,
                courseCode: effectiveCourseCode,
                grade: course.grade || '',
                credit: course.credit
            };

            if (course.wasInitiallyNull && course.grade) {
                gradesToPush.push(payload);
                coursesToResetFlag.push(course);
            } else if (!course.wasInitiallyNull) {
                gradesToEdit.push(payload);
                coursesToResetFlag.push(course);
            } else if (course.wasInitiallyNull && !course.grade) {
                // ไม่ต้องทำอะไรกับ API แต่ต้องเคลียร์ flag เพราะถือว่า user action เสร็จสิ้น
                console.log(`Clearing modified flag for ${effectiveCourseCode} - was null, still null.`);
                // เราจะเคลียร์ flag หลังกด accept ถ้าสำเร็จ หรือไม่ก็เคลียร์เลยก็ได้
                // course.isModified = false; // พิจารณาว่าจะเคลียร์ตอนไหน
                // แต่ถ้าเคลียร์ตอนนี้ มันจะไม่ถูกนับใน coursesToConfirm -> ไม่ควรเคลียร์ตอนนี้
            }
        }
    });

    // --- *** 2. ตรวจสอบว่ามีอะไรให้บันทึกหรือไม่ *** ---
    if (coursesToConfirm.length === 0) {
        console.log('saveAllGrades: No modified courses to save.');
        let toastSeverity: 'info' | 'warn' = 'info';
        let toastDetail = 'ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก';

        if (skippedCourses.length > 0) {
            toastSeverity = 'warn';
            toastDetail = `ไม่มีรายการที่แก้ไข แต่มี ${skippedCourses.length} รายการที่ไม่สามารถบันทึกได้เนื่องจาก: ${skippedCourses.map((s) => s.reason).join(', ')}`;
            errorMessage.value = toastDetail; // อาจยังต้องการแสดง error message หลัก
        } else {
            errorMessage.value = toastDetail; // หรือแสดงเป็น info message
        }
        // --- Toast แจ้งเตือน/ข้อมูล ---
        toast.add({ severity: toastSeverity, summary: 'ข้อมูล', detail: toastDetail, life: 4000 });
        return;
    }

    // --- *** 3. สร้างข้อความสำหรับ Popup *** ---
    let confirmationMessage = `คุณต้องการบันทึกการเปลี่ยนแปลง ${coursesToConfirm.length} รายการ ดังนี้หรือไม่?\n\n`; // เพิ่ม \n สองครั้งเพื่อเว้นบรรทัดก่อนเริ่ม list

    const formattedItemList = coursesToConfirm
        .map((item) => {
            const gradeDisplay = item.grade || 'ค่าว่าง'; // จัดการกรณีเกรดเป็น null/empty
            // ใส่ '-' หรือ bullet point อื่นๆ นำหน้าแต่ละรายการเพื่อให้ดูเป็น list
            return `- ${item.code} ${item.name} (เกรด: ${gradeDisplay})`;
        })
        .join('\n'); // นำแต่ละรายการมาต่อกันด้วยการขึ้นบรรทัดใหม่

    confirmationMessage += formattedItemList; // นำ list ที่ได้มาต่อท้าย header message

    // --- *** 4. เรียก confirm.require พร้อม Message ที่เตรียมไว้ *** ---
    console.log('Confirmation Message:\n', confirmationMessage);

    // --- *** 4. เรียก confirm.require พร้อม Message ที่เตรียมไว้ *** ---
    confirm.require({
        message: confirmationMessage, // <--- ใช้ข้อความที่สร้าง
        header: 'ยืนยันการบันทึกทั้งหมด',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-success',
        acceptLabel: 'บันทึก', // แก้ Label
        rejectLabel: 'ยกเลิก',
        accept: async () => {
            // --- *** 5. ส่วนนี้จะทำงานเมื่อกดยืนยัน ใช้ข้อมูลที่เตรียมไว้แล้ว *** ---
            console.log('saveAllGrades: Accepted confirmation.');
            try {
                // isSaving, currentUser, errorMessage ถูกจัดการ/ตรวจสอบแล้วก่อน confirm
                isSaving.value = true;
                errorMessage.value = null;

                // ตรวจสอบอีกครั้งเผื่อกรณีข้อมูลเปลี่ยนระหว่างรอ confirm (ไม่น่าเกิด แต่กันไว้)
                if (gradesToPush.length === 0 && gradesToEdit.length === 0) {
                    console.log('saveAllGrades accept: No grades need saving via API (checked again).');
                    errorMessage.value = 'ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก (ตรวจสอบอีกครั้ง)';
                    isSaving.value = false;
                    return;
                }

                let pushSuccess = true;
                let editSuccess = true;
                let pushErrorMsg: string | null = null;
                let editErrorMsg: string | null = null;
                const coursesWithErrors: string[] = []; // เก็บ code ที่ error

                // --- เรียก API Push (ใช้ gradesToPush ที่เตรียมไว้) ---
                if (gradesToPush.length > 0) {
                    console.log('Calling PushGrades with:', gradesToPush);
                    try {
                        await gradeService.pushGrades(gradesToPush); // หรือวน loop
                        console.log('PushGrades successful');
                        // อัปเดต wasInitiallyNull หลัง Push สำเร็จ
                        coursesToResetFlag.forEach((course) => {
                            let effCode = course.courseCode || getPlaceholderCourseCode(course.courseNameTH);
                            if (course.wasInitiallyNull && gradesToPush.some((p) => p.courseCode === effCode)) {
                                course.wasInitiallyNull = false;
                            }
                        });
                    } catch (pushError: any) {
                        pushSuccess = false;
                        console.error('Error pushing grades:', pushError);
                        pushErrorMsg = 'เกิดข้อผิดพลาดในการเพิ่มเกรดใหม่: ' + (pushError.response?.data?.title || pushError.message || 'ไม่ทราบสาเหตุ');
                        gradesToPush.forEach((g) => coursesWithErrors.push(g.courseCode));
                    }
                }

                // --- เรียก API Edit (ใช้ gradesToEdit ที่เตรียมไว้) ---
                if (gradesToEdit.length > 0) {
                    console.log('Calling EditGrade (looping) for:', gradesToEdit);
                    let individualEditErrors = 0;
                    for (const gradePayload of gradesToEdit) {
                        try {
                            await gradeService.editGrade(gradePayload);
                        } catch (singleEditError: any) {
                            individualEditErrors++;
                            console.error(`Error editing grade ${gradePayload.courseCode}:`, singleEditError);
                            coursesWithErrors.push(gradePayload.courseCode);
                            if (!editErrorMsg) {
                                editErrorMsg = `เกิดข้อผิดพลาดในการอัปเดตเกรด (เช่น วิชา ${gradePayload.courseCode}): ` + (singleEditError.response?.data?.title || singleEditError.message || 'ไม่ทราบสาเหตุ');
                            }
                        }
                    }
                    if (individualEditErrors > 0) {
                        editSuccess = false;
                        console.log(`Edit Grades completed with ${individualEditErrors} errors.`);
                    } else {
                        console.log('Edit Grades successful');
                    }
                }

                // --- สรุปผลและเคลียร์ Flag (เฉพาะรายการที่สำเร็จ) ---
                const allApisAttemptedAndSucceeded = pushSuccess && editSuccess;

                coursesToResetFlag.forEach((course) => {
                    let effCode = course.courseCode || getPlaceholderCourseCode(course.courseNameTH);
                    // เคลียร์เฉพาะตัวที่ *ไม่* อยู่ใน list error
                    if (effCode && !coursesWithErrors.includes(effCode)) {
                        course.isModified = false;
                    } else if (!effCode) {
                        // กรณี course code เป็น null ตอนแรก -> หา placeholder code
                        const placeholder = getPlaceholderCourseCode(course.courseNameTH);
                        if (placeholder && !coursesWithErrors.includes(placeholder)) {
                            course.isModified = false;
                        }
                    }
                });
                console.log(`Cleared modified flags for successful items. ${coursesWithErrors.length} items still marked as modified.`);

                if (allApisAttemptedAndSucceeded && skippedCourses.length === 0) {
                    console.log('บันทึกข้อมูลทั้งหมดสำเร็จ');
                    errorMessage.value = null; // เคลียร์ error เก่า ถ้ามี
                    // Toast Success
                    toast.add({
                        severity: 'success',
                        summary: 'บันทึกทั้งหมดสำเร็จ',
                        detail: `บันทึกข้อมูลเกรด ${coursesToConfirm.length} รายการเรียบร้อยแล้ว`,
                        life: 3000
                    });
                } else {
                    let finalMessage = '';
                    let finalSeverity: 'warn' | 'error' = 'warn'; // เริ่มต้นเป็น warn

                    if (!pushSuccess || !editSuccess) {
                        finalMessage += (pushErrorMsg || '') + (editErrorMsg ? (pushErrorMsg ? '; ' : '') + editErrorMsg : '');
                        finalSeverity = 'error'; // ถ้า API fail ให้เป็น error
                    }
                    if (skippedCourses.length > 0) {
                        finalMessage += (finalMessage ? '; ' : '') + `มี ${skippedCourses.length} รายการที่ข้ามไป (${skippedCourses.map((s) => s.name).join(', ')})`;
                        // ถ้ามี error อยู่แล้ว ให้คงเป็น error, ถ้าไม่มี error แต่มี skip ให้เป็น warn
                        finalSeverity = finalSeverity === 'error' ? 'error' : 'warn';
                    }
                    errorMessage.value = finalMessage.trim() || 'เกิดข้อผิดพลาดบางอย่างในการบันทึก';
                    console.error('Save All completed with errors or skips:', errorMessage.value);
                    // --- Toast แจ้งเตือน/ข้อผิดพลาด ---
                    toast.add({
                        severity: finalSeverity,
                        summary: finalSeverity === 'error' ? 'เกิดข้อผิดพลาด' : 'บันทึกบางส่วน',
                        detail: errorMessage.value,
                        life: 5000
                    });
                }
            } catch (error: any) {
                console.error('Unexpected error in saveAllGrades accept callback:', error);
                const errorDetail = 'เกิดข้อผิดพลาดไม่คาดคิดในการบันทึก: ' + error.message;
                errorMessage.value = errorDetail;
                // Toast Error
                toast.add({ severity: 'error', summary: 'ข้อผิดพลาดรุนแรง', detail: errorDetail, life: 5000 });
            } finally {
                isSaving.value = false;
            }
            // --- สิ้นสุดการทำงานใน accept ---
        },
        reject: () => {
            console.log('saveAllGrades: Rejected confirmation.');
            // User cancelled - ไม่ต้องทำอะไร
        }
    });
    console.log('saveAllGrades: confirm.require() called.');
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
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (4)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (5)', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเลือกเสรี (1)', credit: 3 }
            ],
            yr4Sem1: [{ courseCode: '01418490', courseNameTH: 'สหกิจศึกษา', credit: 6 }],
            yr4Sem2: [
                { courseCode: '01418499', courseNameTH: 'โครงงานวิทยาการคอมพิวเตอร์', credit: 3 },
                { courseCode: null, courseNameTH: 'วิชาเฉพาะเลือก (6)', credit: 3 },
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
    <Toast />
    <h2 class="text-primary">บันทึกผลการเรียน</h2>

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
                    <span class="label">หน่วยกิตรวม (หน่วยกิตที่ได้/หน่วยกิตที่ต้องการ):</span>
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
                            <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 116px" appendTo="body" @change="courseGradeChanged(slotProps.data)" />
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
                            <Select v-model="slotProps.data.grade" :options="gradeOptions" placeholder="เลือกเกรด" style="width: 116px" appendTo="body" @change="courseGradeChanged(slotProps.data)" />
                        </template>
                    </Column>
                    <Column field="credit" header="จำนวนหน่วยกิต" style="width: 15%">
                        <template #body="slotProps">
                            <InputNumber
                                v-model="slotProps.data.credit"
                                placeholder="หน่วยกิต"
                                @input="courseDataChanged(slotProps.data)"
                                :min="0"
                                :max="9"
                                :disabled="!slotProps.data.wasInitiallyNull"
                                :maxlength="1"
                                @keydown="limitInputLength($event, 1)"
                            />
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
