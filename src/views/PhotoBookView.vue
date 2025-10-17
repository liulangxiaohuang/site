<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import FlipBook from '@/components/FlipBook.vue'

onMounted(() => {
  
})
</script>

<template>
  <div>
    <h1>Photo Book</h1>
    <FlipBook>
      <div class="page bg-yellow-100 font-bold">Cover</div>
      <div class="page bg-green-100">Page 1 - About Nature</div>
      <div class="page bg-blue-100">Page 2 - Mountains</div>
      <div class="page bg-pink-100">Page 3 - Travel Diary</div>
      <div class="page bg-gray-200 font-bold">The End</div>
    </FlipBook>
  </div>
</template>

<style scoped>
</style>