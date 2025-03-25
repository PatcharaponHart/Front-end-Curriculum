<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const router = useRouter();
const toast = useToast();

// ฟังก์ชันสำหรับออกจากระบบ
const onLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('studentID');
  localStorage.removeItem('studentName');

  toast.add({
    severity: 'info',
    summary: 'ออกจากระบบ',
    detail: 'คุณได้ออกจากระบบแล้ว',
    life: 3000,
  });

  router.push({ name: 'login' });
};
</script>

<template>
  <div class="layout-topbar">
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

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>
          <button type="button" class="layout-topbar-action" @click="onLogout">
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
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
</style>