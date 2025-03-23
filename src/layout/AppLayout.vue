<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null);

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event: MouseEvent) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;
                layoutState.staticMenuMobileActive = false;
                layoutState.menuHoverActive = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
}

// ✅ แก้ null check ให้รองรับ TypeScript
function isOutsideClicked(event: MouseEvent): boolean {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    const target = event.target as Node | null;

    const clickedSidebar =
        sidebarEl &&
        target &&
        (sidebarEl.isSameNode(target) || sidebarEl.contains(target));

    const clickedTopbar =
        topbarEl &&
        target &&
        (topbarEl.isSameNode(target) || topbarEl.contains(target));

    return !(clickedSidebar || clickedTopbar);
}

// Cleanup event เมื่อ component ถูก destroy
onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container">
            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
</template>
