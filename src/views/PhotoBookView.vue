<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import FlipBook from '@/components/FlipBook.vue'

onMounted(() => {
  
})
</script>

<template>
  <div class="photo-book">
    <FlipBook>
      <div class="page bg-yellow-100 font-bold">
        <img src="@/assets/imgs/2.jpg" style="width: 50%;">
      </div>
      <div class="page bg-green-100">
        <img src="@/assets/imgs/3.jpg" style="width: 50%;">
      </div>
      <div class="page bg-blue-100">
        <img src="@/assets/imgs/4.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/5.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/6.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/7.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/21.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/30.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/40.jpg" style="height: 100%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/50.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/61.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/70.jpg" style="height: 100%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/36.jpg" style="width: 60%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/76.jpg" style="width: 50%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/56.jpg" style="height: 100%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/44.jpg" style="width: 60%;">
      </div>
      <div class="page bg-pink-100">
        <img src="@/assets/imgs/73.jpg" style="height: 100%;">
      </div>
      <div class="page bg-gray-200 font-bold">
        <img src="@/assets/imgs/15.jpg" style="width: 50%;">
      </div>
    </FlipBook>
  </div>
</template>

<style scoped>
.photo-book {
  height: calc(100vh - 100px);
  /* //background: #efefef; */
  background: linear-gradient(137deg, #f5f5f5 0%, #d2d2d2 100%);

  .page {
    img {
      /* //width: 30%; */
    }
  }
}
</style>