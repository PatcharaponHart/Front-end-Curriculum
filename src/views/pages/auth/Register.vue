<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
            <!-- โลโก้ -->
            <div class="text-center mb-8">
                <img src="@/assets/logo.png" alt="Logo" class="mx-auto w-32" />
                <!-- ปรับขนาดโลโก้ -->
                <h1 class="text-3xl font-semibold mt-4 text-gray-800">ลงทะเบียนผู้ใช้</h1>
                <!-- เพิ่มขนาดตัวหนังสือ -->
            </div>

            <div class="mb-6">
                <label for="username" class="block text-base font-medium text-gray-700">ชื่อผู้ใช้</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="username" id="username" type="text" placeholder="กรอกชื่อผู้ใช้ของคุณ" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <div class="mb-6">
                <label for="studentID" class="block text-base font-medium text-gray-700">รหัสนิสิต</label>
                <input
                    v-model="studentID"
                    id="studentID"
                    type="text"
                    placeholder="กรอกรหัสนิสิตของคุณ"
                    class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                    maxlength="10"
                />
            </div>

            <div class="mb-6">
                <label for="section" class="block text-base font-medium text-gray-700">หมู่เรียน</label>
                <select v-model="section" id="section" required class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg">
                    <option value="" disabled selected>-- เลือกหมู่เรียน --</option>

                    <option v-for="option in sectionOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <div class="mb-6">
                <label for="firstName" class="block text-base font-medium text-gray-700">ชื่อ</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="firstName" id="firstName" type="text" placeholder="กรอกชื่อของคุณ" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <div class="mb-6">
                <label for="lastName" class="block text-base font-medium text-gray-700">นามสกุล</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="lastName" id="lastName" type="text" placeholder="กรอกนามสกุลของคุณ" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <div class="mb-6">
                <label for="password" class="block text-base font-medium text-gray-700">รหัสผ่าน</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input v-model="password" id="password" type="password" placeholder="กรอกรหัสผ่านของคุณ" class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <div class="mb-6">
                <label for="confirmPassword" class="block text-base font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                <!-- เพิ่มขนาดตัวหนังสือ -->
                <input
                    v-model="confirmPassword"
                    id="confirmPassword"
                    type="password"
                    placeholder="กรอกรหัสผ่านเดิม"
                    class="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                />
                <!-- ปรับขนาดตัวหนังสือใน input -->
            </div>

            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all focus:outline-none disabled:opacity-50 text-lg" @click="onRegister">{{ loading ? 'กำลังลงทะเบียน...' : 'สมัครใช้งาน' }}</button>

            <div class="text-center mt-8"><span class="text-gray-500">คุณมีบัญชีอยู่แล้วใช่ไหม? </span><router-link :to="{ name: 'login' }" class="text-sm text-blue-500 hover:underline font-bold"> ลงชื่อเข้าใช้ </router-link></div>
        </div>
        <Toast />
        <ConfirmDialog />
    </div>
</template>

<script setup lang="ts">
// Logic ของหน้า Register
import axios from 'axios';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast'; // Import component สำหรับ template
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast'; // Import useToast
import { ref } from 'vue';
import studentService from '../../../service/studentService';

// ... ภายใน script setup
const toast = useToast(); // สร้าง instance ของ toast
const confirm = useConfirm();

// ตอนเรียกใช้
const username = ref('');
const studentID = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const section = ref('');

const sectionOptions = ref([
    { label: 'ภาคปกติ', value: 'ภาคปกติ' }, // label คือข้อความที่แสดง, value คือค่าที่จะเก็บใน v-model
    { label: 'ภาคพิเศษ', value: 'ภาคพิเศษ' }
    // เพิ่มเติมตามต้องการ...
]);

const onRegister = async () => {
    // 1. ตรวจสอบว่ากรอกข้อมูลครบทุกช่องหรือไม่
    if (!username.value || !studentID.value || !section.value || !firstName.value || !lastName.value || !password.value || !confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'ข้อมูลไม่ครบ', detail: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', life: 3000 });
        return; // หยุดฟังก์ชันถ้าข้อมูลไม่ครบ
    }

    // --- START: เพิ่มการตรวจสอบความยาวรหัสนิสิต ---
    // 2. ตรวจสอบว่ารหัสนิสิตมี 10 หลักหรือไม่
    if (studentID.value.length !== 10) {
        toast.add({ severity: 'warn', summary: 'รหัสนิสิตไม่ถูกต้อง', detail: 'รหัสนิสิตต้องมีจำนวน 10 หลัก', life: 3000 });
        return; // หยุดฟังก์ชันถ้ารหัสไม่ครบ 10 หลัก
    }
    // --- END: เพิ่มการตรวจสอบความยาวรหัสนิสิต ---

    // 3. ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password.value !== confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'รหัสผ่านไม่ตรงกัน', detail: 'กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน', life: 3000 });
        return; // หยุดฟังก์ชันถ้ารหัสผ่านไม่ตรงกัน
    }

    // 4. แสดง Dialog ยืนยัน (ถ้าทุกอย่างถูกต้อง)
    confirm.require({
        message: 'ตรวจสอบข้อมูลถูกต้องแล้วใช่มั้ย?',
        header: 'ยืนยันการลงทะเบียน',
        icon: 'pi pi-question-circle',
        acceptLabel: 'ยืนยัน',
        rejectLabel: 'ยกเลิก',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button p-button-danger',
        accept: async () => {
            loading.value = true;
            try {
                const registrationData = {
                    studentID: studentID.value,
                    firstName: firstName.value,
                    lastName: lastName.value,
                    section: section.value,
                    username: username.value,
                    password: password.value
                };

                await studentService.registerStudent(registrationData);

                toast.add({
                    severity: 'success',
                    summary: 'ลงทะเบียนสำเร็จ',
                    detail: 'กำลังนำคุณไปยังหน้าล็อกอิน',
                    life: 2000
                });

                sessionStorage.setItem('showLoginSuccessToast', 'true');
                console.log('Session storage set');

                await new Promise<void>((resolve) => {
                    setTimeout(() => {
                        window.location.href = '/auth/login'; // Redirect
                        resolve();
                    }, 2000);
                });
            } catch (error: any) {
                console.error('Registration Error:', error);
                let detailMessage = 'ไม่สามารถลงทะเบียนได้ โปรดลองอีกครั้ง';

                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 409 || error.response.status === 400) {
                        if (error.response.data && error.response.data.message) {
                            detailMessage = error.response.data.message;
                        } else if (typeof error.response.data === 'string') {
                            detailMessage = error.response.data;
                        } else {
                            detailMessage = `ข้อมูลซ้ำ หรือไม่ถูกต้อง (${error.response.status})`;
                        }
                    } else {
                        detailMessage = `เกิดข้อผิดพลาด: ${error.response.status} ${error.response.statusText}`;
                    }
                } else if (error.message) {
                    detailMessage = error.message;
                }

                toast.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: detailMessage, life: 4000 });
            } finally {
                loading.value = false;
            }
        },
        reject: () => {
            // Optional: Action on rejection
            // toast.add({ severity: 'info', summary: 'ยกเลิก', detail: 'การลงทะเบียนถูกยกเลิก', life: 3000 });
        }
    });
};
</script>

<style scoped>
.bg-white {
    background: rgb(194, 243, 190);
}
</style>
