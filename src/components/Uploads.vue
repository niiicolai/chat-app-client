<template>
    <div v-if="display" style="z-index:3;"
        class="fixed top-0 left-0 bottom-0 right-0 p-3 bg-gray-800 bg-opacity-50 flex justify-center overflow-y-auto">
        <div class="w-96">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        Room Uploads
                    </h3>

                    <p class="text-md">
                        Manage all uploads in this room.
                    </p>
                </div>

                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-3"
                    v-if="messageUploads && messageUploads.length > 0">
                    <div v-for="upload in messageUploads" :key="upload.uuid" class="bg-slate-800 mb-3 p-3">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                                    <img :src="upload.message.user.avatar_src" class="w-8 h-8 rounded-full" />
                                </div>
                                <div class="flex gap-3 justify-between items-center w-full">
                                    <div class="flex gap-3">
                                        <div class="text-xs">
                                            Size: {{ (upload.size / 1000000).toFixed(2) }} MB
                                        </div>

                                        <div class="text-xs">
                                            {{ new Date(upload.created_at).toLocaleString() }}
                                        </div>
                                    </div>

                                    <button @click="deleteUpload(upload.uuid)" v-if="isAdmin"
                                        class="p-2 bg-red-500 hover:bg-red-600 rounded-md text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11"
                                            viewBox="0 0 448 512">
                                            <path
                                                d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1 mb-2">
                                <div class="text-xs">
                                    {{ upload.message.user.username }}:
                                </div>

                                <div class="text-xs">
                                    Message: {{ upload.message.body }}
                                </div>


                            </div>
                        </div>

                        <MessageUpload :messageUpload="upload" />
                    </div>
                </div>

                <div>
                    <button @click="() => close()"
                        class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import MessageUpload from '@/components/MessageUpload.vue'
import { useRoomSelector } from '@/composables/useRoomSelector'
import { useToast } from '@/composables/useToast'
import { useChannel } from '@/composables/useChannel'
import { computed } from 'vue'

const props = defineProps({
    display: {
        type: Boolean,
        required: false
    },
    close: {
        type: Function,
        required: false,
        default: () => { }
    }
})

const toastCtrl = useToast()
const channelCtrl = useChannel()
const roomSelector = useRoomSelector()

const messageUploads = computed(() => {
    return roomSelector.messageUploads.value
})

const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

const deleteUpload = async (uuid: string) => {
    try {
        await channelCtrl.messageUploads.delete(uuid)
    } catch (error: any) {
        toastCtrl.add(error.message, 'error')
        return
    }

    await roomSelector.reinitMessageUploads()
    toastCtrl.add('Upload deleted', 'success')
}
</script>