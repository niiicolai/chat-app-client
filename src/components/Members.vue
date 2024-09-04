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

const channel = computed(() => {
    return channelSelector.channel.value
})

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

</script>

<template>
    <div class="bg-black w-full border-b border-gray-800 p-3 h-20 overflow-hidden" v-if="userRooms.length > 0">
        <div v-if="channel" class="text-white text-xs mb-1 overflow-hidden truncate ...">
            {{ channel.description }}
        </div>
        <div>
            <div class="flex items-center h-10 overflow-hidden gap-3">
                <div>
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="16" viewBox="0 0 384 512">
                    <path
                        d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                    </svg>
                </div>

                <ul class="flex flex-wrap gap-3 h-6 overflow-hidden truncate ...">
                    <li v-for="userRoom in userRooms" :key="userRoom.uuid">
                        <div class="shadow-md bg-indigo-700 rounded-full hover:bg-slate-500 overflow-hidden w-10 h-6 flex items-center justify-center"
                            :class="{ 'bg-indigo-500': userRoom.user_uuid === sub }">
                            <div class="p-3 text-white text-xs text-center overflow-hidden font-bold">
                                {{ userRoom.user_uuid.slice(0, 2).toUpperCase() }}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
