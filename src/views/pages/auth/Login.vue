<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
            <!-- โลโก้ -->
            <div class="text-center mb-8">
                <img src="@/assets/logo.png" alt="Logo" class="mx-auto w-32" />
                <!-- ปรับขนาดโลโก้ -->
                <h1 class="text-3xl font-semibold mt-4 text-gray-800">เข้าสู่ระบบ</h1>
                <!-- เพิ่มขนาดตัวหนังสือ -->
            </div>

            <!-- ชื่อผู้ใช้ -->
            <div class="mb-6">
                <label for="username" class="block text-base font-medium text-gray-700">ชื่อผู้ใช้</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="username" id="username" type="text" placeholder="กรอกชื่อผู้ใช้" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <!-- รหัสผ่าน -->
            <div class="mb-6">
                <label for="password" class="block text-base font-medium text-gray-700">รหัสผ่าน</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="password" id="password" type="password" placeholder="กรอกรหัสผ่าน" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <!-- จดจำฉัน -->
            <div class="flex items-center mb-6">
                <input v-model="checked" type="checkbox" id="remember" class="mr-2" />
                <label for="remember" class="text-base text-gray-700">จดจำฉัน</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
            </div>

            <!-- ปุ่ม Login -->
            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all focus:outline-none disabled:opacity-50 text-lg" :disabled="loading" @click="onLogin">
                {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            </button>

            <div class="text-center mt-8"><span class="text-gray-500">คุณยังไม่มีบัญชีใช่ไหม? </span><router-link :to="{ name: 'register' }" class="text-sm text-blue-500 hover:underline font-bold"> ลงทะเบียนผู้ใช้ใหม่ </router-link></div>
        </div>

        <!-- Toast แจ้งเตือน -->
        <Toast />
    </div>
</template>

<script setup lang="ts">
import { login } from '@/service/authService'; // service login mock
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const checked = ref(false);
const loading = ref(false);
const toast = useToast();

const onLogin = async () => {
    if (!username.value || !password.value) {
        toast.add({ severity: 'warn', summary: 'แจ้งเตือน', detail: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', life: 3000 });
        return;
    }

    loading.value = true;
    try {
        const success = await login(username.value, password.value);
        if (success) {
            toast.add({ severity: 'success', summary: 'สำเร็จ', detail: 'เข้าสู่ระบบสำเร็จ', life: 3000 });

            // ใช้ router.push() เพื่อไปยังหน้า dashboard หลังจากเข้าสู่ระบบสำเร็จ
            router.push({ name: 'dashboard' });
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: error.message, life: 3000 });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
body {
    background-color: #f3f4f6;
    font-family: 'Inter', sans-serif;
}

input,
button {
    font-size: 16px;
}

button {
    transition: all 0.2s ease-in-out;
}

button:disabled {
    cursor: not-allowed;
}

input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

input,
button {
    transition: all 0.3s ease;
}

.bg-white {
    background: rgb(194, 243, 190); 
}

.bg-blue-500 {
    background-color: #3b82f6;
}

.bg-blue-600 {
    background-color: #2563eb;
}

.text-lg {
    font-size: 1.125rem; /* ขนาดตัวอักษรใน input และปุ่ม */
}

.w-32 {
    width: 10rem; /* ขนาดของโลโก้ */
}
</style>
