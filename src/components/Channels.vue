<script setup>
import { useChannelSelector } from '@/composables/useChannelSelector.js'
import { useChannelTypes } from '@/composables/useChannelTypes.js'
import { useRoomSelector } from '@/composables/useRoomSelector.js'
import { useChannel } from '@/composables/useChannel.js'
import { useToast } from '@/composables/useToast.js'
import { useUser } from '@/composables/useUser.js'
import { ref, computed, onMounted } from 'vue'

const userCtrl = useUser()
const toastCtrl = useToast()
const channelCtrl = useChannel()
const channelSelector = useChannelSelector()
const roomSelector = useRoomSelector()
const channelTypesCtrl = useChannelTypes()

const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

const showChannel = async (channel) => {
    await channelSelector.setChannel(channel)
}

const channels = computed(() => {
    return channelSelector.channels.value
})

const channel = computed(() => {
    return channelSelector.channel.value
})

const channelTypes = computed(() => {
    return channelTypesCtrl.channelTypes.value
})

const newChannel = ref(false)
const channelName = ref('')
const channelDescription = ref('')
const channelType = ref('')

const editChannel = ref(null)
const editChannelName = ref('')
const editChannelDescription = ref('')
const editChannelType = ref('')

const startNewChannel = () => {
    newChannel.value = true
}

const startEditChannel = (channel) => {
    editChannel.value = channel
    editChannelName.value = channel.name
    editChannelDescription.value = channel.description
    editChannelType.value = channel.channel_type_name
}

const createChannel = async () => {
    if (!channelName.value) {
        toastCtrl.add('Name is required', 'error')
        return
    }
    if (!channelDescription.value) {
        toastCtrl.add('Description is required', 'error')
        return
    }
    if (!channelType.value) {
        toastCtrl.add('Type is required', 'error')
        return
    }

    try {
        await channelCtrl.create({
            name: channelName.value,
            description: channelDescription.value,
            channel_type_name: channelType.value,
            room_uuid: roomSelector.room.value.uuid
        })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }
    channelName.value = ''
    channelDescription.value = ''
    channelType.value = ''
    newChannel.value = false

    toastCtrl.add('Channel created', 'success')
    channelSelector.reinit()
}

