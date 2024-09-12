<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useRoomSelector } from '@/composables/useRoomSelector'
import { useChannelSelector } from '@/composables/useChannelSelector'
import { useChannel } from '@/composables/useChannel'
import { ref, computed } from 'vue'
import type ChannelWebhook from '@/models/channel_webhook'
import type Channel from '@/models/channel'

const API_URL = import.meta.env.VITE_API_URL
const toastCtrl = useToast()
const roomSelector = useRoomSelector()
const channelSelector = useChannelSelector()
const channelCtrl = useChannel()

const testWebhook = ref(null as ChannelWebhook | null)
const testMessage = ref('')
const testResponse = ref('')

const channelUuid = ref('')
const editWebhook = ref(null as ChannelWebhook | null)
const editWebhookchannelUuid = ref('')

const webhooks = computed(() => {
    return roomSelector.webhooks.value
})

const channels = computed(() => {
    return channelSelector.channels.value
})

const displayWebhooks = computed(() => {
    return roomSelector.displayWebhooks.value
})

const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

const startEditWebhook = (webhook: ChannelWebhook): void => {
    editWebhook.value = webhook
    editWebhookchannelUuid.value = webhook.channel_uuid
    testWebhook.value = null
}

const updateWebhook = async (): Promise<void> => {
    if (!editWebhookchannelUuid.value) {
        return toastCtrl.add('Channel is required', 'error')
    }
    if (!editWebhook.value) {
        return toastCtrl.add('Webhook is required', 'error')
    }

    try {
        await channelCtrl.webhooks.update(editWebhook.value.uuid, {
            channel_uuid: editWebhookchannelUuid.value
        })
    } catch (error: any) {
        toastCtrl.add(error.message, 'error')
        return
    }

    editWebhook.value = null
    roomSelector.reinitWebhooks();
    toastCtrl.add('Webhook updated', 'success')
}

const createWebhook = async (): Promise<void> => {
    if (!channelUuid.value) {
        return toastCtrl.add('Channel is required', 'error')
    }

    const channel_uuid = channelUuid.value
    try {
        await channelCtrl.webhooks.create({ channel_uuid })
    } catch (error: any) {
        toastCtrl.add(error.message, 'error')
        return
    }

    editWebhookchannelUuid.value = ''
    roomSelector.reinitWebhooks();
    toastCtrl.add('Webhook created', 'success')
}

const deleteWebhook = async (webhook: ChannelWebhook): Promise<void> => {
    try {
        await channelCtrl.webhooks.delete(webhook.uuid)
    } catch (error: any) {
        toastCtrl.add(error.message, 'error')
        return
    }

    roomSelector.reinitWebhooks();
    toastCtrl.add('Webhook deleted', 'success')
}

const startTestWebhook = (webhook: ChannelWebhook): void => {
    testWebhook.value = webhook
    editWebhook.value = null
}

const executeTest = async (): Promise<void> => {
    if (!testMessage.value) {
        return toastCtrl.add('Message is required', 'error')
    }
    if (!testWebhook.value) {
        return toastCtrl.add('Webhook is required', 'error')
    }

    try {
        const response = await channelCtrl.webhooks.event(
            testWebhook.value.uuid, { message: testMessage.value })
        testResponse.value = response
    } catch (error: any) {
        toastCtrl.add(error.message, 'error')
        return
    }

    toastCtrl.add('Webhook test sent', 'success')
}

const getLink = (webhook: ChannelWebhook): string => {
    const url = `${API_URL}/channel_webhook/${webhook.uuid}`
    return url
}

const copyLink = (webhook: ChannelWebhook): void => {
    const url = getLink(webhook)

    navigator.clipboard.writeText(url)
    toastCtrl.add('Webhook URL copied', 'success')
}

const getChannel = (channelUuid: string): Channel | undefined => {
    return channels.value.find((channel: Channel) => channel.uuid === channelUuid)
}

</script>

