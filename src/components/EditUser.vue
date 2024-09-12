<template>
    <div v-if="editUser" style="z-index:3;"
        class="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div class="w-96 bg-black text-white p-4 rounded-md">
            <div class="border-b border-gray-800 pb-3 mb-3">
                <h3 class="text-3xl font-bold mb-1">
                    Edit User
                </h3>

                <p class="text-md">
                    Update your account information.
                </p>
            </div>

            <form ref="updateForm" @submit.prevent="update()">
                <div class="border-b border-gray-800 pb-3 mb-3 flex flex-col gap-2">
                    <div>
                        <label for="username" class="block">Username</label>
                        <small class="mb-1 block">
                            Your username is how other users will identify you.
                        </small>
                        <input v-model="username" placeholder="username" name="username"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="email" class="block">E-mail</label>
                        <small class="mb-1 block">
                            Your email is used for account recovery and notifications.
                        </small>
                        <input v-model="email" type="email" placeholder="email" name="email"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="password" class="block">Password</label>
                        <small class="mb-1 block">
                            Your password should be at least 8 characters long.
                        </small>
                        <input v-model="password" type="password" placeholder="password" name="password"
                            class="w-full p-2 border border-gray-300 rounded-md text-black" />
                    </div>

                    <div>
                        <label for="description" class="font-bold block">Avatar</label>
                        <small class="mb-1 block text-sm">
                            Your avatar is how other users will recognize you.
                        </small>
                        <input type="file" placeholder="avatar" name="file"
                            class="w-full p-2 border border-gray-300 rounded-md text-white" />
                    </div>
                </div>

                <div>
                    <button type="submit" class="p-2 mr-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white">
                        Update User
                    </button>
                    <button type="button" @click="() => close()"
                        class="p-2 bg-slate-500 hover:bg-slate-600 rounded-md text-white">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useUser } from '@/composables/useUser'
import { ref, onMounted } from 'vue'
import type User from '@/models/user'

const props = defineProps({
    editUser: {
        type: Boolean,
        required: true,
        default: false
    },
    close: {
        type: Function,
        required: true,
        default: () => { }
    }
})
const toastCtrl = useToast()
const userCtrl = useUser()
const username = ref('')
const email = ref('')
const password = ref('')
const updateForm = ref(null as any)
const sub = userCtrl.getSub() ?? ''

const update = async () => {

    try {
        await userCtrl.update(sub, {}, updateForm.value)
        props.close()
    } catch (error: any) {
        toastCtrl.add(error, 'error')
    }

    toastCtrl.add('User updated', 'success')
}

onMounted(async () => {
    const me = await userCtrl.me() as User

    username.value = me.username
    email.value = me.email

})
</script>
