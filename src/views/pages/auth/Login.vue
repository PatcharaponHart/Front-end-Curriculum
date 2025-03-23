<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <!-- โลโก้ -->
      <div class="text-center mb-6">
        <img src="@/assets/logo.png" alt="Logo" class="mx-auto w-24" />
        <h1 class="text-2xl font-bold mt-4">เข้าสู่ระบบ</h1>
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label for="username" class="block text-gray-700">ชื่อผู้ใช้</label>
        <input
          v-model="username"
          id="username"
          type="text"
          placeholder="กรอกชื่อผู้ใช้"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label for="password" class="block text-gray-700">รหัสผ่าน</label>
        <input
          v-model="password"
          id="password"
          type="password"
          placeholder="กรอกรหัสผ่าน"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Remember me -->
      <div class="flex items-center mb-4">
        <input v-model="checked" type="checkbox" id="remember" class="mr-2" />
        <label for="remember" class="text-gray-700">จดจำฉัน</label>
      </div>

      <!-- ปุ่ม Login -->
      <button
        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
        :disabled="loading"
        @click="onLogin"
      >
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>
    </div>

    <!-- Toast แจ้งเตือน -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';  // เพิ่มการนำเข้า useRouter
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { login } from '@/service/authService'; // service login mock

const router = useRouter();  // ใช้ useRouter เพื่อทำการนำทาง
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
}
</style>