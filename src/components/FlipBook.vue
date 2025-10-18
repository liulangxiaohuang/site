<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick, computed } from 'vue'

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
  interface JQuery {
    turn(options?: any): JQuery;
    turn(method: string, ...args: any[]): any;
  }
}

const bookRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)
const currentPage = ref(1)
const totalPages = ref(0)
const isLoaded = ref(false)

// 加载外部脚本
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const resizeBook = () => {
  if (!containerRef.value || !bookRef.value) return
  const containerWidth = containerRef.value.clientWidth
  const bookWidth = document.body.offsetWidth - 60
  const newScale = containerWidth / bookWidth
  scale.value = newScale > 1 ? 1 : newScale

  window.$(bookRef.value).turn('size', bookWidth * scale.value, 500 * scale.value)
}

onMounted(async () => {
  try {
    // 先加载 jQuery
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js')
    // 再加载 Turn.js
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js')

    await nextTick()

    if (bookRef.value) {
      const $book = window.$(bookRef.value)

      $book.turn({
        // width: '80%',
        // height: '80%',
        autoCenter: true,
        display: 'double',
        gradients: true,
        elevation: 50,
        acceleration: true,
        duration: 800,
        pages: $book.children().length,
        when: {
          turning: (event: any, page: number, view: any) => {
            currentPage.value = page
          },
          turned: (event: any, page: number, view: any) => {
            currentPage.value = page
          }
        }
      })

      totalPages.value = $book.turn('pages')
      currentPage.value = 1
      isLoaded.value = true
    }

    resizeBook()
    window.addEventListener('resize', resizeBook)
  } catch (error) {
    console.error('Failed to load libraries:', error)
  }
})

onBeforeUnmount(() => {
  // if (bookRef.value && window.$) {
  //   window.$(bookRef.value).turn('destroy')
  // }
  window.removeEventListener('resize', resizeBook)
})

const prevPage = () => {
  if (bookRef.value && window.$) {
    window.$(bookRef.value).turn('previous')
  }
}

const nextPage = () => {
  if (bookRef.value && window.$) {
    window.$(bookRef.value).turn('next')
  }
}

const goToPage = (page: number) => {
  if (bookRef.value && window.$) {
    window.$(bookRef.value).turn('page', page)
  }
}

const canGoPrev = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)
</script>

<template>
  <div class="flipbook-container" ref="containerRef">

    <div class="flipbook-header">
      <div class="page-indicator">
        <span class="current-page">{{ currentPage }}</span>
        <span class="separator">/</span>
        <span class="total-pages">{{ totalPages }}</span>
      </div>
    </div>

    <div class="flipbook-wrapper">
      <div class="flipbook" ref="bookRef">
        <slot />
      </div>
    </div>

    <div class="flipbook-footer">
      <div class="progress-bar">
        <div
            class="progress-fill"
            :style="{ width: `${(currentPage / totalPages) * 100}%` }"
        ></div>
      </div>
      <div class="tips" v-if="isLoaded">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 3H15M3 9L21 9M9 21H15M3 15L21 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>移动设备可拖动页面边缘翻页</span>
      </div>
      <div class="nav-btn-container">
        <transition name="fade">
          <button
              :disabled="!canGoPrev"
              class="nav-btn left"
              @click="prevPage"
              aria-label="上一页"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </transition>
        <div class="nav-btn-sub-ctls">
          <span @click="goToPage(1)">首页</span>
          <i>/</i>
          <span @click="goToPage(totalPages)">尾页</span>
        </div>
        <transition name="fade">
          <button
              :disabled="!canGoNext"
              class="nav-btn right"
              @click="nextPage"
              aria-label="下一页"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flipbook-container {
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  //background: linear-gradient(135deg, #e0e0e0 0%, #d1d1d1 100%);
  padding: 40px 20px;
  //box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.flipbook-header {
  margin-bottom: 20px;
  z-index: 10;
}

.page-indicator {
  //background: rgba(255, 255, 255, 0.95);
  padding: 5px 15px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  //box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-page {
  color: #764ba2;
}

.separator {
  color: #999;
  font-weight: 400;
}

.total-pages {
  color: #666;
}

.flipbook-wrapper {
  position: relative;
  margin: 20px 0;
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.4));
}

.flipbook {
  //width: 800px;
  //height: 500px;
  transition: transform 0.3s ease;
  cursor: grab;
}

.flipbook:active {
  cursor: grabbing;
}

:deep(.page) {
  width: 400px;
  height: 500px;
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  position: relative;
  overflow: hidden;
}

:deep(.page::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.03) 50%,
      transparent 100%
  );
  pointer-events: none;
}

:deep(.page:nth-child(odd)) {
  box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.1);
}

:deep(.page:nth-child(even)) {
  box-shadow: inset 5px 0 15px rgba(0, 0, 0, 0.1);
}

/* 翻页按钮样式 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #939395;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  color: #764ba2;
}

.nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-btn.left {
  left: -70px;
}

.nav-btn.right {
  right: -70px;
}

.nav-btn[disabled] {
  background: rgb(244 241 241 / 95%);
  color: #e5e2e2;
}

.flipbook-footer {
  margin-top: 30px;
  width: 100%;
  //max-width: 800px;
  max-width: 70%;
  min-width: 300px;
  z-index: 10;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgb(129 129 129 / 20%);
  border-radius: 3px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fff, #f0f0ff);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  color: #5c5c5c;
  font-weight: normal;
}

.tips svg {
  opacity: 0.8;
}

.nav-btn-container {
  display: flex;
  height: 100px;
  position: relative;
  margin: 0 auto;
  max-width: 200px;
  margin-top: 20px;
  text-align: center;

  .nav-btn-sub-ctls {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    gap: 6px;
    color: #555;

    span {
      cursor: pointer;
      transition: color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover {
        color: #222;
      }
    }
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .flipbook-container {
    padding: 30px 15px;
  }

  .nav-btn.left {
    left: 10px;
  }

  .nav-btn.right {
    right: 10px;
  }
}

@media (max-width: 768px) {
  .flipbook-container {
    padding: 20px 10px;
    border-radius: 15px;
  }

  .page-indicator {
    padding: 10px 20px;
    font-size: 1rem;
  }

  .current-page {
    font-size: 1.3rem;
  }

  .nav-btn {
    width: 48px;
    height: 48px;
  }

  .tips {
    font-size: 0.85rem;
  }
}
</style>