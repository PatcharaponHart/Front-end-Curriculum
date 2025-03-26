<script setup lang="ts">
import { ref } from 'vue';

// โครงสร้างข้อมูลหน่วยกิต
interface CreditRequirement {
  category: string;
  requiredCredits: number;
  earnedCredits: number;
  isCompleted: boolean;
  group?: string; // ใช้สำหรับแบ่งหมวดหมู่
}

const creditRequirements = ref<CreditRequirement[]>([
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระอยู่ดีมีสุข (พลศึกษา)", requiredCredits: 1, earnedCredits: 1, isCompleted: true },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระอยู่ดีมีสุข ไม่น้อยกว่า", requiredCredits: 2, earnedCredits: 3, isCompleted: true },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระศาสตร์แห่งผู้ประกอบการ ไม่น้อยกว่า", requiredCredits: 3, earnedCredits: 3, isCompleted: true },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระภาษาและการสื่อสาร", requiredCredits: 13, earnedCredits: 13, isCompleted: true },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระพลเมืองไทยและพลเมืองโลก ไม่น้อยกว่า", requiredCredits: 3, earnedCredits: 3, isCompleted: true },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระสุขภาวะศาสตร์ ไม่น้อยกว่า", requiredCredits: 3, earnedCredits: 0, isCompleted: false },
  { group: "หมวดวิชาศึกษาทั่วไป ไม่น้อยกว่า 30 หน่วยกิต", category: "กลุ่มสาระของหมวดการศึกษาทั่วไป วิชาของคณะต้นสังกัด", requiredCredits: 5, earnedCredits: 6, isCompleted: true },
  
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 92 หน่วยกิต", category: "วิชาแกน", requiredCredits: 16, earnedCredits: 16, isCompleted: true },
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 92 หน่วยกิต", category: "วิชาเอกบังคับ", requiredCredits: 55, earnedCredits: 56, isCompleted: true },
  { group: "หมวดวิชาเฉพาะ ไม่น้อยกว่า 92 หน่วยกิต", category: "วิชาเอกเลือก", requiredCredits: 21, earnedCredits: 12, isCompleted: false },

  { group: "หมวดวิชาเลือกเสรี ไม่น้อยกว่า 6 หน่วยกิต", category: "หมวดวิชาเลือกเสรี", requiredCredits: 6, earnedCredits: 6, isCompleted: true },
]);

// คำนวณหน่วยกิตรวม
const calculateTotalCredits = () => {
  const total = creditRequirements.value.reduce((acc, curr) => {
    return {
      requiredTotal: acc.requiredTotal + curr.requiredCredits,
      earnedTotal: acc.earnedTotal + curr.earnedCredits
    };
  }, { requiredTotal: 0, earnedTotal: 0 });

  return total;
};

const totalCredits = calculateTotalCredits();
</script>

<template>
  <div class="card">
    <h2 class="text-primary font-bold mb-4">ข้อมูลสรุปตามโครงสร้างหลักสูตร</h2>

    <div v-for="(group, index) in [...new Set(creditRequirements.map(item => item.group))]" :key="index">
      <h3 class="text-lg font-semibold mt-4">{{ group }}</h3>
      
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
        >
          <span>{{ requirement.category }}</span>
          <span class="text-center">{{ requirement.earnedCredits }}</span>
          <span class="text-center">{{ requirement.requiredCredits }}</span>
          <span class="text-center">
            <span v-if="requirement.isCompleted" class="text-green-500">✔</span>
            <span v-else class="text-red-500">✘</span>
          </span>
        </div>
      </div>
    </div>

    <div class="mt-6 font-bold flex justify-between">
      <span>รวมทั้งหมด</span>
      <span>
        {{ totalCredits.earnedTotal }}/{{ totalCredits.requiredTotal }} หน่วยกิต
      </span>
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
