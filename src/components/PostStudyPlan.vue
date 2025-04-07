<script setup lang="ts">
import { getCurrentUser } from '@/service/authService'; // ตรวจสอบ path ให้ถูกต้อง
import gradeService, { Grades } from '@/service/gradeService'; // ตรวจสอบ path และ export ให้ถูกต้อง
import Button from 'primevue/button'; // จำเป็นถ้าใช้ Button ใน template ที่ไม่ได้แสดง
// import Dropdown from 'primevue/dropdown'; // ถ้าใช้ Dropdown ใน template
import Dialog from 'primevue/dialog';
import Select from 'primevue/select'; // ถ้าใช้ Select ใน template
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import courseService, { Course } from '../service/courseService';

const isSingleSaveMode = ref(false); // บอกว่า Dialog เปิดสำหรับ Save เดี่ยวหรือไม่
const courseToSaveSingle = ref<CourseDisplayData | null>(null); // เก็บข้อมูล Course ที่จะ Save เดี่ยว
const showSaveAllConfirmDialog = ref(false); // State ควบคุมการแสดง Dialog
const coursesForCustomConfirm = ref<Array<{ name: string; grade: string | null; code: string | null }>>([]);

const isAddDialogVisible = ref(false);

const initialNewCourseState: Course = {
    courseCode: 'F030',
    courseNameTH: '',
    courseNameEN: '',
    credit: 1,
    subjectGroup: ''
};
const newCourse = reactive<Course>({ ...initialNewCourseState });

// Computed property สำหรับเช็คความถูกต้องของฟอร์มเพิ่มรายวิชา (ถ้ามีใช้ใน Dialog)
const isFormValid = computed(() => {
    return newCourse.courseCode && newCourse.courseNameTH && newCourse.courseNameEN && newCourse.credit !== null && newCourse.credit >= 0 && newCourse.subjectGroup;
});

// ฟังก์ชันเปิด Dialog เพิ่มรายวิชา
const openAddDialog = () => {
    Object.assign(newCourse, initialNewCourseState);
    isAddDialogVisible.value = true;
};

// ฟังก์ชันปิด Dialog เพิ่มรายวิชา
const closeAddDialog = () => {
    // if (!isSaving.value) { // อาจจะเอา if ออกเพื่อให้ปิดได้เสมอ
    isAddDialogVisible.value = false;
    // }
};

// (ถ้าจำเป็น) ฟังก์ชันดึงข้อมูลวิชา - อาจจะต้องปรับแก้ตาม context ของหน้านี้
const courses = ref<Course[]>([]); // หรือ state ที่เกี่ยวข้อง
async function fetchCourses() {
    // isLoading.value = true; // อาจจะใช้ loading state อื่น
    try {
        console.log('Fetching courses...');
        const coursesList = await courseService.getCoursesList();
        if (coursesList) {
            courses.value = coursesList; // อัปเดต state ที่ใช้แสดงผลในหน้านี้ (ถ้ามี)
            console.log('Courses fetched on this page:', coursesList.length);
        } else {
            courses.value = [];
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา:', error);
        toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'ไม่สามารถดึงข้อมูลวิชาได้', life: 3000 });
    } finally {
        // isLoading.value = false;
    }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ฟังก์ชันบันทึกรายวิชาใหม่ (ยกมาจากหน้าแรก)
