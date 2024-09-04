<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Toast from '@/components/Toast.vue'

import { useToast } from '@/composables/useToast.js'
import { useUser } from '@/composables/useUser.js'
import { useChannelTypes } from '@/composables/useChannelTypes.js'
import { useRoomTypes } from '@/composables/useRoomTypes.js'
import router from '@/router';
import { onMounted } from 'vue'

const publicRoutes = ['login', 'register']
const userCtrl = useUser()
const channelTypesCtrl = useChannelTypes()
const roomTypesCtrl = useRoomTypes()

router.beforeEach((to, from, next) => {
  const toastCtrl = useToast()
  
  if (!userCtrl.isLoggedIn && !publicRoutes.includes(to.name)) {
    toastCtrl.add('Please login to continue', 'error')
    next({ name: 'login' })
  } else {
    next()
  }
})

onMounted(async () => {
  await channelTypesCtrl.init()
  await roomTypesCtrl.init()
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
      <RouterLink v-if="!userCtrl.isLoggedIn" to="/login">Login</RouterLink>
      <RouterLink v-if="!userCtrl.isLoggedIn" to="/register">Register</RouterLink>
      <RouterLink v-if="userCtrl.isLoggedIn" to="/room/new">New Room</RouterLink>
    </div>
  </header>

  <RouterView />
</template>
