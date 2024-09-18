<script setup lang="ts">

import router from '@/router';
import Toast from '@/components/Toast.vue'
import { RouterLink, RouterView, type RouteLocationNormalized } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useUser } from '@/composables/useUser'
import { useChannelTypes } from '@/composables/useChannelTypes'
import { useRoomTypes } from '@/composables/useRoomTypes'
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
