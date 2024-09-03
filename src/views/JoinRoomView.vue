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

onMounted(async () => {
    try {
        const join = await roomCtrl.inviteLinks.join(uuid.value)
        if (join) {
            state.value = "joined"
            result.value = join
        }
    } catch (error) {
        if (error.message === 'Error: User already in room') {
            state.value = "already-joined"
            return
        }

        state.value = "error"
        toastCtrl.add(error.message, 'error')
    }
})
</script>

<template>
    <Content>
        <div v-if="state === 'joined'">
            <h1 class="text-left text-3xl font-bold mb-1">
                Welcome to {{ result.room.name }}
            </h1>
            <p>
                You have successfully joined the room
            </p>
        </div>
        <div v-else-if="state === 'already-joined'">
            <h1 class="text-left text-3xl font-bold mb-1">
                Already Joined     
            </h1>

            <p>
                You have already joined this room
            </p>
        </div>
        <div v-else-if="state === 'error'">
            <h1 class="text-left text-3xl font-bold mb-1">
                Error
            </h1>

            <p>
                An error occurred while joining the room
            </p>
        </div>
        <div v-else>
            <h1 class="text-left text-3xl font-bold mb-1">
                Joining room...
            </h1>

            <p>
                Please wait while we join you to the room
            </p>
        </div>
    </Content>
</template>