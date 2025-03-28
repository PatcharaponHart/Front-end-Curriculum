<script setup lang="ts">
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// ดึงข้อมูลผู้ใช้จาก localStorage
const studentName = ref(localStorage.getItem('studentName') || 'ผู้ใช้');
const studentID = ref(localStorage.getItem('studentID') || '-');

// ควบคุมการแสดง dropdown
const isUserMenuOpen = ref(false);

// ฟังก์ชันสำหรับออกจากระบบ
const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentID');
    localStorage.removeItem('studentName');

    toast.add({
        severity: 'info',
        summary: 'ออกจากระบบ',
        detail: 'คุณได้ออกจากระบบแล้ว',
        life: 3000
    });

    router.push({ name: 'login' });
};

// ฟังก์ชันแสดง Confirm Dialog
const confirmLogout = () => {
    confirm.require({
        message: 'คุณต้องการออกจากระบบหรือไม่?',
        header: 'ยืนยันการออกจากระบบ',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'ออกจากระบบ',
        rejectLabel: 'ยกเลิก',
        acceptClass: 'p-button-danger',
        accept: onLogout
    });
};
</script>

<template>
    <div class="layout-topbar">
        <ConfirmDialog></ConfirmDialog>
        <!-- ✅ Confirm Dialog ของ PrimeVue -->
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="@/assets/logo.png" alt="RTS Logo" class="logo-image" />
                <span class="text-primary font-medium">ระบบติดตาม และวางแผนการเรียน</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <!-- ปุ่ม Profile -->
            <div class="relative">
                <button type="button" class="layout-topbar-action" @click="isUserMenuOpen = !isUserMenuOpen">
                    <i class="pi pi-user"></i>
                </button>

                <!-- Dropdown แสดงข้อมูลผู้ใช้ -->
                <div v-if="isUserMenuOpen" class="layout-topbar-user-menu">
                    <div class="user-info">
                        <i class="pi pi-user-circle"></i>
                        <div>
                            <p class="user-name">{{ studentName }}</p>
                            <p class="user-id">รหัส: {{ studentID }}</p>
                        </div>
                    </div>
                    <button type="button" class="layout-topbar-action logout-button" @click="confirmLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* CSS สำหรับ layout topbar และรูปภาพ */
.layout-topbar-logo {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
}

.logo-image {
    height: 60px; /* ปรับขนาดตรงนี้ */
    width: auto;
    vertical-align: middle;
}

.layout-topbar-logo span {
    margin-left: 0.5rem;
    font-weight: bold;
    vertical-align: middle;
}

/* สไตล์ Dropdown User */
.layout-topbar-user-menu {
    position: absolute;
    top: 3rem;
    right: 0;
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 180px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: bold;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #ddd;
}

.user-name {
    font-weight: bold;
    color: #333;
}

.user-id {
    font-size: 0.9rem;
    color: #666;
}

.logout-button {
    margin-top: 0.75rem;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: #d9534f;
    cursor: pointer;
}

.logout-button i {
    margin-right: 0.5rem;
}

.logout-button:hover {
    color: #c9302c;
}
</style>
