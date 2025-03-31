<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import gradeService, { StudentGradeCourseDto, StudentGradesSummaryDto } from '@/service/gradeService';
import { getCurrentUser } from '@/service/authService';

// โครงสร้างข้อมูลหน่วยกิต
interface CreditRequirement {
  subjectGroup: string;
  requiredCredits: number;
  earnedCredits: number;
  isCompleted: boolean;
  group?: string; // ใช้สำหรับแบ่งหมวดหมู่
}

interface CurriculumStructure {
  subjectGroup: string;
  requiredCredits: number;
  group: string;
}

const studentGrades = ref<StudentGradesSummaryDto | null>(null);
const creditRequirements = ref<CreditRequirement[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// ฟังก์ชันสำหรับคำนวณเกรดเป็นแต้ม
const calculateGradePoint = (grade: string | undefined): number => {
  if (!grade) return 0;
  
  switch (grade) {
    case 'A': return 4.0;
    case 'B+': return 3.5;
    case 'B': return 3.0;
    case 'C+': return 2.5;
    case 'C': return 2.0;
    case 'D+': return 1.5;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
};

// โครงสร้างหลักสูตร (ในกรณีที่ไม่มี API ให้ดึงข้อมูลนี้)
const curriculumStructure: CurriculumStructure[] = [
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "กลุ่มสาระอยู่ดีมีสุข", requiredCredits: 3 },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "วิชาศึกษาทั่วไปกลุ่มสาระศาสตร์แห่งผู้ประกอบการ", requiredCredits: 3 },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "กลุ่มสาระภาษากับการสื่อสาร", requiredCredits: 13 },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "กลุ่มสาระพลเมืองไทยและพลเมืองโลก", requiredCredits: 3 },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "กลุ่มสาระสุนทรียศาสตร์", requiredCredits: 3 },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", subjectGroup: "วิชาศึกษาทั่วไปใน 5 กลุ่มสาระ", requiredCredits: 5 },
  
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 88 หน่วยกิต", subjectGroup: "วิชาแกน", requiredCredits: 12 },
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 88 หน่วยกิต", subjectGroup: "วิชาเฉพาะบังคับ", requiredCredits: 58 },
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 88 หน่วยกิต", subjectGroup: "วิชาเฉพาะเลือก", requiredCredits: 18 },
  
  { group: "หมวดวิชาเลือกเสรี ไม่น้อยกว่า 6 หน่วยกิต", subjectGroup: "วิชาเลือกเสรี", requiredCredits: 6 },
];

// ฟังก์ชันสำหรับดึงข้อมูลเกรดและคำนวณหน่วยกิต
const fetchStudentGradesAndCalculateCredits = async () => {
  try {
    isLoading.value = true;
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.studentID) {
      throw new Error('ไม่พบรหัสนักศึกษา');
    }
    
    // ดึงข้อมูลเกรดของนักศึกษา
    const gradesData = await gradeService.getStudentGradesByStudentId(currentUser.studentID);
    studentGrades.value = gradesData;
    
    // จัดกลุ่มวิชาตามหมวดหมู่
    const groupedSubjects: Record<string, StudentGradeCourseDto[]> = {};
    
    // การจัดกลุ่มวิชาตาม subjectGroup
    gradesData.grades.forEach((grade: { subjectGroup: string | number; grade: string; }) => {
      if (!groupedSubjects[grade.subjectGroup]) {
        groupedSubjects[grade.subjectGroup] = [];
      }
      
      // เพิ่มวิชาที่ไม่ได้ F ในกลุ่ม
      if (grade.grade !== 'F' && grade.grade !== 'W') {
        groupedSubjects[grade.subjectGroup].push(grade);
      }
    });
    
    // คำนวณหน่วยกิตในแต่ละกลุ่ม
    const requirements: CreditRequirement[] = [];
    
    curriculumStructure.forEach(structure => {
      const subjectGroup = structure.subjectGroup;
      const subjectsInGroup = groupedSubjects[subjectGroup] || [];
      
      // คำนวณหน่วยกิตที่ได้ในกลุ่มนี้
      const earnedCredits = subjectsInGroup.reduce((sum, subject) => sum + subject.credit, 0);
      
      // สร้างข้อมูลสำหรับกลุ่มนี้
      const requirement: CreditRequirement = {
        group: structure.group,
        subjectGroup: subjectGroup,
        requiredCredits: structure.requiredCredits,
        earnedCredits: earnedCredits,
        isCompleted: earnedCredits >= structure.requiredCredits
      };
      
      requirements.push(requirement);
    });
    
    creditRequirements.value = requirements;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเกรด:', error);
    errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    isLoading.value = false;
  }
};

// คำนวณหน่วยกิตรวม
const totalCredits = computed(() => {
  return creditRequirements.value.reduce((acc, curr) => {
    return {
      requiredTotal: acc.requiredTotal + curr.requiredCredits,
      earnedTotal: acc.earnedTotal + curr.earnedCredits
    };
  }, { requiredTotal: 0, earnedTotal: 0 });
});

// คำนวณเกรดเฉลี่ย (GPA)
const gpaInfo = computed(() => {
  if (!studentGrades.value) {
    return { gpa: '0.00', totalCredits: 0 };
  }
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  studentGrades.value.grades.forEach(grade => {
    // คำนวณเฉพาะรายวิชาที่มีเกรดและไม่ใช่ W
    if (grade.grade && grade.grade !== 'W') {
      const gradePoint = calculateGradePoint(grade.grade);
      totalPoints += gradePoint * grade.credit;
      totalCredits += grade.credit;
    }
  });
  
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  
  return {
    gpa,
    totalCredits
  };
});

