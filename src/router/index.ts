import AppLayout from '@/layout/AppLayout.vue';
import { isLoggedIn } from '@/service/authService'; // ✅ นำเข้าจาก authService
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/auth/login'
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue')
    },
    {
        path: '/auth/login/register',
        name: 'register',
        component: () => import('@/views/pages/auth/Register.vue')
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    },

    // ✅ Layout หลักหลัง Login
    {
        path: '/',
        component: AppLayout,
        meta: { requiresAuth: true }, // ✅ เพิ่มตรวจสอบ login
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/components/Dashboard.vue')
            },
            {
                path: 'components/coursestructures',
                name: 'coursestructures',
                component: () => import('@/components/CourseStructure.vue')
            },
            {
                path: '/components/allsubjects',
                name: 'formlayout',
                component: () => import('@/components/AllSubjects.vue')
            },
            {
                path: '/components/poststudyplan',
                name: 'input',
                component: () => import('@/components/PostStudyPlan.vue')
            },
            {
                path: '/components/studyplan',
                name: 'button',
                component: () => import('@/components/StudyPlan.vue')
            },
            {
                path: 'uikit/table',
                name: 'table',
                component: () => import('@/views/uikit/TableDoc.vue')
            },
            {
                path: 'uikit/list',
                name: 'list',
                component: () => import('@/views/uikit/ListDoc.vue')
            },
            {
                path: 'uikit/tree',
                name: 'tree',
                component: () => import('@/views/uikit/TreeDoc.vue')
            },
            {
                path: 'uikit/panel',
                name: 'panel',
                component: () => import('@/views/uikit/PanelsDoc.vue')
            },
            {
                path: 'uikit/overlay',
                name: 'overlay',
                component: () => import('@/views/uikit/OverlayDoc.vue')
            },
            {
                path: 'uikit/media',
                name: 'media',
                component: () => import('@/views/uikit/MediaDoc.vue')
            },
            {
                path: 'uikit/message',
                name: 'message',
                component: () => import('@/views/uikit/MessagesDoc.vue')
            },
            {
                path: 'uikit/file',
                name: 'file',
                component: () => import('@/views/uikit/FileDoc.vue')
            },
            {
                path: 'uikit/menu',
                name: 'menu',
                component: () => import('@/views/uikit/MenuDoc.vue')
            },
            {
                path: 'uikit/charts',
                name: 'charts',
                component: () => import('@/views/uikit/ChartDoc.vue')
            },
            {
                path: 'uikit/misc',
                name: 'misc',
                component: () => import('@/views/uikit/MiscDoc.vue')
            },
            {
                path: 'uikit/timeline',
                name: 'timeline',
                component: () => import('@/views/uikit/TimelineDoc.vue')
            },
            {
                path: 'pages/empty',
                name: 'empty',
                component: () => import('@/views/pages/Empty.vue')
            },
            {
                path: 'pages/crud',
                name: 'crud',
                component: () => import('@/views/pages/Crud.vue')
            },
            {
                path: 'documentation',
                name: 'documentation',
                component: () => import('@/views/pages/Documentation.vue')
            }
        ]
    },

    {
        path: '/landing',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const loggedIn = isLoggedIn();

    if (requiresAuth && !loggedIn) {
        next({ name: 'login' });
    } else if (to.name === 'login' && loggedIn && from.name !== 'register') {
        // <<< เพิ่มเงื่อนไข && from.name !== 'register'
        // ถ้า Login แล้ว และจะไปหน้า Login *และไม่ได้มาจากหน้า Register* ให้ไป Dashboard
        next({ name: 'dashboard' });
    } else {
        // กรณีอื่นๆ (รวมถึงกรณีที่มาจาก Register) ให้ไปตามปกติ
        // ซึ่งถ้า to.name คือ 'login' (และมาจาก register) มันก็จะไป login ตามที่ push มา
        next();
    }
});

export default router;
