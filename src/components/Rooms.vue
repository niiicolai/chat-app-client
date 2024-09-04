<script setup>
import RoomIcon from '@/components/RoomIcon.vue'
import { useToast } from '@/composables/useToast.js'
import { useRoom } from '@/composables/useRoom.js'
import { useRoomSelector } from '@/composables/useRoomSelector.js'
import { useRoomTypes } from '@/composables/useRoomTypes.js'
import { useUser } from '@/composables/useUser.js'
import router from '@/router'
import { ref, computed, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const roomSelector = useRoomSelector()
const roomTypesCtrl = useRoomTypes()
const userCtrl = useUser()

const rooms = computed(() => {
    return roomSelector.rooms.value
})

const room = computed(() => {
    return roomSelector.room.value
})

const userRoom = computed(() => {
    return roomSelector.userRoom.value
})

const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

const roomCategories = computed(() => {
    return roomTypesCtrl.roomCategories.value
})

const newRoom = ref(false)
const roomName = ref('')
const roomDescription = ref('')
const roomCategory = ref('')

const editRoom = ref(null)
const editRoomName = ref('')
const editRoomDescription = ref('')
const editRoomCategory = ref('')

const startEditRoom = (room) => {
    editRoom.value = room
    editRoomName.value = room.name
    editRoomDescription.value = room.description
    editRoomCategory.value = room.room_category_name
}

const createRoom = async () => {
    if (!roomName.value) {
        toastCtrl.add('Name is required', 'error')
        return
    }
    if (!roomDescription.value) {
        toastCtrl.add('Description is required', 'error')
        return
    }

    try {
        await roomCtrl.create({ name: roomName.value, description: roomDescription.value, room_category_name: roomCategory.value })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }
    roomName.value = ''
    roomDescription.value = ''

    toastCtrl.add('Room created', 'success')

    newRoom.value = false
    roomSelector.fetchRooms()
}

const updateRoom = async () => {
    if (!editRoomName.value) {
        toastCtrl.add('Name is required', 'error')
        return
    }
    if (!editRoomDescription.value) {
        toastCtrl.add('Description is required', 'error')
        return
    }

    try {
        await roomCtrl.update(editRoom.value.uuid, { name: editRoomName.value, description: editRoomDescription.value, room_category_name: editRoomCategory.value })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    toastCtrl.add('Room updated', 'success')

    editRoom.value = null
    roomSelector.fetchRooms()
}

const deleteRoom = async (room) => {
    try {
        await roomCtrl.delete(room.uuid)
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }
    const { data } = await roomCtrl.findAll()
    rooms.value = data

    toastCtrl.add('Room deleted', 'success')
}

const showRoom = async (room) => {
    await roomSelector.setRoom(room)
}


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

const logout = async () => {
    userCtrl.logout()
    router.push({ name: 'login' })
}

onMounted(async () => {
    await roomSelector.fetchRooms()
    if (rooms.value.length > 0) {
        showRoom(rooms.value[0])
    }
})
</script>

<template>
    <div>
        <div v-if="newRoom" style="z-index:3;"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        New Room
                    </h3>

                    <p class="text-md">
                        Time to create a new room and invite your friends to join the fun.
                    </p>
                </div>

                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-2">
                    <div>
                        <label for="name" class="block">Name</label>
                        <small class="mb-1 block">
                            Used to identify the room.
                        </small>
                        <input v-model="roomName" placeholder="Name"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="description" class="block">Description</label>
                        <small class="mb-1 block">
                            Describe the room to help users understand its purpose.
                        </small>
                        <textarea v-model="roomDescription" placeholder="Description"
                            class="w-full p-2 border border-gray-300 rounded-md text-black h-24" />
                    </div>

                    <div>
                        <label for="channelType" class="block">Category</label>
                        <small class="mb-1 block">
                            Used for organizing rooms.
                        </small>
                        <select v-model="roomCategory" class="w-full p-2 border border-gray-300 rounded-md text-black">
                            <option v-for="category in roomCategories" :key="category.name" :value="category.name">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <button @click="createRoom()"
                        class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                        Create Room
                    </button>
                    <button @click="newRoom = null" class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div v-if="editRoom" style="z-index:3;"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        Edit Room
                    </h3>

                    <p class="text-md">
                        Give your room a new look and feel by updating its details.
                    </p>
                </div>

                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-2">
                    <div>
                        <label for="name" class="font-bold block">Name</label>
                        <small class="mb-1 block">
                            Used to identify the room.
                        </small>
                        <input v-model="editRoomName" placeholder="name"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="description" class="font-bold block">Description</label>
                        <small class="mb-1 block">
                            Describe the room to help users understand its purpose.
                        </small>
                        <textarea v-model="editRoomDescription" placeholder="description"
                            class="w-full p-2 border border-gray-300 rounded-md text-black h-24" />
                    </div>

                    <div>
                        <label for="channelType" class="font-bold block">Category</label>
                        <small class="mb-1 block">
                            Used for organizing rooms.
                        </small>
                        <select v-model="editRoomCategory" placeholder="category"
                            class="w-full text-black p-2 border border-gray-300 rounded-md">
                            <option v-for="category in roomCategories" :key="category.name" :value="category.name">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <button @click="updateRoom()"
                        class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                        Update Room
                    </button>
                    <button @click="editRoom = null" class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div class="w-64 border-r border-gray-800">

            <div class="bg-black h-screen overflow-hidden">

                <div class="border-b border-gray-800 h-20 p-3 overflow-hidden">
                    <div v-if="room" class="">
                        <div class="flex items-center gap-2 mb-1">
                            <RoomIcon :roomCategory="room.room_category_name" class="w-3 h-3" />
                            <h2 class="text-xs font-bold text-white mb-1 overflow-hidden truncate ...">
                                {{ room.name }}
                            </h2>
                        </div>

                        <div class="flex gap-2">
                            <button @click="roomSelector.toggleDisplayLinks()" v-if="isAdmin"
                                class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12" viewBox="0 0 640 512">
                                    <path
                                        d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" />
                                </svg>
                            </button>

                            <button @click="startEditRoom(room)" v-if="isAdmin"
                                class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12" viewBox="0 0 512 512">
                                    <path
                                        d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
                                </svg>
                            </button>

                            <button @click="deleteRoom(room)" v-if="isAdmin"
                                class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11" viewBox="0 0 448 512">
                                    <path
                                        d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                                </svg>
                            </button>

                            <button @click="leaveRoom(room)" v-if="!isAdmin"
                                class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11" viewBox="0 0 576 512">
                                    <path
                                        d="M320 32c0-9.9-4.5-19.2-12.3-25.2S289.8-1.4 280.2 1l-179.9 45C79 51.3 64 70.5 64 92.5L64 448l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 192 0 32 0 0-32 0-448zM256 256c0 17.7-10.7 32-24 32s-24-14.3-24-32s10.7-32 24-32s24 14.3 24 32zm96-128l96 0 0 352c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-320c0-35.3-28.7-64-64-64l-96 0 0 64z" />
                                </svg>
                            </button>

                            <button @click="logout()"
                                class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                Logout
                            </button>
                        </div>
                    </div>
                    <div v-else class="overflow-hidden">
                        <h2 class="text-xs font-bold text-white mb-1">
                            No Room Selected
                        </h2>

                        <button @click="logout()"
                            class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            Logout
                        </button>
                    </div>
                </div>

                <div class="overflow-hidden">
                    <div class="p-3">
                        <button @click="newRoom = true"
                            class="shadow-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none mb-3 px-3 rounded-md font-bold text-white text-xs w-full p-1 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center">
                            New Room
                        </button>

                        <ul class="flex flex-col gap-3">
                            <li v-for="room in rooms" :key="room.uuid">
                                <button @click="showRoom(room)" :title="room.description"
                                    class="shadow-md bg-indigo-700 hover:bg-slate-500 focus:outline-none rounded-md overflow-hidden w-full h-12 flex items-center justify-start gap-2 p-3"
                                    :class="{ 'bg-slate-500': room && roomSelector.room.value && room.uuid === roomSelector.room.value.uuid }">
                                    <div>
                                        <RoomIcon :roomCategory="room.room_category_name" class="w-5 h-5" />
                                    </div>

                                    <div
                                        class="p-3 font-bold text-white text-xs text-center overflow-hidden text-ellipsis">
                                        {{ room.name }}
                                    </div>
                                </button>
                            </li>
                        </ul>
                        <li v-if="rooms && rooms.length === 0"
                            class="text-xs shadow-md bg-red-500 focus:outline-none rounded-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                            <div class="flex items-center justify-start gap-3 w-full">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                                    <path
                                        d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                                </svg>

                                No Rooms Yet... Boo!
                            </div>
                            <div>
                                Looks like our friendly ghost will keep haunting this space until you create some rooms.
                                Don’t worry, you’ve got the magic to make it cozy and lively!
                            </div>
                        </li>

                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
