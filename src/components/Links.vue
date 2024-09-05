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
const displayLinks = computed(() => {
    return roomSelector.displayLinks.value
})
const isAdmin = computed(() => {
    return roomSelector.hasRole('Admin')
})

const linkExpiresAt = ref('')
const editLink = ref(null)

const startEditLink = (link) => {
    editLink.value = link
}

const editLinkExpiresAt = ref('')
const updateLink = async () => {
    if (!editLinkExpiresAt.value) {
        return toastCtrl.add('Expires At is required', 'error')
    }
    if (!editLink.value) {
        return toastCtrl.add('Link is required', 'error')
    }

    try {
        await roomCtrl.inviteLinks.update(editLink.value.uuid, {
            expires_at: editLinkExpiresAt.value
        })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    editLink.value = null
    roomSelector.reinitInviteLinks();
    toastCtrl.add('Link updated', 'success')
}

const createLink = async () => {
    if (!linkExpiresAt.value) {
        return toastCtrl.add('Expires At is required', 'error')
    }

    const room_uuid = roomSelector.room.value.uuid
    const expires_at = linkExpiresAt.value
    try {
        await roomCtrl.inviteLinks.create({ room_uuid, expires_at })
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    linkExpiresAt.value = ''
    roomSelector.reinitInviteLinks();
    toastCtrl.add('Link created', 'success')
}

const deleteLink = async (link) => {
    try {
        await roomCtrl.inviteLinks.delete(link.uuid)
    } catch (error) {
        toastCtrl.add(error.message, 'error')
        return
    }

    roomSelector.reinitInviteLinks();
    toastCtrl.add('Link deleted', 'success')
}
const getLink = (link) => {
    const origin = window.location.origin
    const url = `${origin}/join_room/${link.uuid}`
    return url
}
const copyLink = (link) => {
    const url = getLink(link)

    navigator.clipboard.writeText(url)
    toastCtrl.add('Link copied', 'success')
}
</script>

<template>
    <div v-if="displayLinks === true" style="z-index:2;"
        class="fixed top-0 left-0 bottom-0 right-0 p-3 bg-gray-800 bg-opacity-50 flex justify-center overflow-y-auto">
        <div class="w-96">
            <div class="w-96 bg-black text-white p-4 rounded-md">
                <div class="border-b border-gray-800 pb-3 mb-3">
                    <h3 class="text-3xl font-bold mb-1">
                        Invite Links
                    </h3>

                    <p class="text-md">
                        Share these links with others to invite them to the room.
                    </p>
                </div>


                <div class=" mb-3">
                    <div v-if="isAdmin">
                        <div v-if="!editLink" class="flex gap-3">
                            <input v-model="linkExpiresAt" placeholder="Expires At"
                                class="w-full text-black rounded-md p-2 border border-gray-300" type="datetime-local" />

                            <button @click="createLink()"
                                class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                                Create Link
                            </button>
                        </div>
                        <div v-else>
                            <input v-model="editLinkExpiresAt" :placeholder="editLink.expires_at"
                                class="p-2 m-2 border border-gray-300" type="datetime-local" />
                            <button @click="updateLink()" class="p-2 m-2 bg-blue-500 text-white">
                                Update Link
                            </button>

                            <button @click="editLink = null" class="p-2 m-2 bg-blue-500 text-white">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>


                <ul class="flex flex-col gap-3 mb-3">
                    <li v-for="inviteLink in inviteLinks" :key="inviteLink.uuid">
                        <div class="text-white w-full shadow-md bg-slate-700 rounded-md p-3">
                            <div class="flex gap-1 items-center justify-between pb-3">
                                <div>
                                    <div class="font-bold w-full mb-1 text-xs">
                                        <a :href="getLink(inviteLink)" target="_blank" class="text-indigo-200 hover:underline">
                                            {{ getLink(inviteLink) }}
                                        </a>
                                    </div>
                                    <div class="w-full text-xs">
                                        Expires At: {{ new Date(inviteLink.expires_at).toLocaleString() }}
                                    </div>
                                </div>

                                <div class="flex gap-1">

                                    <button @click="copyLink(inviteLink)"
                                        class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12"
                                            viewBox="0 0 448 512">
                                            <path
                                                d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z" />
                                        </svg>
                                    </button>

                                    <button @click="startEditLink(inviteLink)" v-if="isAdmin"
                                        class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="12"
                                            viewBox="0 0 512 512">
                                            <path
                                                d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
                                        </svg>
                                    </button>

                                    <button @click="deleteLink(inviteLink)" v-if="isAdmin"
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
                    <li v-if="inviteLinks.length === 0">
                        <div class="text-white w-full shadow-md bg-slate-700 rounded-md p-3">
                            <div class="overflow-hidden h-20 flex gap-1 items-center justify-center">
                                <div class="font-bold w-full text-center text-lg">
                                    No invite links
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>

                <button @click="roomSelector.toggleDisplayLinks()"
                    class="w-full p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
