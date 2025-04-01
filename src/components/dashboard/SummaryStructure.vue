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

// คำนวณเปอร์เซ็นต์ของ GPA เทียบกับค่าสูงสุด (4.00)
const gpaPercentage = computed(() => {
  const gpa = parseFloat(gpaInfo.value.gpa);
  return (gpa / 4.0) * 100;
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

// คำนวณข้อมูลสำหรับกราฟวงกลม (Pie Chart)
const pieChartData = computed(() => {
  const gpa = parseFloat(gpaInfo.value.gpa);
  const percentage = gpa / 4.0;
  const remaining = 1 - percentage;
  
  // คำนวณค่าต่างๆ สำหรับ SVG
  const radius = 45; // เพิ่มขนาดวงกลม
  const circumference = 2 * Math.PI * radius;
  const gpaStrokeDasharray = circumference * percentage;
  const remainingStrokeDasharray = circumference * remaining;
  
  // ผลลัพธ์แบบเกรด
  const gradeResult = (() => {
    if (gpa >= 3.5) return 'ดีเยี่ยม';
    if (gpa >= 3.0) return 'ดีมาก';
    if (gpa >= 2.5) return 'ดี';
    if (gpa >= 2.0) return 'พอใช้';
    if (gpa >= 1.5) return 'อ่อน';
    if (gpa >= 1.0) return 'อ่อนมาก';
    return 'ไม่ผ่าน';
  })();
  
  // สีของกราฟตามเกรด
  const gpaColor = (() => {
    if (gpa >= 3.5) return '#4CAF50'; // เขียวเข้ม
    if (gpa >= 3.0) return '#8BC34A'; // เขียวอ่อน
    if (gpa >= 2.5) return '#CDDC39'; // เขียวเหลือง
    if (gpa >= 2.0) return '#FFEB3B'; // เหลือง
    if (gpa >= 1.5) return '#FFC107'; // เหลืองส้ม
    if (gpa >= 1.0) return '#FF9800'; // ส้ม
    return '#F44336'; // แดง
  })();
  
  return {
    radius,
    circumference,
    gpaStrokeDasharray,
    remainingStrokeDasharray,
    gradeResult,
    gpaColor
  };
});

onMounted(fetchStudentGradesAndCalculateCredits);
</script>

<template>
  <div class="card">
    <h2 class="text-primary">ข้อมูลสรุปตามโครงสร้างหลักสูตร</h2>
    
    <div v-if="isLoading" class="py-8 text-center text-gray-500 text-lg">
      กำลังโหลดข้อมูล...
    </div>
    
    <div v-else-if="errorMessage" class="py-8 text-center text-red-500 text-lg">
      {{ errorMessage }}
    </div>
    
    <div v-else>
      <div class="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm">
        <div class="flex justify-between items-center">
          <!-- GPA Pie Chart -->
          <div class="flex items-center space-x-6">
            <div class="relative">
              <svg height="120" width="120" class="transform -rotate-90">
                <!-- เส้นขอบวงกลมสีเทาอ่อน (ส่วนที่เหลือ) -->
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  stroke="#e5e7eb" 
                  stroke-width="12" 
                  fill="transparent"
                />
                <!-- ส่วนที่แสดง GPA -->
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  stroke-width="12" 
                  stroke-dasharray="282.7"
                  :stroke-dashoffset="pieChartData.circumference - pieChartData.gpaStrokeDasharray"
                  :stroke="pieChartData.gpaColor"
                  fill="transparent" 
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <!-- แสดงค่า GPA ตรงกลางวงกลม -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold" :style="`color: ${pieChartData.gpaColor}`">{{ gpaInfo.gpa }}</span>
                <span class="text-sm text-gray-500 font-medium">GPA</span>
              </div>
            </div>
            
            <div class="flex flex-col">
              <span class="text-2xl font-medium text-gray-800">เกรดเฉลี่ยสะสม</span>
              <span class="text-base text-gray-500">จาก 4.00</span>
              <span class="font-medium mt-2 text-xl" :style="`color: ${pieChartData.gpaColor}`">
                {{ pieChartData.gradeResult }}
              </span>
            </div>
          </div>
          
          <div>
            <div class="flex items-center gap-3">
              <span class="text-base font-medium text-gray-700">
                {{ Math.round(gpaPercentage) }}% จากเกรดสูงสุด
              </span>
              <div class="w-40 bg-gray-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all duration-1000 ease-out" 
                  :style="`width: ${gpaPercentage}%; background-color: ${pieChartData.gpaColor}`"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-for="(group, index) in [...new Set(creditRequirements.map(item => item.group))]" :key="index" class="mb-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold mt-4">{{ group }}</h3>
          
          <div class="text-base" v-if="progressPerGroup.find(pg => pg.group === group)">
            <div class="flex items-center gap-3">
              <div class="w-40 bg-gray-200 rounded-full h-3">
                <div 
                  class="bg-blue-600 h-3 rounded-full" 
                  :style="`width: ${progressPerGroup.find(pg => pg.group === group)?.percentage}%`"
                ></div>
              </div>
              <span class="font-medium">
                {{ progressPerGroup.find(pg => pg.group === group)?.percentage }}%
              </span>
            </div>
          </div>
        </div>
        
        <div class="border border-gray-300 rounded-md mt-3 shadow-sm">
          <div class="grid grid-cols-4 bg-gray-100 font-bold p-3 text-base">
            <span class="text-center text-primary">หมวดวิชา</span>
            <span class="text-center text-primary">หน่วยกิตที่ได้</span>
            <span class="text-center text-primary">หน่วยกิตที่ต้องการ</span>
            <span class="text-center text-primary">ครบ / ไม่ครบ</span>
          </div>
          
          <div
            v-for="(requirement, idx) in creditRequirements.filter(item => item.group === group)"
            :key="idx"
            class="grid grid-cols-4 border-b p-3 text-base items-center"
            :class="{ 'bg-red-50': !requirement.isCompleted }"
          >
            <span>{{ requirement.subjectGroup }}</span>
            <span class="text-center" :class="{ 'text-red-600 font-medium': !requirement.isCompleted }">
              {{ requirement.earnedCredits }}
            </span>
            <span class="text-center">{{ requirement.requiredCredits }}</span>
            <span class="text-center">
              <span v-if="requirement.isCompleted" class="text-green-500 font-bold text-lg">✔</span>
              <span v-else class="text-red-500 font-bold text-lg">✘</span>
            </span>
          </div>
        </div>
        
        <!-- สรุปหน่วยกิตในกลุ่มนี้ -->
        <div class="mt-2 text-base text-right">
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
      
      <div class="mt-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <div class="font-bold flex justify-between text-lg">
          <span>รวมหน่วยกิตทั้งหมด</span>
          <span class="text-primary">
            {{ totalCredits.earnedTotal }}/{{ totalCredits.requiredTotal }} หน่วยกิต
          </span>
        </div>
        
        <div class="mt-4 w-full bg-gray-200 rounded-full h-5">
          <div 
            class="bg-blue-600 h-5 rounded-full text-sm text-white font-medium text-center leading-5" 
            :style="`width: ${Math.min(100, Math.round((totalCredits.earnedTotal / totalCredits.requiredTotal) * 100))}%`"
          >
            {{ Math.min(100, Math.round((totalCredits.earnedTotal / totalCredits.requiredTotal) * 100)) }}%
          </div>
        </div>
        
        <div class="mt-5 flex justify-between text-base text-gray-700">
          <span>
            วิชาที่ลงทะเบียนทั้งหมด: <span class="font-medium">{{ studentGrades?.grades.length || 0 }}</span> วิชา
          </span>
          <span>
            จำนวนหน่วยกิตที่ยังขาด: <span class="font-medium">{{ Math.max(0, totalCredits.requiredTotal - totalCredits.earnedTotal) }}</span> หน่วยกิต
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

.card {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>