const saveNewCourse = async () => {
    if (!isFormValid.value || isSaving.value) {
        // ใช้ isFormValid ที่ประกาศไว้ข้างบน
        return;
    }

    // Client-side duplicate check (อาจจะต้องเช็คกับ 'courses' ที่ fetch มาในหน้านี้)
    const enteredCode = newCourse.courseCode;
    const isDuplicate = courses.value.some((course) => course.courseCode === enteredCode);
    if (isDuplicate) {
        toast.add({ severity: 'warn', summary: 'ข้อมูลซ้ำ', detail: `รหัสวิชา ${enteredCode} นี้มีอยู่ในรายการแล้ว กรุณาตรวจสอบ`, life: 4000 });
        return;
    }

    isSaving.value = true; // *** ตั้งค่า isSaving เป็น true ***
    const courseToAdd: Course = { ...newCourse }; // สร้าง object ใหม่

    try {
        const success = await courseService.pushCourse(courseToAdd);

        if (success) {
            toast.add({ severity: 'success', summary: 'สำเร็จ', detail: 'บันทึกข้อมูลวิชาเรียบร้อยแล้ว', life: 3000 });

            // *** พิจารณาว่าจะ fetchCourses ในหน้านี้หรือไม่ ***
            await fetchCourses(); // เรียกเพื่ออัปเดต list ถ้าหน้านี้ต้องใช้ข้อมูลล่าสุด

            const closeDelay = 500;
            await delay(closeDelay);
            closeAddDialog(); // ปิด Dialog
        } else {
            console.error('การบันทึกข้อมูลไม่สำเร็จ (Backend รายงาน)');
            toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: `ไม่สามารถบันทึก ${courseToAdd.courseCode} ได้ (อาจมีรหัสนี้อยู่แล้ว)`, life: 4000 });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        toast.add({ severity: 'error', summary: 'ผิดพลาด', detail: 'เกิดข้อผิดพลาดในการเชื่อมต่อ หรือบันทึกข้อมูล', life: 3000 });
    } finally {
        isSaving.value = false; // *** คืนค่า isSaving เป็น false ***
    }
};
// --- Interface สำหรับข้อมูล Course ---
interface CourseDisplayData {
    courseCode: string | null; // อาจเป็น null ได้ในตอนแรก
    courseNameTH: string;
    credit: number;
    grade: string | null;
    isModified: boolean;
    wasInitiallyNull?: boolean; // สถานะว่าตอนโหลดมามีเกรดหรือไม่
    originalGrade: string | null;
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
const gradeOptions = ref(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']);

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

const checkIncompleteNewCourse = (course: CourseDisplayData): boolean => {
    // ฟังก์ชันนี้จะ return true ถ้า course เป็นรายการใหม่ที่เพิ่มเข้ามา และยังกรอกข้อมูลไม่ครบ
    if (!course.wasInitiallyNull) {
        // ถ้าไม่ใช่รายการใหม่ (โหลดมาจาก DB หรือเคยบันทึกแล้ว) ไม่ต้องใช้เงื่อนไขนี้
        return false;
    }
    // เป็นรายการใหม่ ตรวจสอบว่าฟิลด์ไหนยังขาดไปหรือไม่ถูกต้อง
    return (
        !course.courseCode?.trim() || // รหัสวิชาต้องไม่ว่างเปล่า (หลังตัดช่องว่าง)
        !course.courseNameTH?.trim() || // ชื่อวิชาต้องไม่ว่างเปล่า (หลังตัดช่องว่าง)
        !course.grade || // เกรดต้องถูกเลือก (ไม่ใช่ null หรือ '' )
        course.credit === null || // หน่วยกิตต้องมีค่า (InputNumber อาจเป็น null ถ้าเคลียร์)
        course.credit === undefined ||
        course.credit < 0
    ); // หน่วยกิตต้องไม่ติดลบ (เผื่อกรณีแปลกๆ)
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

const calculateSemesterTotalPoints = (courses: CourseDisplayData[]): number => {
    let totalPoints = 0;
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
        // คำนวณแต้มรวมเฉพาะเกรดที่มีค่า (A-F)
        if (course.grade && gradeValues.hasOwnProperty(course.grade)) {
            // แต้มคะแนน = ค่าเกรด * หน่วยกิต
            totalPoints += gradeValues[course.grade] * course.credit;
        }
    });
    // คืนค่าแต้มคะแนนรวม
    return totalPoints;
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
        wasInitiallyNull: true,
        originalGrade: null
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
// --- โค้ดเต็มฟังก์ชัน saveGrade (เวอร์ชันเรียก Custom Dialog) ---
const saveGrade = async (course: CourseDisplayData) => {
    // --- Log เริ่มต้น ---
    console.log(`>>> saveGrade START for single item: ${course.courseCode || course.courseNameTH} at ${new Date().toISOString()}`);

    // ป้องกันการกดซ้ำซ้อนขณะกำลังบันทึก (ยังคงมีไว้ดี)
    if (isSaving.value) {
        console.log('saveGrade: Already saving, returning.');
        return;
    }

    // --- กำหนด Course Code เพื่อแสดงผล ---
    let effectiveCourseCode = course.courseCode;
    if (!effectiveCourseCode && course.courseNameTH) {
        effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
    }

    if (!effectiveCourseCode) {
        errorMessage.value = `ไม่สามารถบันทึกได้: ไม่พบรหัสวิชาสำหรับ "${course.courseNameTH}"`;
        console.error('saveGrade: Cannot proceed without effectiveCourseCode for', course.courseNameTH);
        toast.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: errorMessage.value, life: 4000 });
        return;
    }

    // --- *** เตรียมข้อมูลและ State สำหรับเปิด Custom Dialog *** ---
    console.log(`saveGrade: Preparing custom dialog for single save: ${effectiveCourseCode}`);

    isSingleSaveMode.value = true; // 1. ตั้งโหมดเป็น Save เดี่ยว
    courseToSaveSingle.value = course; // 2. เก็บ Course ปัจจุบันที่จะ Save
    errorMessage.value = null; // 3. เคลียร์ Error Message เก่า (ถ้ามี)

    // 4. สร้างข้อมูลสำหรับแสดงใน list ของ Dialog (มีแค่รายการเดียว)
    coursesForCustomConfirm.value = [
        {
            code: effectiveCourseCode,
            name: course.courseNameTH,
            // ส่ง grade ไปด้วย เพื่อแสดงในข้อความยืนยันของ Dialog ได้เลย
            grade: course.grade
        }
    ];

    // 5. เปิด Dialog
    showSaveAllConfirmDialog.value = true;

