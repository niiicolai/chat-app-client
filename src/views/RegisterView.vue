<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useUser } from '@/composables/useUser.js'
import { useToast } from '@/composables/useToast.js'
import router from '@/router';
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const formRef = ref(null)
const uuid = ref(uuidv4())
const username = ref('')
const email = ref('')
const password = ref('')

const userCtrl = useUser()
const toastCtrl = useToast()
const register = async () => {
    if (!username.value) {
        toastCtrl.add('Please enter username', 'error')
        return
    }

    if (!email.value) {
        toastCtrl.add('Please enter email', 'error')
        return
    }

    if (!password.value) {
        toastCtrl.add('Please enter password', 'error')
        return
    }

    try {
        await userCtrl.create({}, formRef.value)

        router.push({ name: 'home' })
    } catch (error) {
        uuid.value = uuidv4()
        toastCtrl.add(error, 'error')
    }

    uuid.value = uuidv4()
}
</script>

<template>
    <div class="w-full h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center">
        <Content>
            <div class="text-md overflow-hidden w-96 flex flex-col items-center justify-start gap-1 p-3 text-white">
                <div class="flex items-center justify-start gap-6 w-full mb-3 text-3xl font-bold">
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="22" viewBox="0 0 384 512">
                        <path
                            d="M40.1 467.1l-11.2 9c-3.2 2.5-7.1 3.9-11.1 3.9C8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8c-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                    </svg>

                    Join the Adventure!
                </div>

                <div class="mb-3 text-left">
                    Create your account and become part of a vibrant community. Whether you’re here to chat, explore, or
                    make new friends, your journey starts with a single click. Welcome aboard!
                </div>

                <form @submit.prevent="register" ref="formRef">
                    <input type="hidden" v-model="uuid" name="uuid" />

                    <div class="mb-3 flex items-center gap-6">
                        <label for="username" class="block w-36">Username</label>
                        <input id="username" type="text" v-model="username" name="username"
                            class="w-full border p-3 rounded-md text-black text-sm" />
                    </div>

                    <div class="mb-3 flex items-center gap-6">
                        <label for="email" class="block w-36">Email</label>
                        <input id="email" type="email" v-model="email" name="email"
                            class="w-full border p-3 rounded-md text-black text-sm" />
                    </div>

                    <div class="mb-3 flex items-center gap-6">
                        <label for="password" class="block w-36">Password</label>
                        <input id="password" type="password" v-model="password" name="password"
                            class="border p-3 rounded-md text-black text-sm w-full" />
                    </div>

                    <div class="mb-6 flex items-center gap-6">
                        <label for="description" class="block w-36">Avatar</label>
                        <input type="file" placeholder="avatar" name="file"
                            class="w-full p-2 border border-gray-300 rounded-md text-white" />
                    </div>

                    <button type="submit"
                        class="bg-indigo-500 text-white px-12 py-2 w-full rounded-md hover:bg-indigo-600 block mb-3">
                        Register
                    </button>

                    <router-link to="/login" class="text-center text-indigo-500 hover:underline block">Already have an
                        account?
                        Login</router-link>
                </form>
            </div>
        </Content>
    </div>
</template>
