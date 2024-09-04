<script setup lang="ts">
import Rooms from '@/components/Rooms.vue';
import Channels from '@/components/Channels.vue';
import Members from '@/components/Members.vue';
import Links from '@/components/Links.vue';
import Messages from '@/components/Messages.vue';
import { useRoomSelector } from '@/composables/useRoomSelector.js';
import { computed } from 'vue';

const GENERAL_CHAT_LINK = import.meta.env.VITE_MAIN_CHAT_LINK
const roomSelector = useRoomSelector()
const room = computed(() => {
  return roomSelector.room.value
})
</script>

<template>
  <div class="w-full h-screen bg-black overflow-hidden">
    <Links v-if="room" />

    <div class="w-full flex items-start">
      <Rooms />
      <Channels v-if="room" />

      <div v-if="room" class="w-full h-screen relative">
        <Members />
        <Messages />
      </div>
      <div v-else class="w-full h-screen flex items-center justify-center">
        <div
          class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
          <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
              <path
                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
            </svg>

            No Rooms Selected... Spooky!
          </div>
          <div class="w-72 mb-3 text-center">
            Looks like our friendly ghost is hanging out here while you decide which room to enter. Don’t worry, the adventure starts as soon as you pick a space to explore!
          </div>
          <div class="w-72 text-center">
            You’re not alone—join the fun! Head over to the main chat by clicking here: <a :href="GENERAL_CHAT_LINK" class="text-indigo-700">General Chat</a>.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
