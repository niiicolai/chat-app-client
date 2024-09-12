<script setup lang="ts">
import Rooms from '@/components/Rooms.vue';
import Channels from '@/components/Channels.vue';
import Members from '@/components/Members.vue';
import Links from '@/components/Links.vue';
import Messages from '@/components/Messages.vue';
import Webhooks from '@/components/Webhooks.vue';
import Menu from '@/components/Menu.vue';
import NoRoomSelected from '@/components/NoRoomSelected.vue';
import { useRoomSelector } from '@/composables/useRoomSelector';
import { computed } from 'vue';

const roomSelector = useRoomSelector()
const room = computed(() => {
  return roomSelector.room.value
})
</script>

<template>
  <div class="w-full h-screen bg-black overflow-hidden">
    <Links v-if="room" />
    <Webhooks v-if="room" />
    <Menu />

    <div class="w-full flex items-start">
      <Rooms />
      <Channels v-if="room" />

      <div v-if="room" class="w-full h-screen relative">
        <Members />
        <Messages />
      </div>
      <NoRoomSelected v-else />
    </div>
  </div>
</template>
