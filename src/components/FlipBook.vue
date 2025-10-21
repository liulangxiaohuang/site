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
const isFullscreen = ref(false)

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
  const containerHeight = containerRef.value.clientHeight
  
  // 根据设备类型和全屏状态调整尺寸
  const isMobile = window.innerWidth < 768
  const baseWidth = isMobile ? window.innerWidth - 40 : document.body.offsetWidth - 40
  const baseHeight = isMobile ? 400 : 500
  
  // 全屏时使用更大的尺寸
  const bookWidth = isFullscreen.value 
    ? Math.min(document.body.offsetWidth - 0, 1200) 
    : baseWidth
  const bookHeight = isFullscreen.value
    ? Math.min(containerHeight - 100, 800)
    : baseHeight
  
  const newScale = containerWidth / bookWidth
  scale.value = newScale > 1 ? 1 : newScale

  window.$(bookRef.value).turn('size', bookWidth * scale.value, bookHeight * scale.value)
}

// 全屏相关方法
const toggleFullscreen = async () => {
  if (!containerRef.value) return

  try {
    if (!isFullscreen.value) {
      // 进入全屏
      if (containerRef.value.requestFullscreen) {
        await containerRef.value.requestFullscreen()
      } else if ((containerRef.value as any).webkitRequestFullscreen) {
        await (containerRef.value as any).webkitRequestFullscreen()
      } else if ((containerRef.value as any).mozRequestFullScreen) {
        await (containerRef.value as any).mozRequestFullScreen()
      } else if ((containerRef.value as any).msRequestFullscreen) {
        await (containerRef.value as any).msRequestFullscreen()
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    }
  } catch (error) {
    console.error('Fullscreen toggle failed:', error)
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
  
  isFullscreen.value = isCurrentlyFullscreen
  
  // 全屏状态改变后重新调整大小
  setTimeout(() => {
    resizeBook()
  }, 100)
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevPage()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextPage()
  }
}

onMounted(async () => {
  try {
    // 先加载 jQuery
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js')
    // 再加载 Turn.js
    // await loadScript('https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js')
    await loadScript(location.protocol + '//' + location.host + '/turn/turn.min.js')

    await nextTick()

    if (bookRef.value) {
      const $book = window.$(bookRef.value)
      const isMobile = window.innerWidth < 768

      $book.turn({
        autoCenter: true,
        display: isMobile ? 'single' : 'double', // 移动端单页显示
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
    
    // 监听全屏事件
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // 监听键盘事件
    window.addEventListener('keydown', handleKeydown)
    
  } catch (error) {
    console.error('Failed to load libraries:', error)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeBook)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
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
  <div 
    class="flipbook-container" 
    ref="containerRef"
    :class="{ 'is-fullscreen': isFullscreen }"
  >

    <div class="flipbook-header" style="display: none;">
      <!-- <div class="page-indicator">
        <span class="current-page">{{ currentPage }}</span>
        <span class="separator">/</span>
        <span class="total-pages">{{ totalPages }}</span>
      </div> -->
      
      <!-- 全屏按钮 -->
      <!-- <button 
        class="fullscreen-btn"
        @click="toggleFullscreen"
        :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
      >
        <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 3V6C8 7.10457 7.10457 8 6 8H3M16 3V6C16 7.10457 16.8954 8 18 8H21M16 21V18C16 16.8954 16.8954 16 18 16H21M8 21V18C8 16.8954 7.10457 16 6 16H3" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button> -->
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
        <!-- <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 3H15M3 9L21 9M9 21H15M3 15L21 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>移动设备可拖动页面边缘翻页</span> -->
      </div>
      <div class="nav-btn-container">
        <transition name="fade">
          <button
              v-show="canGoPrev"
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
          <span>{{ currentPage }}</span>
          <i>/</i>
          <span>{{ totalPages }}</span>
          <span @click="goToPage(totalPages)">尾页</span>
          <template 
            class="fullscreen-btn"
            @click="toggleFullscreen"
            :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
          >
            <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 3V6C8 7.10457 7.10457 8 6 8H3M16 3V6C16 7.10457 16.8954 8 18 8H21M16 21V18C16 16.8954 16.8954 16 18 16H21M8 21V18C8 16.8954 7.10457 16 6 16H3" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </div>
        <transition name="fade">
          <button
              v-show="canGoNext"
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
  /* align-items: center; */
  position: relative;
  padding: 40px 20px;
  padding-top: 0;
  transition: all 0.3s ease;
}

/* 全屏模式样式 */
.flipbook-container.is-fullscreen {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  min-height: 100vh;
  padding: 20px;
}

.flipbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  z-index: 10;
  width: 100%;
  max-width: 800px;
}

.page-indicator {
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.is-fullscreen .page-indicator {
  background: rgba(255, 255, 255, 0.15);
  color: #a5b4fc;
}

.current-page {
  color: #764ba2;
  font-size: 1.1rem;
}

.is-fullscreen .current-page {
  color: #c4b5fd;
}

.separator {
  color: #999;
  font-weight: 400;
}

.total-pages {
  color: #666;
}

.is-fullscreen .total-pages {
  color: #9ca3af;
}

/* 全屏按钮 */
.fullscreen-btn {
  margin-left: 15px;
  /* background: rgba(255, 255, 255, 0.1); */
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.fullscreen-btn:hover {
  /* background: rgba(255, 255, 255, 0.2); */
  color: #764ba2;
  transform: scale(1.05);
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

.is-fullscreen .fullscreen-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #a5b4fc;
}

.is-fullscreen .fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #c4b5fd;
}

.flipbook-wrapper {
  position: relative;
  margin: 20px 0;
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.4));
  /* flex: 1;
  display: flex;
  align-items: center;
  justify-content: center; */
}

.is-fullscreen .flipbook-wrapper {
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6));
}

.flipbook {
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
  width: 48px;
  height: 48px;
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
  cursor: not-allowed;
}

.flipbook-footer {
  margin: 0 auto;
  width: 100%;
  max-width: 60%;
  position: fixed;
  bottom: 10px;
  width: 100%;
  z-index: 10;
  margin-left: 20%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgb(129 129 129 / 20%);
  border-radius: 3px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.is-fullscreen .progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.is-fullscreen .progress-fill {
  background: linear-gradient(90deg, #a5b4fc, #c4b5fd);
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
  color: #5c5c5c;
  font-size: 0.75rem;
  font-weight: normal;
}

.is-fullscreen .tips {
  color: #9ca3af;
}

.tips svg {
  opacity: 0.8;
}

.nav-btn-container {
  display: flex;
  height: 30px;
  position: relative;
  margin: 0 auto;
  /* max-width: 200px; */
  text-align: center;

  .nav-btn-sub-ctls {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    gap: 2px;
    color: #555;
    font-size: 0.8rem;

    span {
      cursor: pointer;
      transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 4px 8px;
      border-radius: 6px;
      
      &:hover {
        color: #222;
        /* background: rgba(0, 0, 0, 0.05); */
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
  button {
    display: none;
  }
}

.is-fullscreen .nav-btn-container .nav-btn-sub-ctls {
  color: #9ca3af;
  
  span:hover {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.1);
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

/* 平板设备适配 */
@media (max-width: 1024px) {
  .flipbook-container {
    padding: 30px 15px;
  }

  .nav-btn.left {
    left: -60px;
  }

  .nav-btn.right {
    right: -60px;
  }
  
  .flipbook-header {
    max-width: 90%;
  }
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .flipbook-container {
    padding: 20px 10px;
    min-height: 500px;
  }
  
  .flipbook-container.is-fullscreen {
    padding: 15px 10px;
  }

  .flipbook-header {
    flex-direction: row;
    gap: 12px;
    margin-bottom: 15px;
  }

  .page-indicator {
    padding: 6px 16px;
    font-size: 0.85rem;
  }

  .current-page {
    font-size: 1rem;
  }
  
  .fullscreen-btn {
    width: 38px;
    height: 38px;
  }

  .flipbook-wrapper {
    margin: 10px 0;
    filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3));
  }

  .nav-btn {
    width: 44px;
    height: 44px;
  }

  .nav-btn.left {
    left: 5px;
  }

  .nav-btn.right {
    right: 5px;
  }

  .flipbook-footer {
    max-width: 90%;
    margin-top: 20px;
  }

  .tips {
    font-size: 0.7rem;
    margin-top: 12px;
  }
  
  .nav-btn-container {
    height: 80px;
    margin-top: 15px;
  }
  
  .nav-btn-container .nav-btn-sub-ctls {
    font-size: 0.85rem;
    gap: 6px;
  }
  
  :deep(.page) {
    font-size: 1rem;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .flipbook-container {
    padding: 15px 8px;
    min-height: 450px;
  }

  .page-indicator {
    padding: 5px 12px;
    font-size: 0.8rem;
  }
  
  .fullscreen-btn svg {
    width: 18px;
    height: 18px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .nav-btn svg {
    width: 20px;
    height: 20px;
  }

  .flipbook-footer {
    max-width: 95%;
  }

  .tips {
    font-size: 0.65rem;
    gap: 6px;
  }
  
  .tips svg {
    width: 14px;
    height: 14px;
  }
  
  .nav-btn-container .nav-btn-sub-ctls {
    font-size: 0.8rem;
  }
}

/* 横屏模式优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .flipbook-container {
    padding: 10px;
    min-height: auto;
  }
  
  .flipbook-header {
    margin-bottom: 10px;
  }
  
  .flipbook-wrapper {
    margin: 5px 0;
  }
  
  .flipbook-footer {
    margin-top: 10px;
  }
  
  .nav-btn-container {
    height: 60px;
    margin-top: 10px;
  }
  
  .tips {
    margin-top: 8px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-btn,
  .fullscreen-btn,
  .nav-btn-sub-ctls span {
    -webkit-tap-highlight-color: transparent;
  }
  
  .nav-btn:active,
  .fullscreen-btn:active {
    transform: translateY(-50%) scale(0.9);
  }
}
</style>