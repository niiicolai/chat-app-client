<script setup>
import Scroll from '@/components/Scroll.vue'

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
    <div>
        <div v-if="newChannel && isAdmin" style="z-index:3;"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        New Channel
                    </h3>

                    <p class="text-md">
                        Channels are used to organize the room.
                    </p>
                </div>

                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-2">
                    <div>
                        <label for="name" class="block">Name</label>
                        <small class="mb-1 block">
                            Used to identify the channel.
                        </small>
                        <input v-model="channelName" placeholder="Name"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="description" class="block">Description</label>
                        <small class="mb-1 block">
                            Describe the purpose of the channel.
                        </small>
                        <textarea v-model="channelDescription" placeholder="Description"
                            class="w-full p-2 border border-gray-300 rounded-md text-black h-24" />
                    </div>

                    <div>
                        <label for="channelType" class="block">Type</label>
                        <small class="mb-1 block">
                            Select the type of channel.
                        </small>
                        <select v-model="channelType" class="w-full p-2 border border-gray-300 rounded-md text-black">
                            <option v-for="channelType in channelTypes" :key="channelType.name"
                                :value="channelType.name">
                                {{ channelType.name }}
                            </option>
                        </select>
                    </div>

                </div>

                <div>
                    <button @click="createChannel()"
                        class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                        Create Channel
                    </button>
                    <button @click="newChannel = null"
                        class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div v-if="editChannel && isAdmin" style="z-index:3;"
            class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        Edit Channel
                    </h3>

                    <p class="text-md">
                        Update the channel details.
                    </p>
                </div>

                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-2">
                    <div>
                        <label for="name" class="block">Name</label>
                        <small class="mb-1 block">
                            Used to identify the channel.
                        </small>
                        <input v-model="editChannelName" :placeholder="editChannel.name"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="description" class="block">Description</label>
                        <small class="mb-1 block">
                            Describe the purpose of the channel.
                        </small>
                        <textarea v-model="editChannelDescription" :placeholder="editChannel.description"
                            class="w-full p-2 border border-gray-300 rounded-md text-black h-24" />
                    </div>

                    <div>
                        <label for="channelType" class="block">Type</label>
                        <small class="mb-1 block">
                            Select the type of channel.
                        </small>
                        <select v-model="editChannelType"
                            class="w-full p-2 border border-gray-300 rounded-md text-black">
                            <option v-for="channelType in channelTypes" :key="channelType.name"
                                :value="channelType.name">
                                {{ channelType.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <button @click="updateChannel()"
                        class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                        Update Channel
                    </button>
                    <button @click="editChannel = null"
                        class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div class="shadow-lg bg-black border-r border-gray-800  h-screen text-white w-64">
            <div class="border-b border-gray-800 h-20 p-3 overflow-hidden">
                <div v-if="channel" class="">
                    <div class="flex items-center gap-2 mb-1">
                        <div v-if="channel.channel_type_name === 'Text'" class="mb-1">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" fill="white" viewBox="0 0 448 512">
                                <path
                                    d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128l95.1 0 11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128l58.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-68.9 0L325.8 320l58.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-68.9 0-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7-95.1 0-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384 32 384c-17.7 0-32-14.3-32-32s14.3-32 32-32l68.9 0 21.3-128L64 192c-17.7 0-32-14.3-32-32s14.3-32 32-32l68.9 0 11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320l95.1 0 21.3-128-95.1 0z" />
                            </svg>
                        </div>
                        <div v-if="channel.channel_type_name === 'Voice'" class="mb-1">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" fill="white" viewBox="0 0 384 512">
                                <path
                                    d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" />
                            </svg>
                        </div>
                        <div v-if="channel.channel_type_name === 'Video'" class="mb-1">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" fill="white" viewBox="0 0 576 512">
                                <path
                                    d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
                            </svg>
                        </div>

                        <h2 class="text-xs font-bold mb-1 overflow-hidden truncate ...">
                            {{ channel.name }}
                        </h2>
                    </div>

                    <div class="flex gap-2">
                        <button @click="startEditChannel(channel)" v-if="isAdmin"
                            class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12" viewBox="0 0 512 512">
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
                            </svg>
                        </button>

                        <button @click="deleteChannel(channel)" v-if="isAdmin"
                            class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 text-white">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11" viewBox="0 0 448 512">
                                <path
                                    d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div v-else>
                    <h2 class="text-xs font-bold text-white break-words">
                        No Channel Selected
                    </h2>
                </div>
            </div>

            <div class="overflow-hidden">
                <div class="p-3">

                    <button @click="startNewChannel" v-if="isAdmin"
                        class="shadow-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none mb-3 px-3 rounded-md font-bold text-white text-xs w-full p-1 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center">
                        New Channel
                    </button>

                    <ul class="flex flex-col gap-3">

                        <li v-for="channel in channels" :key="channel.uuid">
                            <button @click="showChannel(channel)"
                                class="shadow-md bg-indigo-700 hover:bg-slate-500 focus:outline-none rounded-md overflow-hidden w-full h-12 flex items-center justify-start gap-2 p-3"
                                :class="{ 'bg-slate-500': channel && channelSelector.channel.value && channel.uuid === channelSelector.channel.value.uuid }">

                                <div v-if="channel.channel_type_name === 'Text'" class="">
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" fill="white"
                                        viewBox="0 0 448 512">
                                        <path
                                            d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128l95.1 0 11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128l58.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-68.9 0L325.8 320l58.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-68.9 0-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7-95.1 0-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384 32 384c-17.7 0-32-14.3-32-32s14.3-32 32-32l68.9 0 21.3-128L64 192c-17.7 0-32-14.3-32-32s14.3-32 32-32l68.9 0 11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320l95.1 0 21.3-128-95.1 0z" />
                                    </svg>
                                </div>
                                <div v-if="channel.channel_type_name === 'Voice'" class="">
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" fill="white"
                                        viewBox="0 0 384 512">
                                        <path
                                            d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" />
                                    </svg>
                                </div>
                                <div v-if="channel.channel_type_name === 'Video'" class="">
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" fill="white"
                                        viewBox="0 0 576 512">
                                        <path
                                            d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
                                    </svg>
                                </div>

                                <div class="font-bold text-white text-xs text-left overflow-hidden truncate ...">
                                    {{ channel.name }}
                                </div>
                            </button>
                        </li>

                        <li v-if="channels.length === 0"
                            class="text-xs shadow-md bg-red-500 focus:outline-none rounded-md overflow-hidden w-full flex flex-col items-start justify-center gap-1 p-3">
                            <div class="flex items-center justify-start gap-3 w-full">
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                                    <path
                                        d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                                </svg>

                                No Channels Here... Boo!
                            </div>
                            <div>
                                The silence is giving our mischievous ghost a chance to linger. Create some channels to
                                fill the space and send that ghost packing!
                            </div>
                        </li>
                    </ul>

                </div>
            </div>

        </div>
    </div>
</template>