    // *** ฟังก์ชันนี้จะจบการทำงานตรงนี้ ไม่มีการเรียก API หรือ Confirm แบบเดิม ***
}; // --- สิ้นสุดฟังก์ชัน saveGrade (เวอร์ชันเรียก Custom Dialog) ---
// บันทึกเกรดทั้งหมดที่มีการแก้ไข
const saveAllGrades = async () => {
    console.log('--- saveAllGrades ENTERED (Custom Dialog Version) ---', new Date().toISOString());
    // ป้องกันการกดซ้ำซ้อน
    if (isSaving.value) {
        console.log('saveAllGrades: Already saving, returning.');
        return;
    }

    // --- *** 1. ค้นหารายการที่จะแสดงใน Popup *** ---
    // (ส่วนนี้เหมือนเดิม แต่เราใช้ coursesToConfirm แค่เพื่อแสดงผล)
    const localCoursesToConfirm: { name: string; grade: string | null; code: string | null }[] = []; // ใช้ชื่อ local ชั่วคราว
    const localSkippedCourses: { name: string; reason: string }[] = []; // ใช้ชื่อ local ชั่วคราว

    const currentUser = getCurrentUser(); // ดึง user มาก่อน
    if (!currentUser?.studentID) {
        errorMessage.value = 'ไม่พบรหัสนักศึกษา';
        toast.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: errorMessage.value, life: 3000 });
        return; // ออกก่อนถ้าไม่มี user ID
    }

    // รวมทุก Courses จากทุก Semester และ Other Courses
    const allCoursesToCheck = [...allSemesters.value.flatMap((s) => s.courses), ...(otherCourses.value || [])];

    allCoursesToCheck.forEach((course) => {
        if (course.isModified) {
            let effectiveCourseCode = course.courseCode;
            if (!effectiveCourseCode && course.courseNameTH) {
                effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
            }

            if (!effectiveCourseCode) {
                console.warn(`Skipping save for course "${course.courseNameTH}" in saveAll due to missing/unmappable code.`);
                localSkippedCourses.push({ name: course.courseNameTH, reason: 'ไม่พบรหัสวิชา' });
                return; // ข้าม course นี้
            }

            // เพิ่มรายการนี้สำหรับแสดงใน popup
            localCoursesToConfirm.push({
                name: course.courseNameTH,
                grade: course.grade,
                code: effectiveCourseCode // ใช้ effective code
            });
            // *** ไม่ต้องสร้าง payload หรือแยก gradesToPush/Edit ที่นี่แล้ว ***
            // *** การสร้าง payload จะไปทำใน confirmAndSaveAll หลังกดยืนยัน ***
        }
    });

    // --- *** 2. ตรวจสอบว่ามีอะไรให้ยืนยันหรือไม่ *** ---
    if (localCoursesToConfirm.length === 0) {
        console.log('saveAllGrades: No modified courses to save.');
        let toastSeverity: 'info' | 'warn' = 'info';
        let toastDetail = 'ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก';

        if (localSkippedCourses.length > 0) {
            toastSeverity = 'warn';
            toastDetail = `ไม่มีรายการที่แก้ไข แต่มี ${localSkippedCourses.length} รายการที่ไม่สามารถบันทึกได้เนื่องจาก: ${localSkippedCourses.map((s) => s.reason).join(', ')}`;
        } else {
            errorMessage.value = toastDetail;
        }
        toast.add({ severity: toastSeverity, summary: 'ข้อมูล', detail: toastDetail, life: 4000 });
        return;
    }

    // --- *** 3. เตรียมข้อมูลและเปิด Custom Dialog *** ---
    // เคลียร์ข้อความ error เก่าก่อนเปิด dialog
    errorMessage.value = null;

    // เก็บรายการที่จะแสดงใน state และเปิด dialog
    coursesForCustomConfirm.value = [...localCoursesToConfirm];
    showSaveAllConfirmDialog.value = true;

    console.log('saveAllGrades: Custom confirmation dialog opened.');

    // --- *** ลบ confirm.require() และส่วน accept/reject เดิมออกทั้งหมด *** ---
}; // --- *** สิ้นสุดฟังก์ชัน saveAllGrades ฉบับแก้ไข *** ---

// --- *** ฟังก์ชันสำหรับปุ่มใน Custom Dialog *** ---

// ฟังก์ชันเมื่อกด "ยกเลิก" ใน Custom Dialog
const cancelSaveAll = () => {
    console.log('Custom Dialog: Cancelled.');
    showSaveAllConfirmDialog.value = false;
    coursesForCustomConfirm.value = []; // เคลียร์ข้อมูลที่แสดงค้างไว้
};

const hasModifiedCourses = computed(() => {
    // ตรวจสอบใน allSemesters
    const modifiedInSemesters = allSemesters.value.some((semester) => semester.courses.some((course) => course.isModified)); // ตรวจสอบใน otherCourses
    const modifiedInOthers = otherCourses.value.some((course) => course.isModified); // ถ้ามีแก้ไขในส่วนใดส่วนหนึ่ง ให้ return true

    return modifiedInSemesters || modifiedInOthers;
});

