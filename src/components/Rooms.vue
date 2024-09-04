<script setup>
import { useToast } from '@/composables/useToast.js'
import { useRoom } from '@/composables/useRoom.js'
import { useRoomSelector } from '@/composables/useRoomSelector.js'
import { useRoomTypes } from '@/composables/useRoomTypes.js'
import { ref, computed, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const roomSelector = useRoomSelector()
const roomTypesCtrl = useRoomTypes()

const rooms = computed(() => {
    return roomSelector.rooms.value
})

const room = computed(() => {
    return roomSelector.room.value
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

onMounted(async () => {
    await roomSelector.fetchRooms()
    if (rooms.value.length > 0) {
        showRoom(rooms.value[0])
    }
})
</script>

<template>
    <div class="fixed left-0 bottom-0 top-0 shadow-lg" style="width: 8.55em;">

        <div v-if="newRoom"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-4 rounded-lg">
                <h3 class="text-3xl font-bold mb-3">
                    New Room
                </h3>

                <div class="mb-3 flex flex-col gap-2">
                    <label for="name" class="block">Name</label>
                    <input v-model="roomName" placeholder="Name" class="w-full p-2 border border-gray-300" />

                    <label for="description" class="block">Description</label>
                    <input v-model="roomDescription" placeholder="Description"
                        class="w-full p-2 border border-gray-300" />

                    <label for="channelType" class="block">Type</label>
                    <select v-model="roomCategory" class="w-full p-2 border border-gray-300">
                        <option v-for="category in roomCategories" :key="category.name" :value="category.name">
                            {{ category.name }}
                        </option>
                    </select>
                </div>
                <button @click="createRoom()" class="p-2 mr-2 bg-blue-500 text-white">
                    Create Room
                </button>
                <button @click="newRoom = false" class="p-2 bg-blue-500 text-white">
                    Cancel
                </button>
            </div>
        </div>

        <div v-if="editRoom"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-4 rounded-lg">
                <h3 class="text-3xl font-bold mb-3">
                    Edit Room
                </h3>

                <div class="mb-3 flex flex-col gap-2">
                    <label for="name" class="block">Name</label>
                    <input v-model="editRoomName" placeholder="name" class="w-full p-2 border border-gray-300" />

                    <label for="description" class="block">Description</label>
                    <textarea v-model="editRoomDescription" placeholder="description"
                        class="w-full p-2 border border-gray-300" />

                    <label for="channelType" class="block">Type</label>
                    <select v-model="editRoomCategory" placeholder="category"
                        class="w-full text-black p-2 border border-gray-300">
                        <option v-for="category in roomCategories" :key="category.name" :value="category.name">
                            {{ category.name }}
                        </option>
                    </select>
                </div>

                <button @click="updateRoom()" class="p-2 mr-2 bg-blue-500 text-white">
                    Update Room
                </button>
                <button @click="editRoom = null" class="p-2 bg-blue-500 text-white">
                    Cancel
                </button>
            </div>
        </div>

        <div class="bg-slate-800 h-screen overflow-hidden">
            <div v-if="room" class="absolute bottom-3 left-6 right-3 overflow-hidden" style="width:8em; height:4.5em;">
                <h2 class="text-xs font-bold text-white mb-1 overflow-hidden truncate ...">
                    {{ room.name }}
                </h2>

                <p class="text-xs font-bold text-white mb-1">
                    {{ room.room_category_name }}
                </p>

                <button @click="deleteRoom(room)" v-if="isAdmin" class="text-xs p-1 mr-1 bg-blue-500 text-white">
                    Delete
                </button>

                <button @click="startEditRoom(room)" v-if="isAdmin" class="text-xs p-1 bg-blue-500 text-white">
                    Edit
                </button>
            </div>
            <div v-else class="absolute bottom-3 left-3 overflow-hidden" style="width:8em; height:4.5em;">
                <h2 class="text-xs font-bold text-white">
                    No Room Selected
                </h2>
            </div>

            <div class="absolute bottom-24 top-3 left-4 right-0 overflow-hidden hover:overflow-y-scroll">
                <div class="p-3">
                    <button @click="newRoom = true"
                        class="shadow-md bg-green-400 px-3 mb-3 rounded-md font-bold text-white text-xs w-20 h-20 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center hover:bg-green-500">
                        New Room
                    </button>

                    <ul class="flex flex-col gap-3">
                        <li v-for="room in rooms" :key="room.uuid">
                            <button @click="showRoom(room)" :title="room.description"
                                class="shadow-md bg-slate-700 rounded-md hover:bg-slate-500 overflow-hidden w-20 h-20 flex items-center justify-center"
                                :class="{ 'bg-slate-500': room && roomSelector.room.value && room.uuid === roomSelector.room.value.uuid }">
                                <div class="p-3 font-bold text-white text-xs text-center overflow-hidden text-ellipsis">
                                    {{ room.name }}
                                </div>
                            </button>
                        </li>
                    </ul>
                    <li v-if="rooms && rooms.length === 0"
                        class="text-white text-center bg-slate-800 p-2 rounded-md shadow-md w-20 h-20 text-xs flex items-center justify-center">
                        No rooms found
                    </li>
                   
                </div>
            </div>
        </div>
    </div>
</template>
