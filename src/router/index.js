import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/Login.vue'
import DashboardPage from '@/views/Dashboard.vue'
import ResetPasswordPage from '@/views/ResetPassword.vue'
import SetNewPasswordPage from '@/views/SetNewPassword.vue'
import { Message } from 'element-ui'

Vue.use(VueRouter)

const routes = [
  { path: '/',
    redirect: '/login' },

  { path: '/login', 
    name: 'Login', 
    component: LoginPage },

  { path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage },

  { path: '/set-new-password',
    name: 'SetNewPassword', 
    component: SetNewPasswordPage },

  { path: '/dashboard', 
    name: 'Dashboard',
    component: DashboardPage, 
    meta: { requiresAuth: true } },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 白名单，不需要认证的路由
const whiteList = ['/login', '/reset-password', '/set-new-password']

router.beforeEach((to, from, next) => {
  // 检查是否在白名单中
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  
  // 获取 token（使用与 request.js 相同的逻辑）
  let token = window.tokenCache || localStorage.getItem('token')
  
  // 统一使用内存tokenCache，移除漏洞放行逻辑
  if (to.meta.requiresAuth && !token) {
    Message.warning('请先登录')
    next('/login')
  } else {
    // 其他路由直接放行
    next()  
  }
})

export default router