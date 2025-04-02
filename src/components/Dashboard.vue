<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn, getCurrentUser } from '@/service/authService';
import AccumulatedCredits from '@/components/dashboard/AccumulatedCredits.vue';
import PersonalInformation from '@/components/dashboard/PersonalInformation.vue';
import SummaryStructure from '@/components/dashboard/SummaryStructure.vue';

const router = useRouter();
const user = ref({
    studentID: '',
    name: '',
});

onMounted(() => {
    if (!isLoggedIn()) {
        console.warn('ไม่มี token → เด้งกลับ Login');
        router.push('/auth/login');
    } else {
        console.log('User is logged in');
        user.value = getCurrentUser(); // โหลดข้อมูลผู้ใช้
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <!-- ✅ คอลัมน์ด้านซ้าย: ข้อมูลส่วนตัว + หน่วยกิตสะสม -->
        <div class="col-span-12 md:col-span-4">
            <PersonalInformation :user="user" />
            <AccumulatedCredits class="mt-6" /> 
        </div>

        <!-- ✅ คอลัมน์ด้านขวา: โครงสร้างหลักสูตร -->
        <div class="col-span-12 md:col-span-8">
            <SummaryStructure />
        </div>
    </div>
</template>
