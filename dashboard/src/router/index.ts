import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
    },
    {
      path: '/pages',
      name: 'pages',
      component: () => import('@/pages/PagesPage.vue'),
    },
    {
      path: '/regions',
      name: 'regions',
      component: () => import('@/pages/RegionsPage.vue'),
    },
  ],
});

export default router;
