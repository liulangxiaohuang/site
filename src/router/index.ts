import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LayoutView from '@/layouts/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LayoutView,
    children: [
      {
        path: '',
        name: 'Home',
        // chunk (Photos.[hash].js)
        // lazy-loaded when the route is visited
        component: () => import('@/views/HomeView.vue')
      },
      {
        path: 'photos',
        name: 'Photos',
        component: () => import('@/views/PhotosView.vue'),
      },
      {
        path: 'photobook',
        name: 'Photobook',
        component: () => import('@/views/PhotoBookView.vue'),
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Wild Huang'
  next()
})

export default router
