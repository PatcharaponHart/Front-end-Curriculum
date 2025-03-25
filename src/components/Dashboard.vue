<script setup lang="ts">
import AccumulatedCredits from '@/components/dashboard/AccumulatedCredits.vue';
import PersonalInformation from '@/components/dashboard/PersonalInformation.vue';
import SummaryStructure from '@/components/dashboard/SummaryStructure.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
        console.warn('ไม่มี token → เด้งกลับ Login');
        router.push('/login');
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <!-- ✅ คอลัมน์ด้านซ้าย: ข้อมูลส่วนตัว + หน่วยกิตสะสม -->
        <div class="col-span-12 md:col-span-4">
            <PersonalInformation />
            <AccumulatedCredits class="mt-6" /> 
        </div>

        <!-- ✅ คอลัมน์ด้านขวา: โครงสร้างหลักสูตร -->
        <div class="col-span-12 md:col-span-8">
            <SummaryStructure />
        </div>
    </div>
</template>
