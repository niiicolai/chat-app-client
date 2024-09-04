<script setup>
import { useToast } from '@/composables/useToast.js'
import { useChannel } from '@/composables/useChannel.js'
import { useChannelSelector } from '@/composables/useChannelSelector.js'
import { useUser } from '@/composables/useUser.js'
import { ref, computed } from 'vue'

const sub = useUser().getSub()
const toastCtrl = useToast()
const channelCtrl = useChannel()
const channelSelector = useChannelSelector()

const channel = computed(() => {
    return channelSelector.channel.value
})

const channelMessages = computed(() => {
    return channelSelector.channelMessages.value
})

const channelMessage = ref('')
const createChannelMessage = async (message) => {
    if (!channel.value) {
        toastCtrl.add('Select a channel', 'error')
        return
    }
    if (!channelMessage.value) {
        toastCtrl.add('Message is required', 'error')
        return
    }

    try {
        const body = channelMessage.value
        await channelCtrl.messages.create({ body, channel_uuid: channel.value.uuid })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    channelMessage.value = ''
    channelSelector.reinitChannelMessages()
}

const editChannelMessageBody = ref('')
const editChannelMessage = ref(null)
const startEditChannelMessage = (message) => {
    editChannelMessage.value = message
    editChannelMessageBody.value = message.body
}
const updateChannelMessage = async () => {
    if (!editChannelMessageBody.value) {
        toastCtrl.add('Message is required', 'error')
        return
    }

    try {
        await channelCtrl.messages.update(editChannelMessage.value.uuid, {
            body: editChannelMessageBody.value
        })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    editChannelMessageBody.value = ''
    editChannelMessage.value = null
    channelSelector.reinitChannelMessages()
}

const deleteChannelMessage = async (message) => {
    try {
        await channelCtrl.messages.delete(message.uuid)
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }
    channelSelector.reinitChannelMessages()
}
</script>

<template>
    <div class="w-full">
        <ul class="p-3 flex flex-col gap-3 justify-end absolute left-0 right-0 bottom-24 overflow-hidden bg-black" style="top:5em;">
            
            <li v-for="message in channelMessages" :key="message.uuid">
                <div class="flex items-start gap-3 w-full p-1 text-white text-sm rounded-md">
                    <div>
                        <div
                            class="text-xs rounded-full w-10 h-10 bg-indigo-700 flex items-center justify-center font-bold">
                            {{ message.user_uuid === sub ? 'You' : message.user_uuid.slice(0, 2).toUpperCase() }}
                        </div>
                    </div>
                    <div class="w-full">
                        <div class="text-indigo-700 text-xs">
                            {{ message.created_at
                                ? new Date(message.created_at).toLocaleString()
                                : 'invalid date'
                            }}
                        </div>

                        <div class="w-full">
                            {{ message.body }}
                        </div>
                    </div>
                    <div v-if="message.user_uuid === sub" class="flex items-center justify-start gap-1">
                        <button @click="startEditChannelMessage(message)"
                            class="p-2 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12" viewBox="0 0 512 512">
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
                            </svg>
                        </button>
                        <button @click="deleteChannelMessage(message)"
                            class="p-2 text-xs rounded-md bg-red-700 hover:bg-red-600 text-white">
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12" viewBox="0 0 448 512">
                                <path
                                    d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </li>
            <li v-if="channelMessages.length === 0"
                class="text-gray-500 text-xs shadow-md focus:outline-none rounded-md overflow-hidden w-full flex flex-col items-start justify-center gap-3 p-3">
                <div class="flex items-center justify-start gap-3 w-full">
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="gray" width="22" viewBox="0 0 384 512">
                        <path
                            d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                    </svg>

                    <p class="font-bold text-md">
                        No Messages Yet... Boo!
                    </p>
                </div>
                <div>
                    The ghost of silence is hanging around here. Send a message to chase away the quiet and make this space come alive!
                </div>
            </li>
        </ul>

        <div v-if="!editChannelMessage" class="fixed left-0 right-0 bottom-0 flex bg-black border-t border-gray-800">
            <textarea v-model="channelMessage" placeholder="Enter Message"
                class="w-full text-md p-6 bg-black text-white focus:outline-none" />
            <button @click="createChannelMessage()"
                class="p-6 bg-indigo-700 text-white hover:bg-indigo-600 focus:outline-none">
                Send
            </button>
        </div>
        <div v-else class="bg-black fixed left-0 right-0 bottom-0 flex bg-black border-t border-gray-800">
            <textarea v-model="editChannelMessageBody" :placeholder="editChannelMessage.body"
                class="w-full text-md p-6 bg-black text-white focus:outline-none" />
            <div class="flex">
                <button @click="updateChannelMessage()" class="p-6 bg-indigo-500 hover:bg-indigo-600 text-white">
                    Update
                </button>
                <button @click="editChannelMessage = null" class="p-6 bg-red-700 hover:bg-red-600 text-white">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
