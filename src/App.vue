<script setup lang="ts">
import { RouterLink, RouterView, RouteLocationNormalized } from 'vue-router'
import Toast from '@/components/Toast.vue'

import { useToast } from '@/composables/useToast.js'
import { useUser } from '@/composables/useUser.js'
import { useChannelTypes } from '@/composables/useChannelTypes.js'
import { useRoomTypes } from '@/composables/useRoomTypes'
import router from '@/router';
import { onMounted } from 'vue'
 
const publicRoutes = ['login', 'register']
const userCtrl = useUser()
const channelTypesCtrl = useChannelTypes()
const roomTypesCtrl = useRoomTypes()

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
  const toastCtrl = useToast()
  const toName = to.name as string
  if (!userCtrl.isLoggedIn() && !publicRoutes.includes(toName)) {
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
  <RouterView />
</template>
