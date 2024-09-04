<script setup>
import { useToast } from '@/composables/useToast.js'
import { useRoom } from '@/composables/useRoom.js'
import { useRoomSelector } from '@/composables/useRoomSelector.js'
import { useChannelSelector } from '@/composables/useChannelSelector.js'
import { useUser } from '@/composables/useUser.js'
import { ref, computed, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const userCtrl = useUser()
const roomSelector = useRoomSelector()
const channelSelector = useChannelSelector()

const sub = userCtrl.getSub()

const userRooms = computed(() => {
    return roomSelector.userRooms.value
})

const userRoom = computed(() => {
    return roomSelector.userRoom.value
})

const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

onMounted(async () => {
    await roomSelector.fetchRooms()
})

const leaveRoom = async () => {
  const uuid = userRoom.value?.uuid
  if (!uuid) {
    toastCtrl.add('You are not in a room', 'error')
    return
  }

  try {
    await roomCtrl.userRooms.delete(uuid)
  } catch (error) {
    toastCtrl.add(error.message, 'error')
    return
  }

  
  await roomSelector.setRoom(null)
  await channelSelector.setChannel(null)
  await roomSelector.fetchRooms()
}
</script>

<template>
    <div class="fixed right-0 bottom-0 top-0 shadow-lg bg-slate-800 px-8 py-6" style="width: 8.55em;" v-if="userRooms.length > 0">
        <div class="absolute bottom-3 top-3 left-4 right-0 overflow-hidden hover:overflow-y-scroll">
            <div class="p-3">
                <button @click="leaveRoom()" v-if="!isAdmin"
                    class="shadow-md bg-green-400 px-3 mb-3 rounded-md font-bold text-white text-xs w-20 h-20 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center hover:bg-green-500">
                    Leave Room
                </button>

                <ul class="flex flex-col gap-3">
                    <li v-for="userRoom in userRooms" :key="userRoom.uuid">
                        <div class="shadow-md bg-slate-700 rounded-md hover:bg-slate-500 overflow-hidden w-20 h-20 flex items-center justify-center"
                            :class="{ 'bg-slate-500': userRoom.user_uuid === sub }">
                            <div class="p-3 font-bold text-white text-xs text-center overflow-hidden text-ellipsis">
                                {{ userRoom.room_role_name }}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
