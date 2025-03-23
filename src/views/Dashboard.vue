<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';

// ใช้ Router เพื่อ redirect
const router = useRouter();

// เช็ก token ตอนโหลดหน้า
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
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <RecentSalesWidget />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
</template>
