<!-- WaterfallGallery.vue -->
<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div
          ref="containerRef"
          class="waterfall-container"
          :style="{
          height: `${containerHeight}px`,
          maxWidth: `${columnCount * (columnWidth + columnGap)}px`
        }"
      >
        <div
            v-for="image in images"
            :key="image.id"
            :ref="(el) => setImageRef(el as HTMLElement, image.id)"
            :data-id="image.id"
            class="waterfall-item"
            :style="{
            left: `${positions.get(image.id)?.left || 0}px`,
            top: `${positions.get(image.id)?.top || 0}px`,
            width: `${columnWidth}px`
          }"
        >
          <div class="image-card">
            <img
                v-if="loadedImages.has(image.id)"
                :src="image.url"
                :alt="`Image ${image.id}`"
                class="image"
                :style="{ height: `${image.height}px` }"
            />
            <div
                v-else
                class="skeleton"
                :style="{ height: `${image.height}px` }"
            >
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="card-footer">
              <p class="image-label">图片 #{{ image.id }}</p>
              <p class="image-size">{{ image.width }} × {{ image.height }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface ImageItem {
  id: number
  url: string
  width: number
  height: number
}

interface Position {
  left: number
  top: number
}

const getDocImage = (name: number): string => {
  return new URL(`/src/assets/imgs/${name}.jpg`, import.meta.url).href
}

// 生成模拟图片数据（使用 Unsplash）
const generateMockImages = (count: number): ImageItem[] => {
  const images: ImageItem[] = []
  // const topics = ['nature', 'architecture', 'food', 'travel', 'animals', 'fashion', 'art', 'technology']

  for (let i = 1; i <= count; i++) {
    // const topic = topics[Math.floor(Math.random() * topics.length)]
    const height = 200 + Math.floor(Math.random() * 300)
    images.push({
      id: i,
      url: getDocImage(i),
      width: 300,
      height: height
    })
  }
  return images
}

const images = ref<ImageItem[]>(generateMockImages(50))
const loadedImages = ref<Set<number>>(new Set())
const positions = ref<Map<number, Position>>(new Map())
const columnCount = ref(4)
const containerHeight = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const imageRefs = new Map<number, HTMLElement>()
let observer: IntersectionObserver | null = null

const columnGap = 16
const columnWidth = 300
const cardFooterHeight = 60 // 卡片底部信息区域的高度

const setImageRef = (el: HTMLElement | null, id: number) => {
  if (el) {
    imageRefs.set(id, el)
    if (observer) {
      observer.observe(el)
    }
  } else {
    imageRefs.delete(id)
  }
}

// 计算瀑布流布局
const calculateLayout = () => {
  const columnHeights = new Array(columnCount.value).fill(0)
  const newPositions = new Map<number, Position>()

  images.value.forEach((image) => {
    // 找到最短的列
    const minHeight = Math.min(...columnHeights)
    const minIndex = columnHeights.indexOf(minHeight)

    // 计算位置
    const left = minIndex * (columnWidth + columnGap)
    const top = minHeight

    newPositions.set(image.id, { left, top })

    // 更新该列的高度
    // columnHeights[minIndex] += image.height + columnGap
    // 更新该列的高度（图片高度 + 底部信息高度 + 间距）
    columnHeights[minIndex] += image.height + cardFooterHeight + columnGap
  })

  positions.value = newPositions
  containerHeight.value = Math.max(...columnHeights)
}

// 计算列数
const updateColumnCount = () => {
  if (!containerRef.value) return
  const containerWidth = containerRef.value.offsetWidth
  const cols = Math.floor(containerWidth / (columnWidth + columnGap)) || 1
  columnCount.value = cols
}

// 监听列数变化，重新计算布局
watch(columnCount, () => {
  calculateLayout()
})

onMounted(() => {
  // 初始化列数
  updateColumnCount()

  // 监听窗口大小变化
  window.addEventListener('resize', updateColumnCount)

  // 初始化布局
  calculateLayout()

  // 创建 Intersection Observer 实现懒加载
  observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-id'))
            loadedImages.value.add(id)
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '300px'
      }
  )

  // 观察所有图片元素
  imageRefs.forEach((element) => {
    if (observer && element) {
      observer.observe(element)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
  observer?.disconnect()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  //padding: 2rem 1rem;
}

.content-wrapper {
  //max-width: 1400px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.waterfall-container {
  position: relative;
  margin: 0 auto;
  transition: height 0.3s ease;
}

.waterfall-item {
  position: absolute;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.skeleton {
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.icon {
  width: 3rem;
  height: 3rem;
  color: #c0c0c0;
}

.card-footer {
  padding: 1rem;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.05));
  p {
    display: inline-block;
  }
}

.image-label {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
}

.image-size {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  padding-left: 30px;
}
</style>