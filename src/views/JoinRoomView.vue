<script setup>
import Content from '@/components/Content.vue';
import router from '@/router';
import { useToast } from '@/composables/useToast.js'
import { useRoom } from '@/composables/useRoom.js'
import { ref, onMounted } from 'vue'

const toastCtrl = useToast()
const roomCtrl = useRoom()
const uuid = ref(router.currentRoute.value.params.uuid)
const state = ref("waiting")
const result = ref(null)

const navigateTo = () => {
    router.push({ name: 'home' })
}

onMounted(async () => {
    try {
        const join = await roomCtrl.inviteLinks.join(uuid.value)
        if (join) {
            state.value = "joined"
            result.value = join
        }
    } catch (error) {
        if (error.message === 'Error: Already a member') {
            state.value = "already-joined"
            return
        } else if (error.message === 'Error: Link expired') {
            state.value = "expired"
            return
        }

        state.value = "error"
        toastCtrl.add(error.message, 'error')
    }
})
</script>

<template>
    <div class="w-full h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center">
        <Content>
            <div v-if="state === 'joined'">
                <div
                    class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                    <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>

                        Welcome to {{ result.name }} !
                    </div>

                    <div v-if="result.avatar_src" class="w-72 mb-3 text-center rounded-md p-3 bg-slate-500 mb-3"
                        :style="{ 
                            backgroundImage: `url(${result.avatar_src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center' 
                        }">
                    >
                    </div>

                    <div class="w-72 mb-3 text-center rounded-md p-3 bg-slate-500 mb-3">
                        {{ result.description }}
                    </div>

                    <div class="w-72 mb-3 text-center">
                        Phew! Our friendly ghost almost had you, but you made it into the room just in time. Glad to
                        have you here!
                    </div>

                    <button @click="navigateTo()"
                        class="p-3 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                        Back to Home
                    </button>
                </div>
            </div>
            <div v-else-if="state === 'already-joined'">
                <div
                    class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                    <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>

                        Already a member
                    </div>
                    <div class="w-72 mb-3 text-center">
                        You’re already part of the crew! Our friendly ghost knows you’re a regular—no need to join
                        again.
                    </div>

                    <button @click="navigateTo()"
                        class="p-3 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                        Back to Home
                    </button>
                </div>
            </div>
            <div v-else-if="state === 'expired'">
                <div
                    class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                    <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>

                        Link expired
                    </div>
                    <div class="w-72 mb-3 text-center">
                        The link you used to join the room has expired. Ask the room owner to send you a new one.
                    </div>

                    <button @click="navigateTo()"
                        class="p-3 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                        Back to Home
                    </button>
                </div>
            </div>
            <div v-else-if="state === 'error'">
                <div
                    class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                    <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>

                        Error
                    </div>
                    <div class="w-72 mb-3 text-center">
                        An error occurred while joining the room.
                    </div>

                    <button @click="navigateTo()"
                        class="p-3 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                        Back to Home
                    </button>
                </div>
            </div>
            <div v-else>
                <div
                    class="text-md overflow-hidden w-full flex flex-col items-center justify-center gap-1 p-3 text-white">
                    <div class="flex items-center justify-center gap-6 w-full mb-3 text-xl">
                        <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                            <path
                                d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>

                        Joining room...
                    </div>
                    <div class="w-72 mb-3 text-center">
                        Please wait while we join you to the room.
                    </div>

                    <button @click="navigateTo()"
                        class="p-3 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
                        Back to Home
                    </button>
                </div>
            </div>
        </Content>
    </div>
</template>