const cancelSaveAction = () => {
    console.log(`Custom Dialog: Cancel button clicked. Mode: ${isSingleSaveMode.value ? 'Single' : 'All'}`);

    if (isSingleSaveMode.value && courseToSaveSingle.value) {
        // --- กรณี: ยกเลิกการบันทึกรายการเดียว ---
        const course = courseToSaveSingle.value; // ดึง Course ที่กำลังจะบันทึกออกมา

        // ตรวจสอบว่ามีการแก้ไขหรือไม่ ก่อนที่จะ Revert
        if (course.isModified) {
            console.log(`Reverting single course: ${course.courseCode || course.courseNameTH}`);

            // ตรวจสอบว่ามี originalGrade ก่อนใช้ (เผื่อข้อมูลไม่สมบูรณ์)
            if (course.hasOwnProperty('originalGrade')) {
                course.grade = course.originalGrade; // คืนค่า Grade
            } else {
                console.warn(`Cannot revert single course ${course.courseCode || course.courseNameTH}: originalGrade property missing.`);
                // อาจจะตั้งเป็น null หรือปล่อยไว้ ขึ้นอยู่กับว่าต้องการจัดการอย่างไร
                // course.grade = null;
            }

            // ถ้ามี Field อื่นที่แก้ไขได้และต้องการ Revert (เช่น credit ของวิชาอื่นๆ) ก็ทำตรงนี้
            // if (course.hasOwnProperty('originalCredit')) {
            //     course.credit = course.originalCredit;
            // }

            course.isModified = false; // รีเซ็ต Flag ว่าไม่มีการแก้ไขแล้ว
        } else {
            console.log(`Single course ${course.courseCode || course.courseNameTH} was not modified, nothing to revert.`);
        }
    } else if (!isSingleSaveMode.value) {
        // --- กรณี: ยกเลิกการบันทึกทั้งหมด (Save All) ---
        console.log('Reverting all modified courses (Save All cancelled)...');

        // รวมรายวิชาทั้งหมด
        const allCoursesToRevert = [...allSemesters.value.flatMap((s) => s.courses), ...(otherCourses.value || [])];

        // วน Loop เพื่อหาตัวที่ถูกแก้ไข แล้ว Revert
        allCoursesToRevert.forEach((course) => {
            if (course.isModified) {
                console.log(`Reverting course: ${course.courseCode || course.courseNameTH}`);

                if (course.hasOwnProperty('originalGrade')) {
                    course.grade = course.originalGrade; // คืนค่า Grade
                } else {
                    console.warn(`Cannot revert course ${course.courseCode || course.courseNameTH}: originalGrade property missing.`);
                }

                // คืนค่า Field อื่นๆ ถ้าจำเป็น
                // if (course.hasOwnProperty('originalCredit')) course.credit = course.originalCredit;

                course.isModified = false; // รีเซ็ต Flag
            }
        });
        console.log('Finished reverting for Save All cancellation.');
    }

    // --- ปิด Dialog และเคลียร์ State ที่เกี่ยวข้อง ---
    // การเรียก resetDialogMode ผ่าน @hide น่าจะเพียงพอแล้ว
    // แต่ถ้าต้องการปิดทันที สามารถเรียก showSaveAllConfirmDialog.value = false ที่นี่ได้
    // และอาจจะเรียก resetDialogMode() โดยตรงเลยก็ได้ (แต่อาจจะซ้ำซ้อนกับ @hide)
    showSaveAllConfirmDialog.value = false;

    // เคลียร์ Error Message ของ Dialog (ถ้ามี)
    errorMessage.value = null;
};
// --- <<< วางฟังก์ชัน resetDialogMode ไว้ตรงนี้ได้เลย >>> ---
const resetDialogMode = () => {
    console.log('Dialog hide, resetting mode.');
    // หน่วงเวลาเล็กน้อยเผื่อกรณีคลิกนอก Dialog เพื่อปิด
    setTimeout(() => {
        // เช็คอีกครั้งว่า Dialog ปิดจริงๆ ก่อนเคลียร์ State
        // เพราะ @hide อาจถูกเรียกก่อน v-model:visible อัปเดตในบางกรณี
        if (!showSaveAllConfirmDialog.value) {
            console.log('Confirmed dialog closed, resetting states.');
            isSingleSaveMode.value = false;
            courseToSaveSingle.value = null;
            coursesForCustomConfirm.value = [];
            // errorMessage.value = null; // พิจารณาว่าจะเคลียร์ error ด้วยหรือไม่
        } else {
            console.log('Dialog hide triggered, but visible state is still true. Not resetting yet.');
        }
    }, 50); // หน่วงเวลาสั้นๆ
};

