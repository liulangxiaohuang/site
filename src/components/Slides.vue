<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import IconPlayVideo from "@/components/icons/IconPlayVideo.vue"

interface ImageItem {
  id: number
  name: string
  title: string
  desc: string
}

// 生成图片数据
const totalImages = 99
const imgList = computed<ImageItem[]>(() => {
  return Array.from({ length: totalImages }, (_, i) => {
    const id = i + 1
    return {
      id,
      name: `${id}.jpg`,
      title: '',
      desc: ''
    }
  })
})

// 获取图片路径
const getDocImage = (name: number): string => {
  return new URL(`/src/assets/imgs/${name}.jpg`, import.meta.url).href
}

// 响应式变量
const currentIndex = ref<number>(0)
const slides = ref<NodeListOf<Element> | null>(null)
const autoplayTimer = ref<number | null>(null)

// 初始化轮播
const initCarousel = (): void => {
  nextTick(() => {
    slides.value = document.querySelectorAll('.hero-slide')
    updateSlide(currentIndex.value)
    startAutoplay()
  })
}

// 更新当前幻灯片
const updateSlide = (index: number): void => {
  if (!slides.value) return
  
  slides.value.forEach(slide => slide.classList.remove('active'))
  
  if (slides.value[index]) {
    slides.value[index].classList.add('active')
  }
}

// 下一张幻灯片
const nextSlide = (): void => {
  if (!slides.value) return
  
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
  updateSlide(currentIndex.value)
  resetAutoplay()
}

// 上一张幻灯片
const prevSlide = (): void => {
  if (!slides.value) return
  
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
  updateSlide(currentIndex.value)
  resetAutoplay()
}

// 开始自动播放
const startAutoplay = (): void => {
  autoplayTimer.value = setInterval(nextSlide, 350)
}

// 重置自动播放
const resetAutoplay = (): void => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
  }
  startAutoplay()
}

// 停止自动播放
const stopAutoplay = (): void => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  initCarousel()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <div class="hero-container">
    <div class="hero-slides">
      <div class="hero-slide active" v-for="(item, index) in imgList" :key="index">
        <img
          :src="getDocImage(item.id)" :alt="`Image ${index + 1}`"
        />
      </div>
    </div>

    <div class="hero-text">
      <h1>Wild Huang Vanlife</h1>
      <p>Photographer & Vlogger</p>
      <p class="hero-text-img">
<!--        <img src="@/assets/icons/play2.png">-->
        <IconPlayVideo />
      </p>
    </div>

    <div class="hero-arrows">
      <button class="arrow-btn prev" @click="prevSlide">‹</button>
      <button class="arrow-btn next" @click="nextSlide">›</button>
    </div>
  </div>
</template>

<style scoped>
</style>
