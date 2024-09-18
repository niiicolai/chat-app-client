<template>
    <div class="w-6 h-6 bg-indigo-500 text-white text-xs text-center overflow-hidden font-bold rounded-full flex items-center justify-center">
        <div v-if="src">
            <img :src="src" class="w-6 h-6 rounded-full" />
        </div>
        <div v-else>
            {{ name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
    src: {
        type: String,
        required: false
    },
    alternativeName: {
        type: String,
        required: false
    }
})
const name = computed(() => {
    return props.alternativeName
        ? props.alternativeName.slice(0, 1).toUpperCase()
        : '';
})
</script>