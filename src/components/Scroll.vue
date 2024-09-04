<template>
    <div class="relative h-full overflow-y-auto" ref="outside">
        <div ref="inner">
            <slot />
        </div>
        <div class="absolute top-1 bottom-1 left-1 rounded-md bg-slate-500 w-2">
            <div class="rounded-md bg-slate-700 w-2" :style="{ height: grabHeight }">

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const outside = ref(null)
const inner = ref(null)

const grabHeight = ref('1%')

const calculateGrabHeight = () => {
    const outsideHeight = outside.value.clientHeight
    const innerHeight = inner.value.clientHeight

    const percentage = (outsideHeight / innerHeight) * 100

    if (percentage < 100)
        grabHeight.value = `${percentage}%`
    else
        grabHeight.value = '100%'
}

onMounted(() => {
    calculateGrabHeight()
    window.addEventListener('resize', calculateGrabHeight)
})

</script>