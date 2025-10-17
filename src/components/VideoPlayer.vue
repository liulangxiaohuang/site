<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="video-player-overlay" @click="handleOverlayClick">
        <div class="video-player-container" @click.stop>
          <button class="close-btn" @click="closePlayer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <video
            ref="videoRef"
            class="video-element"
            controls
            autoplay
            webkit-playsinline="true"
            x-webkit-airplay="true"
            playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            preload="auto"
            :poster="currentPoster"
            @click.stop
          >
            <source :src="currentSrc" type="video/mp4">
            <p>您的浏览器不支持视频播放</p>
            <p>Your browser does not support video playback.</p>
          </video>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ShowParams {
  src: string
  poster?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'closed'): void
}

const emit = defineEmits<Emits>()

const visible = ref(false)
const currentSrc = ref('')
const currentPoster = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)

// 显示播放器
const show = (params: ShowParams) => {
  currentSrc.value = params.src
  currentPoster.value = params.poster || ''
  visible.value = true
  
  // 确保视频加载后自动播放
  setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.load()
      videoRef.value.play()
    }
  }, 100)
}

// 关闭播放器
const closePlayer = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  visible.value = false
  currentSrc.value = ''
  currentPoster.value = ''

  // 触发关闭事件
  emit('close')
  
  // 等待动画结束后触发 closed 事件
  setTimeout(() => {
    emit('closed')
  }, 300)
}

// 点击遮罩关闭
const handleOverlayClick = () => {
  closePlayer()
}

// 暴露方法给父组件
defineExpose({
  show,
  closePlayer
})
</script>

<style scoped>
.video-player-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.video-player-container {
  position: relative;
  width: 80%;
  max-width: 1000px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
  outline: none;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
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
@media (max-width: 768px) {
  .video-player-container {
    width: 95%;
  }
  
  .close-btn {
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
  }
}
</style>