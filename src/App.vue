<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Toast from '@/components/Toast.vue'

import { useToast } from '@/composables/useToast.js'
import { useUser } from '@/composables/useUser.js'
import router from '@/router';

const publicRoutes = ['login', 'register']

router.beforeEach((to, from, next) => {
  const toastCtrl = useToast()
  const userCtrl = useUser()
  if (!userCtrl.isLoggedIn && !publicRoutes.includes(to.name)) {
    toastCtrl.add('Please login to continue', 'error')
    next({ name: 'login' })
  } else {
    next()
  }
})
</script>

<template>
  <Toast />

  <header class="bg-gray-800 text-white p-3 flex items-center justify-between gap-3">
    <div>
      <nav class="flex gap-3">
        <RouterLink to="/">Home</RouterLink>
        
      </nav>
    </div>
    <div class="flex gap-3">
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Register</RouterLink>
    </div>
  </header>

  <RouterView />
</template>
