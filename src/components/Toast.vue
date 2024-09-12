<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { computed } from 'vue'

const toastCtrl = useToast()
const toasts = computed(() => toastCtrl.toasts.value || [])
const styling: { [key: string]: string } = {
    'info': 'bg-blue-500 text-white',
    'success': 'bg-green-500 text-white',
    'error': 'bg-red-500 text-white',
    'warning': 'bg-yellow-500 text-white',
    'default': 'bg-gray-500 text-white'
}
</script>

<template>
    <div class="fixed top-3 right-3" style="z-index: 10000;">
        <div v-for="toast in toasts" :class="styling[toast.type]" class="p-3 text-sm rounded-md shadow-lg mb-3" :key="toast.uuid">
            <p>{{ toast.message }}</p>
        </div>
    </div>
</template>
