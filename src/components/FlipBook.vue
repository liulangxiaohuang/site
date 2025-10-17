<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
// import 'turn.js'

// Turn.js 没有类型声明，这里手动声明
// declare global {
//   interface JQuery {
//     turn(options?: any): JQuery;
//     turn(method: string, ...args: any[]): any;
//   }
// }

const bookRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const scale = ref(1)

const resizeBook = () => {
  if (!containerRef.value || !bookRef.value) return
  const containerWidth = containerRef.value.clientWidth
  const bookWidth = 800
  const bookHeight = 500
  const newScale = containerWidth / bookWidth
  scale.value = newScale > 1 ? 1 : newScale
  $(bookRef.value).css({
    transform: `scale(${scale.value})`,
    transformOrigin: 'top center',
  })
}

onMounted(async () => {
  await import('turn.js')
  await nextTick()

  if (bookRef.value) {
    $(bookRef.value).turn({
      width: 800,
      height: 500,
      autoCenter: true,
      display: 'double',
      gradients: true,
      elevation: 50,
    })
  }

  resizeBook()
  window.addEventListener('resize', resizeBook)
})

onBeforeUnmount(() => {
  if (bookRef.value) {
    $(bookRef.value).turn('destroy')
  }
  window.removeEventListener('resize', resizeBook)
})

// 翻页控制
const prevPage = () => {
  $(bookRef.value!).turn('previous')
}

const nextPage = () => {
  $(bookRef.value!).turn('next')
}
</script>

<template>
  <div class="flipbook-container" ref="containerRef">
    <div class="flipbook-wrapper">
      <div class="flipbook" ref="bookRef">
        <!-- 使用 slot 渲染页面 -->
        <slot />
      </div>

      <!-- 翻页按钮 -->
      <button class="nav-btn left" @click="prevPage">‹</button>
      <button class="nav-btn right" @click="nextPage">›</button>
    </div>
  </div>
</template>

<style scoped>
.flipbook-container {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px 0;
}

.flipbook-wrapper {
  position: relative;
}

.flipbook {
  width: 800px;
  height: 500px;
  transition: transform 0.3s ease;
}

.page {
  width: 400px;
  height: 500px;
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* 翻页按钮样式 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  user-select: none;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-btn.left { left: -50px; }
.nav-btn.right { right: -50px; }
</style>
