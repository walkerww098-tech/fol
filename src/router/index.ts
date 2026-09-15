/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: Index, meta: { title: 'フラワーオブライフ' } },
    ],
})
router.beforeEach((to) => {
    document.title = (to.meta.title as string) || 'NO TITLE';
});

export default router