<template>
    <div v-if="displayWebhooks === true" style="z-index:2;"
        class="fixed top-0 left-0 bottom-0 right-0 p-3 bg-gray-800 bg-opacity-50 flex justify-center overflow-y-auto">
        <div class="w-96">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        Room Webhooks
                    </h3>

                    <p class="text-md">
                        Use webhook URLs to send messages to channels from external services.
                    </p>

                    <small class="text-xs">
                        Do not share webhook URLs with untrusted sources.
                    </small>
                </div>


                <div class=" mb-3">
                    <div v-if="isAdmin">
                        <div v-if="!editWebhook && !testWebhook" class="flex gap-1">
                            <select v-model="channelUuid"
                                class="w-full text-black rounded-md p-2 border border-gray-300">
                                <option value="">Select Channel</option>
                                <option v-for="channel in channels" :key="channel.uuid" :value="channel.uuid">
                                    {{ channel.name }}
                                </option>
                            </select>
                            <button @click="createWebhook()"
                                class="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                                Create Webhook
                            </button>
                        </div>
                        <div v-else-if="editWebhook && !testWebhook" class="flex gap-1">
                            <select v-model="editWebhookchannelUuid"
                                class="w-full text-black rounded-md p-2 border border-gray-300">
                                <option value="">Select Channel</option>
                                <option v-for="channel in channels" :key="channel.uuid" :value="channel.uuid">
                                    {{ channel.name }}
                                </option>
                            </select>
                            <button @click="updateWebhook()"
                                class="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                                Update Webhook
                            </button>

                            <button @click="editWebhook = null"
                                class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mb-3" v-if="testWebhook">
                    <div class="flex gap-1">
                        <input v-model="testMessage" class="w-full text-black rounded-md p-2 border border-gray-300"
                            placeholder="Message" />

                        <button @click="executeTest()"
                            class="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                            Test
                        </button>
                        <button @click="testWebhook = null"
                            class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                            Close
                        </button>
                    </div>
                </div>


                <ul class="flex flex-col gap-3 mb-3">
                    <li v-for="webhook in webhooks" :key="webhook.uuid">
                        <div class="text-white w-full shadow-md bg-slate-700 rounded-md p-3">
                            <div class="flex flex-col gap-2 items-start justify-start pb-3">
                                <div>
                                    <div class="font-bold w-full text-xs">
                                        <a :href="getLink(webhook)" target="_blank"
                                            class="text-indigo-200 hover:underline">
                                            {{ getLink(webhook) }}
                                        </a>
                                    </div>
                                </div>

                                <div class="w-full text-xs">
                                    Channel: {{ getChannel(webhook.channel_uuid)?.name }}
                                </div>

                                <div class="w-full text-xs mb-1 bg-slate-500 p-3 rounded-md">
                                    curl -X POST
                                    {{ getLink(webhook) }} 
                                    -H "Content-Type: application/json" 
                                    -d '{"message": "{{ testMessage || "Hello World!" }}"}'

                                </div>

                                <div class="flex gap-1">

                                    <button @click="copyLink(webhook)"
                                        class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12"
                                            viewBox="0 0 448 512">
                                            <path
                                                d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z" />
                                        </svg>
                                    </button>

                                    <button @click="startEditWebhook(webhook)" v-if="isAdmin"
                                        class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12"
                                            viewBox="0 0 512 512">
                                            <path
                                                d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
                                        </svg>
                                    </button>

                                    <button @click="startTestWebhook(webhook)" v-if="isAdmin"
                                        class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11"
                                            viewBox="0 0 512 512">
                                            <path
                                                d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
                                        </svg>
                                    </button>

                                    <button @click="deleteWebhook(webhook)" v-if="isAdmin"
                                        class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11"
                                            viewBox="0 0 448 512">
                                            <path
                                                d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li v-if="webhooks.length === 0">
                        <div class="text-white w-full shadow-md bg-slate-700 rounded-md p-3">
                            <div class="overflow-hidden h-20 flex gap-1 items-center justify-center">
                                <div class="font-bold w-full text-center text-lg">
                                    No webhook URLs
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>

                <button @click="roomSelector.toggleDisplayWebhooks()"
                    class="w-full p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
