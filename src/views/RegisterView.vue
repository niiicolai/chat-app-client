<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useUser } from '@/composables/useUser.js'
import { useToast } from '@/composables/useToast.js'
import router from '@/router';
import { ref } from 'vue'

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
        await userCtrl._create({
            username: username.value,
            email: email.value,
            password: password.value
        })

        router.push({ name: 'home' })
    } catch (error) {
        toastCtrl.add(error, 'error')
    }
}
</script>

<template>
    <Content>
        <h1 class="text-center text-3xl font-bold mb-1">
            Register
        </h1>

        <p class="text-center mb-3">
            Create a new account
        </p>

        <form @submit.prevent="register">

            <div class="mb-3 flex items-center gap-6">
                <label for="username" class="block mb-1 w-24">Username</label>
                <input id="username" type="text" v-model="username" class="w-full border p-3 rounded-md text-black text-sm" />
            </div>

            <div class="mb-3 flex items-center gap-6">
                <label for="email" class="block mb-1 w-24">Email</label>
                <input id="email" type="email" v-model="email" class="w-full border p-3 rounded-md text-black text-sm" />
            </div>

            <div class="mb-6 flex items-center gap-6">
                <label for="password" class="block mb-1 w-24">Password</label>
                <input id="password" type="password" v-model="password"
                    class="border p-3 rounded-md text-black text-sm w-full" />
            </div>

            <button type="submit" class="bg-blue-500 text-white px-12 py-2 w-full rounded-md hover:bg-blue-600 block mb-3">
                Login
            </button>

            <router-link to="/login" class="text-center text-blue-500 hover:underline block">Already have an account? Login</router-link>
        </form>
    </Content>
</template>