const updateChannel = async () => {
    if (!editChannelName.value) {
        toastCtrl.add('Name is required', 'error')
        return
    }
    if (!editChannelDescription.value) {
        toastCtrl.add('Description is required', 'error')
        return
    }
    if (!editChannelType.value) {
        toastCtrl.add('Type is required', 'error')
        return
    }

    try {
        await channelCtrl.update(editChannel.value.uuid, {
            name: editChannelName.value,
            description: editChannelDescription.value,
            channel_type_name: editChannelType.value,
            room_uuid: roomSelector.room.value.uuid
        })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    editChannel.value = null
    editChannelName.value = ''
    editChannelDescription.value = ''
    editChannelType.value = ''

    toastCtrl.add('Channel updated', 'success')
    channelSelector.reinit()
}

const deleteChannel = async (channel) => {
    try {
        await channelCtrl.delete(channel.uuid)
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    toastCtrl.add('Channel deleted', 'success')
    channelSelector.reinit()
}

</script>

<template>
    <div class="fixed bottom-0 top-0 shadow-lg px-6 pt-6 bg-slate-600" style="left: 8.55em; width: 8em;">

        <div v-if="newChannel && isAdmin"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-4 rounded-lg">
                <h3 class="text-3xl font-bold mb-3">
                    New Channel
                </h3>

                <div class="mb-3 flex flex-col gap-2">
                    <label for="name" class="block">Name</label>
                    <input v-model="channelName" placeholder="Name" class="w-full p-2 border border-gray-300" />

                    <label for="description" class="block">Description</label>
                    <input v-model="channelDescription" placeholder="Description"
                        class="w-full p-2 border border-gray-300" />

                    <label for="channelType" class="block">Type</label>
                    <select v-model="channelType" class="w-full p-2 border border-gray-300">
                        <option v-for="channelType in channelTypes" :key="channelType.name" :value="channelType.name">
                            {{ channelType.name }}
                        </option>
                    </select>
                </div>
                <button @click="createChannel()" class="p-2 mr-2 bg-blue-500 text-white">
                    Create Channel
                </button>
                <button @click="newChannel = false" class="p-2 bg-blue-500 text-white">
                    Cancel
                </button>
            </div>
        </div>

        <div v-if="editChannel && isAdmin"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-4 rounded-lg">
                <h3 class="text-3xl font-bold mb-3">
                    Edit Channel
                </h3>

                <div class="mb-3 flex flex-col gap-2">
                    <label for="name" class="block">Name</label>
                    <input v-model="editChannelName" :placeholder="editChannel.name"
                        class="w-full p-2 border border-gray-300" />

                    <label for="description" class="block">Description</label>
                    <textarea v-model="editChannelDescription" :placeholder="editChannel.description"
                        class="w-full p-2 border border-gray-300" />

                    <label for="channelType" class="block">Type</label>
                    <select v-model="editChannelType" class="w-full text-black p-2 border border-gray-300">
                        <option v-for="channelType in channelTypes" :key="channelType.name" :value="channelType.name">
                            {{ channelType.name }}
                        </option>
                    </select>
                </div>

                <button @click="updateChannel()" class="p-2 mr-2 bg-blue-500 text-white">
                    Update Channel
                </button>
                <button @click="editChannel = null" class="p-2 bg-blue-500 text-white">
                    Cancel
                </button>
            </div>
        </div>

        <div v-if="channel" class="absolute bottom-3 left-6 right-3 overflow-hidden" style="width:8em; height:4.5em;">
            <h2 class="text-xs font-bold text-white mb-1 overflow-hidden truncate ...">
                {{ channel.name }}
            </h2>

            <p class="text-xs font-bold text-white mb-1">
                {{ channel.channel_type_name }}
            </p>

            <button @click="deleteChannel(channel)" v-if="isAdmin" class="text-xs p-1 mr-1 bg-blue-500 text-white">
                Delete
            </button>

            <button @click="startEditChannel(channel)" v-if="isAdmin" class="text-xs p-1 bg-blue-500 text-white">
                Edit
            </button>
        </div>
        <div v-else class="absolute bottom-3 left-3 overflow-hidden" style="width:8em; height:4.5em;">
            <h2 class="text-xs font-bold text-white break-words w-24">
                No Channel Selected
            </h2>
        </div>

        <div class="absolute bottom-24 top-0 left-0 right-0 overflow-hidden hover:overflow-y-scroll">
            <div class="px-6 py-6">

                <button @click="startNewChannel" v-if="isAdmin"
                    class="shadow-md bg-green-400 mb-3 px-3 rounded-md font-bold text-white text-xs w-20 h-20 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center hover:bg-green-500">
                    New Channel
                </button>

                <ul class="flex flex-col gap-3">

                    <li v-for="channel in channels" :key="channel.uuid">
                        <button @click="showChannel(channel)"
                            class="shadow-md bg-slate-700 rounded-md hover:bg-slate-500 overflow-hidden w-20 h-20 flex items-center justify-center"
                            :class="{ 'bg-slate-500': channel && channelSelector.channel.value && channel.uuid === channelSelector.channel.value.uuid }">
                            <div class="p-3 font-bold text-white text-xs text-center overflow-hidden text-ellipsis">
                                {{ channel.name }}
                            </div>
                        </button>
                    </li>

                    <li v-if="channels.length === 0"
                        class="text-white text-center bg-slate-800 p-2 rounded-md shadow-md w-20 h-20 text-xs flex items-center justify-center">
                        No channels found
                    </li>
                </ul>

            </div>
        </div>
    </div>
</template>
