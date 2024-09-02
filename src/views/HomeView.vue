<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useRoom } from '@/composables/useRoom.js'
import { ref, onMounted } from 'vue'

const roomCtrl = useRoom()
const rooms = ref([])
onMounted(async () => {
  rooms.value = await roomCtrl._findAll()
})
</script>

<template>
  <Content>
    home
  </Content>
</template>
