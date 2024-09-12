<template>
    <EditUser :editUser="showEditUser" :close="() => showEditUser = false" />

    <div class="fixed bottom-3 left-3 flex justify-start gap-2">
        <button @click="toggleShowEditUser()" title="Edit User"
            class="p-1 text-xs rounded-md bg-indigo-700 hover:bg-indigo-600 focus:outline-none text-white">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11" viewBox="0 0 448 512">
                <path
                    d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
            </svg>
        </button>

        <button @click="logout()" title="Logout"
            class="p-1 text-xs rounded-md bg-red-700 hover:bg-red-600 focus:outline-none text-white">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="11" viewBox="0 0 512 512">
                <path
                    d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
import EditUser from '@/components/EditUser.vue'
import { useUser } from '@/composables/useUser'
import router from '@/router'
import { ref } from 'vue'

const userCtrl = useUser()
const showEditUser = ref(false)

const logout = async (): Promise<void> => {
    userCtrl.logout()
    router.push({ name: 'login' })
}

const toggleShowEditUser = (): void => {
    showEditUser.value = true
}
</script>
