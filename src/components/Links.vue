<script setup>
import { useToast } from '@/composables/useToast.js'
import { useRoom } from '@/composables/useRoom.js'
import { useRoomSelector } from '@/composables/useRoomSelector.js'
import { useChannelSelector } from '@/composables/useChannelSelector.js'
import { useUser } from '@/composables/useUser.js'
import { ref, computed, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const roomSelector = useRoomSelector()
const channelSelector = useChannelSelector()

const inviteLinks = computed(() => {
    return roomSelector.inviteLinks.value
})
const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})
</script>

<template>
    <div class="fixed bottom-0 top-0 shadow-lg bg-slate-800 px-8 py-6" style="right: 8.55em; width: 8.55em;">
        <div class="absolute bottom-3 top-3 left-4 right-0 overflow-hidden hover:overflow-y-scroll">
            <div class="p-3">
                <button @click="leaveRoom()" v-if="isAdmin"
                    class="shadow-md bg-green-400 px-3 mb-3 rounded-md font-bold text-white text-xs w-20 h-20 flex items-center justify-center text-ellipsis overflow-hidden break-words text-center hover:bg-green-500">
                    Create Invite Link
                </button>

                <ul class="flex flex-col gap-3">
                    <li v-for="inviteLink in inviteLinks" :key="inviteLink.uuid">
                        <div
                            class="shadow-md bg-slate-700 rounded-md hover:bg-slate-500 overflow-hidden w-20 h-20 flex items-center justify-center">
                            <div class="p-3 font-bold text-white text-xs text-center overflow-hidden text-ellipsis">
                                <button @click="copyLink(inviteLink)">
                                    Expires At: {{ inviteLink.expires_at }}
                                </button>
                            </div>
                        </div>
                        
                        <button @click="startEditLink(inviteLink)" v-if="isAdmin"
                                class="p-2 m-2 bg-blue-500 text-white">
                                Edit
                            </button>
                            <button @click="deleteLink(inviteLink)" v-if="isAdmin"
                                class="p-2 m-2 bg-blue-500 text-white">
                                Delete
                            </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