// ฟังก์ชันเมื่อกด "บันทึก" ใน Custom Dialog (จะทำการสร้าง payload และเรียก API จริง)
const confirmAndSaveAll = async () => {
    console.log('Custom Dialog: Confirmed. Starting save process...');
    isSaving.value = true; // เริ่มสถานะกำลังบันทึก
    showSaveAllConfirmDialog.value = false; // ปิด Dialog
    errorMessage.value = null; // เคลียร์ error เก่า

    // --- เตรียมข้อมูล Payload และเรียก API (คล้าย logic เดิมใน accept) ---
    const gradesToPush: Grades[] = [];
    const gradesToEdit: Grades[] = [];
    const coursesToResetFlag: CourseDisplayData[] = [];
    const skippedCourses: { name: string; reason: string }[] = []; // อาจจะมีการข้ามได้อีกครั้ง ถ้าข้อมูลเปลี่ยน? (เผื่อไว้)

    const currentUser = getCurrentUser();
    if (!currentUser?.studentID) {
        errorMessage.value = 'ไม่พบรหัสนักศึกษา (เกิดข้อผิดพลาดระหว่างยืนยัน)';
        toast.add({ severity: 'error', summary: 'ข้อผิดพลาด', detail: errorMessage.value, life: 4000 });
        isSaving.value = false;
        coursesForCustomConfirm.value = []; // เคลียร์ข้อมูล
        return;
    }

    // *** สำคัญ: วน loop ข้อมูลต้นฉบับอีกครั้งเพื่อสร้าง Payload ที่ถูกต้อง ***
    // เราใช้ coursesForCustomConfirm แค่เพื่อยืนยัน แต่ตอนสร้าง payload ต้องใช้ข้อมูลเต็มจาก allSemesters/otherCourses
    const allOriginalCourses = [...allSemesters.value.flatMap((s) => s.courses), ...(otherCourses.value || [])];

    // กรองเอาเฉพาะ Course ที่ถูกยืนยันใน Dialog และยังคงสถานะ Modified อยู่
    const confirmedCoursesToProcess = allOriginalCourses.filter((course) => {
        // 1. หารหัสสำหรับใช้เปรียบเทียบสำหรับ course ปัจจุบัน
        //    อาจจะเป็นรหัสจริง หรือ Placeholder Code ถ้าไม่มีรหัสจริง
        let courseIdentifierCode = course.courseCode;
        if (!courseIdentifierCode && course.courseNameTH) {
            courseIdentifierCode = getPlaceholderCourseCode(course.courseNameTH);
            // console.log(`[Filter] Course ${course.courseNameTH} uses placeholder: ${courseIdentifierCode}`); // Debug log (optional)
        }

        // ถ้ายังไม่ได้รหัสหลังจากพยายามหา Placeholder แล้ว ก็ไม่สามารถเทียบได้ (ข้ามไป)
        if (!courseIdentifierCode) {
            // console.log(`[Filter] Cannot determine identifier code for: ${course.courseNameTH}`); // Debug log (optional)
            return false;
        }

        // 2. ตรวจสอบว่ารหัสนี้ (courseIdentifierCode) อยู่ในรายการยืนยัน (coursesForCustomConfirm) หรือไม่
        const wasInDialog = coursesForCustomConfirm.value.some((confirmItem) => confirmItem.code === courseIdentifierCode);

        // 3. ตรวจสอบว่า course นี้ยังคงสถานะ isModified อยู่หรือไม่
        const isStillModified = course.isModified;

        // Debug log (optional) เพิ่มเติมเพื่อดูว่าทำไมถึงไม่ผ่าน filter
        // if (wasInDialog && !isStillModified) {
        //    console.log(`[Filter] Match found for ${courseIdentifierCode} but isModified is FALSE.`);
        // }
        // if (!wasInDialog && isStillModified) {
        //     console.log(`[Filter] Course ${courseIdentifierCode} is modified but NOT found in dialog codes:`, coursesForCustomConfirm.value.map(c => c.code));
        // }

        // Course จะถูกนำไปประมวลผลต่อเมื่อ:
        // - รหัสของมัน (จริงหรือ Placeholder) ตรงกับรายการใน Dialog
        // - และ มันยังคงถูกตั้งค่า isModified = true
        return wasInDialog && isStillModified;
    });

    if (confirmedCoursesToProcess.length === 0) {
        console.warn('confirmAndSaveAll: No modified courses found matching the confirmation list. Maybe state changed?');
        errorMessage.value = 'ไม่พบรายการที่ต้องบันทึกแล้ว (อาจมีการเปลี่ยนแปลงข้อมูล)';
        toast.add({ severity: 'warn', summary: 'แจ้งเตือน', detail: errorMessage.value, life: 4000 });
        isSaving.value = false;
        coursesForCustomConfirm.value = [];
        return;
    }

    confirmedCoursesToProcess.forEach((course) => {
        let effectiveCourseCode = course.courseCode;
        if (!effectiveCourseCode && course.courseNameTH) {
            effectiveCourseCode = getPlaceholderCourseCode(course.courseNameTH);
        }

        if (!effectiveCourseCode) {
            // กรณีนี้ไม่ควรเกิด ถ้า logic ใน saveAllGrades ถูกต้อง แต่กันไว้
            console.warn(`Skipping save during confirmation for "${course.courseNameTH}" due to missing code.`);
            skippedCourses.push({ name: course.courseNameTH, reason: 'ไม่พบรหัสวิชาขณะยืนยัน' });
            return;
        }

        // --- สร้าง Payload ---
        const payload: Grades = {
            studentId: currentUser.studentID,
            courseCode: effectiveCourseCode,
            grade: course.grade || '',
            credit: course.credit
        };

        // --- แยก Push / Edit ---
        if (course.wasInitiallyNull && course.grade) {
            gradesToPush.push(payload);
            coursesToResetFlag.push(course);
        } else if (!course.wasInitiallyNull) {
            // ไม่เช็ค isModified เพราะกรองมาแล้ว
            gradesToEdit.push(payload);
            coursesToResetFlag.push(course);
        } else if (course.wasInitiallyNull && !course.grade) {
            // กรณีนี้คือ ยืนยันจะลบเกรดที่เคยเป็น Null -> ไม่ต้องเรียก API
            // แต่ต้องเคลียร์ flag isModified หลังจบกระบวนการ
            coursesToResetFlag.push(course); // เพิ่มไปเคลียร์ flag เฉยๆ
            console.log(`Marked ${effectiveCourseCode} for flag reset (was null, still null after confirm).`);
        }
    });

    // --- เรียก API ---
    let pushSuccess = true;
    let editSuccess = true;
    let pushErrorMsg: string | null = null;
    let editErrorMsg: string | null = null;
    const coursesWithErrors: string[] = [];

    try {
        if (gradesToPush.length > 0) {
            console.log('Calling PushGrades with:', gradesToPush);
            try {
                await gradeService.pushGrades(gradesToPush);
                console.log('PushGrades successful');
                // อัปเดต wasInitiallyNull หลัง Push สำเร็จ
                coursesToResetFlag.forEach((course) => {
                    let effCode = course.courseCode || getPlaceholderCourseCode(course.courseNameTH);
                    if (course.wasInitiallyNull && gradesToPush.some((p) => p.courseCode === effCode)) {
                        course.wasInitiallyNull = false; // สำคัญ: อัปเดต state นี้ด้วย
                    }
                });
            } catch (pushError: any) {
                pushSuccess = false;
                console.error('Error pushing grades:', pushError);
                pushErrorMsg = 'เกิดข้อผิดพลาดในการเพิ่มเกรดใหม่: ' + (pushError.response?.data?.title || pushError.message || 'ไม่ทราบสาเหตุ');
                gradesToPush.forEach((g) => coursesWithErrors.push(g.courseCode));
            }
        }

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

        // --- สรุปผลและเคลียร์ Flag ---
        const allApisAttemptedAndSucceeded = pushSuccess && editSuccess;

        // เคลียร์ Flag isModified เฉพาะรายการที่ *ไม่มี* error และรวมถึงรายการที่ยืนยันลบ (was null->null)
        coursesToResetFlag.forEach((course) => {
            let effCode = course.courseCode || getPlaceholderCourseCode(course.courseNameTH);
            if (effCode && !coursesWithErrors.includes(effCode)) {
                console.log(`Clearing modified flag for ${effCode}`);
                course.isModified = false;
            } else if (!effCode) {
                // Case where original course code was null
                const placeholder = getPlaceholderCourseCode(course.courseNameTH);
                if (placeholder && !coursesWithErrors.includes(placeholder)) {
                    console.log(`Clearing modified flag for placeholder ${placeholder}`);
                    course.isModified = false;
                }
            }
        });
        console.log(`Cleared modified flags for successful/no-op items. ${coursesWithErrors.length} items might still be marked as modified.`);

        // --- แสดง Toast สรุป ---
        if (allApisAttemptedAndSucceeded && skippedCourses.length === 0) {
            console.log('บันทึกข้อมูลทั้งหมดสำเร็จ');
            toast.add({
                severity: 'success',
                summary: 'บันทึกข้อมูลสำเร็จ',
                detail: `บันทึกข้อมูลเกรด ${confirmedCoursesToProcess.length} รายการเรียบร้อยแล้ว`,
                life: 3000
            });
        } else {
            let finalMessage = '';
            let finalSeverity: 'warn' | 'error' = 'warn';

            if (!pushSuccess || !editSuccess) {
                finalMessage += (pushErrorMsg || '') + (editErrorMsg ? (pushErrorMsg ? '; ' : '') + editErrorMsg : '');
                finalSeverity = 'error';
            }
            if (skippedCourses.length > 0) {
                finalMessage += (finalMessage ? '; ' : '') + `มี ${skippedCourses.length} รายการที่ข้ามไป (${skippedCourses.map((s) => s.name).join(', ')})`;
                finalSeverity = finalSeverity === 'error' ? 'error' : 'warn';
            }
            errorMessage.value = finalMessage.trim() || 'เกิดข้อผิดพลาดบางอย่างในการบันทึก';
            console.error('Save All completed with errors or skips:', errorMessage.value);
            toast.add({
                severity: finalSeverity,
                summary: finalSeverity === 'error' ? 'เกิดข้อผิดพลาด' : 'บันทึกบางส่วน',
                detail: errorMessage.value,
                life: 5000
            });
        }
    } catch (error: any) {
        // --- Error Handling ครอบคลุม ---
        console.error('Unexpected error in confirmAndSaveAll:', error);
        errorMessage.value = 'เกิดข้อผิดพลาดไม่คาดคิดในการบันทึก: ' + error.message;
        toast.add({ severity: 'error', summary: 'ข้อผิดพลาดรุนแรง', detail: errorMessage.value, life: 5000 });
    } finally {
        isSaving.value = false; // เสร็จสิ้นการบันทึก (ไม่ว่าจะสำเร็จหรือล้มเหลว)
        coursesForCustomConfirm.value = []; // เคลียร์ข้อมูลที่แสดงค้างไว้
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
            // --- *** เพิ่ม Console Log เพื่อ Debug ข้อมูลนำเข้า (ถ้าต้องการ) *** ---
            // console.log('mapSemesterData: templateCourses received:', JSON.stringify(templateCourses));
            // console.log('mapSemesterData: studentGradesData received:', JSON.stringify(studentGradesData));

            return templateCourses.map((templateCourse) => {
                let foundGradeInfo = null;
                let codeToSearch: string | null = null;

                // 1. ตรวจสอบรหัสใน Template หรือสร้าง Placeholder
                if (templateCourse.courseCode) {
                    codeToSearch = templateCourse.courseCode;
                } else if (templateCourse.courseNameTH) {
                    codeToSearch = getPlaceholderCourseCode(templateCourse.courseNameTH);
                }
                // console.log(`Mapping ${templateCourse.courseNameTH}, searching with code: ${codeToSearch}`);

                // 2. ค้นหาเกรดด้วยรหัสที่ได้
                if (codeToSearch) {
                    foundGradeInfo = studentGradesData.find((g) => g.courseCode === codeToSearch);
                    // if (!foundGradeInfo) {
                    //     console.log(`   Grade info not found for code: ${codeToSearch}`);
                    // } else {
                    //      console.log(`   Found grade info:`, foundGradeInfo);
                    // }
                }

                // 3. กำหนดค่าเริ่มต้น
                const initialGrade = foundGradeInfo ? foundGradeInfo.grade : null;
                // กำหนดค่า credit เริ่มต้น (อาจจะมาจาก template หรือ gradeInfo ถ้ามี)
                // ใช้จาก template เป็นหลักตามโค้ดเดิม ถ้าต้องการใช้จาก gradeInfo ต้องปรับ logic
                const initialCredit = templateCourse.credit;
                const wasNull = !foundGradeInfo; // สถานะว่าตอนโหลดมีข้อมูลเกรดหรือไม่

                // 4. Return Object ให้ตรงกับ Type CourseDisplayData
                const courseData: CourseDisplayData = {
                    // <--- กำหนด Type ให้ชัดเจน
                    courseCode: templateCourse.courseCode, // ใช้รหัสจาก template (อาจเป็น null)
                    courseNameTH: templateCourse.courseNameTH,
                    credit: initialCredit, // ใช้หน่วยกิตจาก template
                    grade: initialGrade, // เกรดปัจจุบัน (เริ่มต้น)

                    // --- *** เพิ่ม property ที่ขาดไป *** ---
                    originalGrade: initialGrade, // กำหนด originalGrade ให้เหมือน grade เริ่มต้น
                    // originalCredit: initialCredit, // ถ้าต้องการเก็บ credit เดิมด้วย (อาจจะไม่จำเป็นถ้าไม่แก้ credit)

                    // --- Properties เดิม ---
                    isModified: false, // เริ่มต้นยังไม่แก้ไข
                    wasInitiallyNull: wasNull // สถานะว่าตอนโหลดมีข้อมูลเกรดหรือไม่
                    // tempId: undefined // อาจจะกำหนดถ้าจำเป็นสำหรับบางส่วน
                };
                // console.log('   Mapped Course Data:', JSON.stringify(courseData));
                return courseData; // คืนค่า object ที่มีโครงสร้างสมบูรณ์
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
            .filter((grade: { courseCode: string }) => !templateCourseCodes.has(grade.courseCode))
            .map((grade: { courseNameTH?: string; courseCode: any; credit: any; grade: any }): CourseDisplayData => {
                // เพิ่ม ? ให้ courseNameTH ถ้าอาจไม่มี
                // กำหนดค่าเริ่มต้นจาก DB
                const initialGrade = grade.grade || null;
                const initialCredit = grade.credit; // สมมติว่า API ส่ง credit มาเสมอ
                const courseName = grade.courseNameTH || `(รหัส: ${grade.courseCode})`; // จัดการชื่อถ้าไม่มี

                // สร้าง Object ให้ครบตาม Type CourseDisplayData
                const courseData: CourseDisplayData = {
                    courseCode: grade.courseCode,
                    courseNameTH: courseName,
                    credit: initialCredit,
                    grade: initialGrade,

                    // --- *** เพิ่ม Property ที่ขาดไป *** ---
                    originalGrade: initialGrade, // กำหนด original ให้เหมือนค่าเริ่มต้น
                    // กำหนด original credit ด้วย (ถ้าจำเป็น)

                    // --- Properties เดิม ---
                    isModified: false, // เพิ่งโหลดมา ยังไม่แก้ไข
                    wasInitiallyNull: false // มีข้อมูลใน DB แล้ว ไม่ใช่ null เริ่มต้นใน UI session นี้
                    // tempId: undefined หรือจะสร้าง unique id ก็ได้ถ้า dataKey ใน table ต้องการ
                };
                return courseData; // คืนค่า object ที่สมบูรณ์
            });

        otherCourses.value = otherCoursesDataFromDB;
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
    <div v-else-if="errorMessage && !showSaveAllConfirmDialog" class="error-message">{{ errorMessage }}</div>

    <div v-else>
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
                    <Button label="บันทึกข้อมูลทั้งหมด" icon="pi pi-save" @click="saveAllGrades" :disabled="isSaving || !hasModifiedCourses" />
                </div>
            </div>
        </div>

        <div v-for="(semesterData, index) in allSemesters" :key="'sem-' + index" class="card">
            <Fieldset :legend="semesterData.title" :toggleable="true">
                <DataTable :value="semesterData.courses" tableStyle="min-width: 50rem" dataKey="courseCode" :rowClass="getRowClass">
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
                            <Button icon="pi pi-save" outlined severity="success" @click="saveGrade(slotProps.data)" :disabled="!slotProps.data.isModified || isSaving" />
                        </template>
                    </Column>
                </DataTable>
                <div class="semester-summary">
                    <div>จำนวนหน่วยกิตภาคการศึกษานี้: {{ calculateSemesterCredits(semesterData.courses) }}</div>
                    <div class="summary-total-points">จำนวนแต้มคะแนนภาคการศึกษานี้: {{ calculateSemesterTotalPoints(semesterData.courses).toFixed(1) }}</div>
                    <div>เกรดเฉลี่ยภาคการศึกษานี้: {{ calculateSemesterGPA(semesterData.courses).toFixed(2) }}</div>
                </div>
            </Fieldset>
        </div>

        <div class="card">
            <Fieldset legend="วิชาอื่นๆ หรือรายวิชาที่ยังไม่ผ่าน (F)" :toggleable="true">
                <DataTable :value="otherCourses" tableStyle="min-width: 50rem" dataKey="tempId" :rowClass="getRowClass">
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
                                <Button icon="pi pi-save" outlined severity="success" @click="saveGrade(slotProps.data)" :disabled="isSaving || !slotProps.data.isModified || checkIncompleteNewCourse(slotProps.data)" />
                                <Button v-if="slotProps.data.wasInitiallyNull" icon="pi pi-trash" outlined severity="danger" @click="removeOtherCourse(slotProps.data)" :disabled="isSaving" class="ml-2" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <div class="semester-summary">
                    <div>จำนวนหน่วยกิตวิชาอื่นๆ: {{ calculateSemesterCredits(otherCourses) }}</div>
                    <div class="summary-total-pointsOther">จำนวนแต้มคะแนนวิชาอื่นๆ: {{ calculateSemesterTotalPoints(otherCourses).toFixed(1) }}</div>
                    <div>เกรดเฉลี่ยวิชาอื่นๆ: {{ calculateSemesterGPA(otherCourses).toFixed(2) }}</div>
                </div>

                <div class="flex justify-content-end mt-3 gap-2">
                    <Button label="เพิ่มรายวิชา" icon="pi pi-plus" class="p-button-primary" @click="openAddDialog" :loading="isSaving" :disabled="isSaving" />
                    <Button label="เพิ่มเกรดรายวิชาอื่นๆ" icon="pi pi-plus" @click="addNewOtherCourse" :disabled="isSaving" />
                </div>
            </Fieldset>
        </div>
    </div>

    <Dialog
        v-model:visible="showSaveAllConfirmDialog"
        modal
        :header="isSingleSaveMode ? 'ยืนยันการบันทึกรายการเดียว' : 'ยืนยันการบันทึกทั้งหมด'"
        :style="{ width: '37vw', minWidth: '350px' }"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        @hide="resetDialogMode"
    >
        <div v-if="errorMessage" class="error-message p-mb-3">{{ errorMessage }}</div>

        <div v-if="coursesForCustomConfirm.length > 0">
            <p v-if="isSingleSaveMode && coursesForCustomConfirm[0]">
                คุณต้องการบันทึกการเปลี่ยนแปลงสำหรับวิชา
                <b v-if="coursesForCustomConfirm[0].code">{{ coursesForCustomConfirm[0].code }}</b>
                <i v-else>(ไม่มีรหัส)</i>
                - {{ coursesForCustomConfirm[0].name }} (เกรด: <b :style="{ color: coursesForCustomConfirm[0].grade ? 'inherit' : 'grey' }">{{ coursesForCustomConfirm[0].grade || 'ค่าว่าง (ลบ)' }}</b
                >) หรือไม่?
            </p>
            <p v-else-if="!isSingleSaveMode">คุณต้องการบันทึกการเปลี่ยนแปลง {{ coursesForCustomConfirm.length }} รายการ ดังนี้หรือไม่?</p>

            <ul v-if="!isSingleSaveMode" style="margin-top: 1rem; padding-left: 20px; max-height: 300px; overflow-y: auto; list-style-type: decimal">
                <li v-for="item in coursesForCustomConfirm" :key="item.code || item.name" style="margin-bottom: 0.5rem">
                    <span>
                        <b v-if="item.code">{{ item.code }}</b>
                        <i v-else>(ไม่มีรหัส)</i>
                        - {{ item.name }}
                    </span>
                    <span style="margin-left: 10px">
                        (เกรด: <b :style="{ color: item.grade ? 'inherit' : 'grey' }">{{ item.grade || 'ค่าว่าง (ลบ)' }}</b
                        >)
                    </span>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>ไม่มีรายการให้ยืนยัน</p>
        </div>

        <template #footer>
            <Button label="ยกเลิก" icon="pi pi-times" @click="cancelSaveAction" class="p-button p-button-danger" />
            <Button label="บันทึก" icon="pi pi-check" @click="confirmAndSaveAll" class="p-button-success" :loading="isSaving" :disabled="isSaving || coursesForCustomConfirm.length === 0" autofocus />
        </template>
    </Dialog>

    <Dialog v-model:visible="isAddDialogVisible" header="เพิ่มรายวิชาใหม่" :modal="true" :style="{ width: '450px' }">
        <div class="form-container p-fluid">
            <p class="dialog-hint-text">สำหรับผู้ยังไม่ผ่านบางรายวิชา (F)<br />(ให้ใส่นำหน้าด้วย F030 ตามด้วยรหัสวิชา 4 ตัวหลังของวิชานั้น)</p>
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
                <InputNumber id="credit" v-model="newCourse.credit" mode="decimal" :min="1" :max="9" required :disabled="isSaving" :maxlength="1" @keydown="limitInputLength($event, 1)" />
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

.summary-total-points {
    margin-right: 57rem; /* เปลี่ยนสีข้อความ (ตัวอย่าง: สีน้ำเงินเข้ม) */
}

.summary-total-pointsOther {
    margin-right: 59rem; /* เปลี่ยนสีข้อความ (ตัวอย่าง: สีน้ำเงินเข้ม) */
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
.p-confirmdialog .p-confirm-dialog-message {
    white-space: pre-line;
}
.form-container .field {
    margin-bottom: 1.2rem; /* ระยะห่างระหว่างแต่ละช่องกรอก */
}

.form-container .field label {
    display: block; /* ทำให้ label แสดงผลอยู่บรรทัดบน */
    margin-bottom: 0.5rem; /* ระยะห่างระหว่าง label กับ input */
    font-weight: 600; /* ความหนาของตัวอักษร label (ปรับได้) */
    font-size: 0.9rem; /* ขนาดตัวอักษร label (ปรับได้) */
    color: var(--text-color); /* สีตัวอักษร */
}

/* ทำให้ InputText และ InputNumber กว้างเต็มพื้นที่ ถ้าใช้ class p-fluid */
.form-container.p-fluid .p-inputtext,
.form-container.p-fluid .p-inputnumber {
    width: 100%;
}

.dialog-hint-text {
    color: #888888; /* สีเทาจาง */
    font-size: 1rem; /* ขนาดตัวอักษรเล็กน้อย */
    margin-bottom: 1.2rem; /* ระยะห่างเท่ากับ .field */
    line-height: 1.4; /* ปรับระยะห่างบรรทัดให้อ่านง่าย */
}

:deep(.p-dialog .p-dialog-footer .p-button) {
    margin: 0 0.25rem; /* ปรับระยะห่างระหว่างปุ่มใน footer */
}

/* จัดลำดับปุ่มใน footer (ถ้าต้องการให้ Save อยู่ขวา) */
:deep(.p-dialog .p-dialog-footer) {
    display: flex;
    justify-content: flex-end; /* ดันปุ่มไปทางขวา */
}
</style>
