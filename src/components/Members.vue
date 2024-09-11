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
const displayAllMembers = ref(false)

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

const isModerator = computed(() => {
    return roomSelector.hasRole('Moderator')
})

const setUserRoomRole = async (uuid, room_role_name) => {
    if (!isAdmin.value && !isModerator.value) {
        toastCtrl.add('You are not an admin or moderator', 'error')
        return
    }
    if (!room_role_name) {
        toastCtrl.add('Role name is required', 'error')
        return
    }
    if (!uuid) {
        toastCtrl.add('uuid is required', 'error')
        return
    }
    try {
        await roomCtrl.userRooms.update(uuid, { room_role_name })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    toastCtrl.add('User role set to ' + room_role_name, 'success')
    await roomSelector.reinitUserRooms()
}

const destroyUserRoom = async (userRoom) => {
    if (!isAdmin.value && !isModerator.value) {
        toastCtrl.add('You are not an admin or moderator', 'error')
        return
    }
    if (!userRoom) {
        toastCtrl.add('User room is required', 'error')
        return
    }
    try {
        await roomCtrl.userRooms.delete(userRoom.uuid)
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    toastCtrl.add('User kicked', 'success')
    await roomSelector.reinitUserRooms()
}

onMounted(async () => {
    await roomSelector.fetchRooms()
})

</script>

<template>
    <div>

        <div v-if="displayAllMembers === true" style="z-index:2;"
            class="fixed top-0 left-0 bottom-0 right-0 p-3 bg-gray-800 bg-opacity-50 flex justify-center overflow-y-auto">
            <div class="w-96">
                <div class="w-96 bg-black text-white p-4 rounded-md">
                    <div class="border-b border-gray-800 pb-3 mb-3">
                        <h3 class="text-3xl font-bold mb-1">
                            Members
                        </h3>

                        <p class="text-md">
                            Find all the members in this room.
                        </p>
                    </div>

                    <ul class="flex flex-col gap-3 mb-3">
                        <li v-for="userRoom in userRooms" :key="userRoom.uuid"
                            class="flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div class="shadow-md bg-indigo-700 rounded-full hover:bg-slate-500 overflow-hidden w-6 h-6 flex items-center justify-center"
                                    :class="{ 'bg-indigo-500': userRoom.user_uuid === sub }">
                                    <div class="text-white text-xs text-center overflow-hidden font-bold">
                                        <div v-if="!userRoom.user.avatar_src">
                                            {{ userRoom.user.username.slice(0, 1).toUpperCase() }}
                                        </div>
                                        <div v-else>
                                            <img :src="userRoom.user.avatar_src" class="w-6 h-6 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="text-white text-xs overflow-hidden font-bold mb-1">
                                        {{ userRoom.user.username }}
                                    </div>
                                    <div
                                        style="font-size: 0.6em;"
                                        class="text-white text-indigo-500 text-xs overflow-hidden font-bold">
                                        {{ userRoom.room_role_name }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="isAdmin || isModerator" class="grid grid-cols-2 gap-1">
                                <button v-if="isAdmin" @click="setUserRoomRole(userRoom.uuid, 'Admin')" title="Set as Admin"
                                    class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                    ADM
                                </button>
                                <button v-if="isAdmin" @click="setUserRoomRole(userRoom.uuid, 'Moderator')" title="Set as Moderator"
                                    class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                    MOD
                                </button>
                                <button v-if="isAdmin" @click="setUserRoomRole(userRoom.uuid, 'Member')" title="Set as Member"
                                    class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                    MEM
                                </button>
                                <button v-if="userRoom.room_role_name === 'Member'" @click="destroyUserRoom(userRoom)" title="Kick"
                                    class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white flex items-center justify-center">
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="18"
                                        viewBox="0 0 640 512">
                                        <path
                                            d="M208 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM123.7 200.5c1-.4 1.9-.8 2.9-1.2l-16.9 63.5c-5.6 21.1-.1 43.6 14.7 59.7l70.7 77.1 22 88.1c4.3 17.1 21.7 27.6 38.8 23.3s27.6-21.7 23.3-38.8l-23-92.1c-1.9-7.8-5.8-14.9-11.2-20.8l-49.5-54 19.3-65.5 9.6 23c4.4 10.6 12.5 19.3 22.8 24.5l26.7 13.3c15.8 7.9 35 1.5 42.9-14.3s1.5-35-14.3-42.9L281 232.7l-15.3-36.8C248.5 154.8 208.3 128 163.7 128c-22.8 0-45.3 4.8-66.1 14l-8 3.5c-32.9 14.6-58.1 42.4-69.4 76.5l-2.6 7.8c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l2.6-7.8c5.7-17.1 18.3-30.9 34.7-38.2l8-3.5zm-30 135.1L68.7 398 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L116.3 441c4.6-4.6 8.2-10.1 10.6-16.1l14.5-36.2-40.7-44.4c-2.5-2.7-4.8-5.6-7-8.6zM550.6 153.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L530.7 224 384 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l146.7 0-25.4 25.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l80-80c12.5-12.5 12.5-32.8 0-45.3l-80-80z" />
                                    </svg>
                                </button>

                            </div>
                        </li>
                        <li v-if="userRooms.length === 0">
                            <div class="text-white w-full shadow-md bg-slate-700 rounded-md p-3">
                                <div class="overflow-hidden h-20 flex gap-1 items-center justify-center">
                                    <div class="font-bold w-full text-center text-lg">
                                        No Members Found
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <button @click="displayAllMembers = false"
                        class="w-full p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-black w-full border-b border-gray-800 p-3 h-20 overflow-hidden"
            v-if="userRooms && userRooms.length > 0">
            <div v-if="channel" class="text-white text-xs mb-1 overflow-hidden truncate ...">
                {{ channel.description }}
            </div>
            <div>
                <div class="flex items-center h-10 overflow-hidden gap-3">
                    <button @click="displayAllMembers = true" title="All"
                        class="bg-indigo-700 hover:bg-indigo-500 w-6 h-6 flex items-center justify-center rounded-full">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="10" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>
                    </button>

                    <ul class="flex flex-wrap gap-3 h-6 overflow-hidden truncate ...">
                        <li v-for="userRoom in userRooms" :key="userRoom.uuid">
                            <div class="shadow-md bg-indigo-700 rounded-full hover:bg-slate-500 overflow-hidden w-6 h-6 flex items-center justify-center"
                                :class="{ 'bg-indigo-500': userRoom.user_uuid === sub }">
                                <div class="text-white text-xs text-center overflow-hidden font-bold"
                                    :title="userRoom.user.username">
                                    <div v-if="!userRoom.user.avatar_src">
                                        {{ userRoom.user.username.slice(0, 1).toUpperCase() }}
                                    </div>
                                    <div v-else>
                                        <img :src="userRoom.user.avatar_src" class="w-6 h-6 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

</template>