// คำนวณความก้าวหน้าของการเรียนในแต่ละหมวดหมู่
const progressPerGroup = computed(() => {
  const groups = [...new Set(creditRequirements.value.map(item => item.group))];
  
  return groups.map(group => {
    const requirementsInGroup = creditRequirements.value.filter(item => item.group === group);
    const totalRequired = requirementsInGroup.reduce((sum, item) => sum + item.requiredCredits, 0);
    const totalEarned = requirementsInGroup.reduce((sum, item) => sum + item.earnedCredits, 0);
    const percentage = totalRequired > 0 ? Math.min(100, Math.round((totalEarned / totalRequired) * 100)) : 0;
    
    return {
      group,
      totalRequired,
      totalEarned,
      percentage
    };
  });
});

onMounted(fetchStudentGradesAndCalculateCredits);
</script>

<template>
  <div class="card">
    <h2 class="text-primary font-bold mb-4">ข้อมูลสรุปตามโครงสร้างหลักสูตร</h2>
    
    <div v-if="isLoading" class="py-4 text-center text-gray-500">
      กำลังโหลดข้อมูล...
    </div>
    
    <div v-else-if="errorMessage" class="py-4 text-center text-red-500">
      {{ errorMessage }}
    </div>
    
    <div v-else>
      <div class="mb-4 p-4 bg-gray-50 rounded-md">
        <div class="flex justify-between">
          <div>
            <div class="font-medium text-gray-600">ชื่อ-นามสกุล:</div>
            <div class="font-bold" v-if="studentGrades">
              {{ studentGrades.firstName }} {{ studentGrades.lastName }}
            </div>
          </div>
          <div>
            <div class="font-medium text-gray-600">รหัสนิสิต:</div>
            <div class="font-bold" v-if="studentGrades">
              {{ studentGrades.studentID }}
            </div>
          </div>
          <div>
            <div class="font-medium text-gray-600">เกรดเฉลี่ยสะสม:</div>
            <div class="font-bold text-primary">{{ gpaInfo.gpa }}</div>
          </div>
        </div>
      </div>
      
      <div v-for="(group, index) in [...new Set(creditRequirements.map(item => item.group))]" :key="index">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold mt-4">{{ group }}</h3>
          
          <div class="text-sm" v-if="progressPerGroup.find(pg => pg.group === group)">
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-blue-600 h-2.5 rounded-full" 
                  :style="`width: ${progressPerGroup.find(pg => pg.group === group)?.percentage}%`"
                ></div>
              </div>
              <span class="font-medium">
                {{ progressPerGroup.find(pg => pg.group === group)?.percentage }}%
              </span>
            </div>
          </div>
        </div>
        
        <div class="border border-gray-300 rounded-md mt-2">
          <div class="grid grid-cols-4 bg-gray-100 font-bold p-2 text-sm">
            <span class="text-center text-primary">หมวดวิชา</span>
            <span class="text-center text-primary">หน่วยกิตที่ได้</span>
            <span class="text-center text-primary">หน่วยกิตที่ต้องการ</span>
            <span class="text-center text-primary">ครบ / ไม่ครบ</span>
          </div>
          
          <div
            v-for="(requirement, idx) in creditRequirements.filter(item => item.group === group)"
            :key="idx"
            class="grid grid-cols-4 border-b p-2 text-sm items-center"
            :class="{ 'bg-red-50': !requirement.isCompleted }"
          >
            <span>{{ requirement.subjectGroup }}</span>
            <span class="text-center" :class="{ 'text-red-600 font-medium': !requirement.isCompleted }">
              {{ requirement.earnedCredits }}
            </span>
            <span class="text-center">{{ requirement.requiredCredits }}</span>
            <span class="text-center">
              <span v-if="requirement.isCompleted" class="text-green-500 font-bold">✔</span>
              <span v-else class="text-red-500 font-bold">✘</span>
            </span>
          </div>
        </div>
        
        <!-- สรุปหน่วยกิตในกลุ่มนี้ -->
        <div class="mt-1 text-sm text-right">
          <span>
            รวม: 
            <span class="font-medium">
              {{ creditRequirements.filter(item => item.group === group).reduce((sum, item) => sum + item.earnedCredits, 0) }}/
              {{ creditRequirements.filter(item => item.group === group).reduce((sum, item) => sum + item.requiredCredits, 0) }}
            </span> 
            หน่วยกิต
          </span>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-gray-50 rounded-md">
        <div class="font-bold flex justify-between">
          <span>รวมหน่วยกิตทั้งหมด</span>
          <span class="text-primary">
            {{ totalCredits.earnedTotal }}/{{ totalCredits.requiredTotal }} หน่วยกิต
          </span>
        </div>
        
        <div class="mt-4 w-full bg-gray-200 rounded-full h-4">
          <div 
            class="bg-blue-600 h-4 rounded-full text-xs text-white font-medium text-center leading-4" 
            :style="`width: ${Math.min(100, Math.round((totalCredits.earnedTotal / totalCredits.requiredTotal) * 100))}%`"
          >
            {{ Math.min(100, Math.round((totalCredits.earnedTotal / totalCredits.requiredTotal) * 100)) }}%
          </div>
        </div>
        
        <div class="mt-4 flex justify-between text-sm text-gray-600">
          <span>
            วิชาที่ลงทะเบียนทั้งหมด: {{ studentGrades?.grades.length || 0 }} วิชา
          </span>
          <span>
            จำนวนหน่วยกิตที่ยังขาด: {{ Math.max(0, totalCredits.requiredTotal - totalCredits.earnedTotal) }} หน่วยกิต
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom-width: 1px;
}
.grid {
  display: grid;
}
</style>