<template>
  <div class="image-gallery">
    <!-- 搜索/筛选栏 -->
    <!-- <div class="gallery-header">
      <div class="header-content">
        <h2 class="gallery-title">{{ title }}</h2>
        <div class="header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div> -->

    <!-- 真正的瀑布流容器 -->
    <div ref="containerRef" class="waterfall-container">
      <div
        v-for="(image, index) in displayImages"
        :key="image.id"
        :ref="el => setItemRef(el, index)"
        class="waterfall-item"
        :style="getItemStyle(index)"
        @click="$emit('click', image)"
      >
        <div class="image-card">
          <!-- 骨架屏占位 -->
          <div 
            v-show="!loadedImages.has(image.id)" 
            class="skeleton-loader"
            :style="{ paddingBottom: getImageRatio(image) }"
          >
            <div class="skeleton-shimmer"></div>
          </div>

          <!-- 实际图片 - 懒加载 -->
          <img
            :data-src="image.url"
            :alt="image.alt || 'Image'"
            class="gallery-image"
            :class="{ loaded: loadedImages.has(image.id) }"
            @load="onImageLoad(image.id, index, $event)"
            @error="onImageError(image.id)"
          />

          <!-- 悬浮遮罩层 -->
          <div class="image-overlay">
            <div class="overlay-content">
              <!-- 用户信息 -->
              <!-- <div v-if="image.author" class="author-info">
                <img
                  v-if="image.authorAvatar"
                  :src="image.authorAvatar"
                  :alt="image.author"
                  class="author-avatar"
                />
                <span class="author-name">{{ image.author }}</span>
              </div> -->

              <!-- 图片信息 -->
              <div class="image-meta" style="display: none;">
                <button
                  v-if="showLikes"
                  class="meta-button"
                  @click.stop="$emit('like', image)"
                >
                  <svg
                    class="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span v-if="image.likes">{{ formatNumber(image.likes) }}</span>
                </button>

                <button class="meta-button download-btn" @click.stop="$emit('download', image)">
                  <svg
                    class="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多指示器 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 加载完成提示 -->
    <div v-if="!hasMore && displayImages.length > 0" class="end-message">
      <p>已加载全部图片</p>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && displayImages.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p class="empty-text">暂无图片</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'

// 类型定义
export interface ImageItem {
  id: string | number
  url: string
  alt?: string
  author?: string
  authorAvatar?: string
  likes?: number
  width?: number
  height?: number
}

export interface PaginationConfig {
  fetchFunction: (page: number, pageSize: number) => Promise<{
    data: ImageItem[]
    hasMore: boolean
  }>
  pageSize?: number
}

// Props
interface Props {
  images?: ImageItem[]
  pagination?: PaginationConfig
  title?: string
  showLikes?: boolean
  columnCount?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  title: '图片画廊',
  showLikes: true,
  columnCount: 3,
  gap: 20
})

// Emits
const emit = defineEmits<{
  like: [image: ImageItem]
  download: [image: ImageItem]
  click: [image: ImageItem]
}>()

// 响应式数据
const containerRef = ref<HTMLElement | null>(null)
const displayImages = ref<ImageItem[]>([])
const loadedImages = ref(new Set<string | number>())
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const lazyObserver = ref<IntersectionObserver | null>(null)
const itemRefs = ref<(HTMLElement | null)[]>([])

// 瀑布流布局相关
const columnHeights = ref<number[]>([])
const itemPositions = ref<Map<number, { left: number; top: number }>>(new Map())
const itemHeights = ref<Map<number, number>>(new Map())
const containerWidth = ref(0)
const currentColumns = ref(3)

// 计算属性
const isPaginationMode = computed(() => !!props.pagination)

const columnWidth = computed(() => {
  if (containerWidth.value === 0) return 0
  return (containerWidth.value - props.gap * (currentColumns.value - 1)) / currentColumns.value
})

// 设置 item ref
const setItemRef = (el: any, index: number) => {
  if (el) {
    itemRefs.value[index] = el as HTMLElement
  }
}

// 获取图片宽高比
const getImageRatio = (image: ImageItem): string => {
  if (image.width && image.height) {
    return `${(image.height / image.width) * 100}%`
  }
  return '100%' // 默认1:1
}

const containerPadding = ref<number>(40)

// 计算响应式列数
const calculateColumns = () => {
  if (!containerRef.value) return
  
  const width = containerRef.value.offsetWidth - containerPadding.value
  containerWidth.value = width
  
  if (width < 768) {
    currentColumns.value = 1
  } else if (width < 1200) {
    currentColumns.value = 2
  } else {
    currentColumns.value = props.columnCount
  }
  
  // 重置列高度
  columnHeights.value = new Array(currentColumns.value).fill(0)
}

// 获取最短列的索引
const getMinHeightColumnIndex = (): number => {
  let minIndex = 0
  let minHeight = columnHeights.value[0]
  
  for (let i = 1; i < columnHeights.value.length; i++) {
    if (columnHeights.value[i] < minHeight) {
      minHeight = columnHeights.value[i]
      minIndex = i
    }
  }
  
  return minIndex
}

// 计算瀑布流位置
const calculateWaterfallPosition = (index: number, imageHeight: number) => {
  const columnIndex = getMinHeightColumnIndex()
  const left = columnIndex * (columnWidth.value + props.gap)
  const top = columnHeights.value[columnIndex]
  
  itemPositions.value.set(index, { left, top })
  itemHeights.value.set(index, imageHeight)
  
  // 更新列高度
  columnHeights.value[columnIndex] += imageHeight + props.gap
}

// 获取 item 样式
const getItemStyle = (index: number) => {
  const position = itemPositions.value.get(index)
  if (!position) {
    return {
      opacity: 0,
      width: `${columnWidth.value}px`
    }
  }
  
  return {
    position: 'absolute',
    left: `${position.left + 20}px`,
    top: `${position.top}px`,
    width: `${columnWidth.value}px`,
    transition: 'all 0.3s ease'
  }
}

// 重新计算所有已加载图片的位置
const recalculateLayout = async () => {
  columnHeights.value = new Array(currentColumns.value).fill(0)
  itemPositions.value.clear()
  
  await nextTick()
  
  for (let i = 0; i < displayImages.value.length; i++) {
    const image = displayImages.value[i]
    if (loadedImages.value.has(image.id)) {
      const itemEl = itemRefs.value[i]
      if (itemEl) {
        const imgEl = itemEl.querySelector('img')
        if (imgEl && imgEl.naturalHeight) {
          const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth
          const height = columnWidth.value * aspectRatio
          calculateWaterfallPosition(i, height)
        }
      }
    }
  }
  
  // 更新容器高度
  updateContainerHeight()
}

// 更新容器高度
const updateContainerHeight = () => {
  if (containerRef.value && columnHeights.value.length > 0) {
    const maxHeight = Math.max(...columnHeights.value)
    containerRef.value.style.height = `${maxHeight}px`
  }
}

// 初始化数据
const initializeData = async () => {
  if (isPaginationMode.value) {
    await loadMoreImages()
  } else {
    displayImages.value = props.images
  }
}

// 加载更多图片（分页模式）
const loadMoreImages = async () => {
  if (loading.value || !hasMore.value || !props.pagination) return

  loading.value = true
  try {
    const pageSize = props.pagination.pageSize || 20
    const result = await props.pagination.fetchFunction(currentPage.value, pageSize)
    
    displayImages.value.push(...result.data)
    hasMore.value = result.hasMore
    currentPage.value++
    
    await nextTick()
    setupLazyLoading()
  } catch (error) {
    console.error('加载图片失败:', error)
  } finally {
    loading.value = false
  }
}

// 图片懒加载
const setupLazyLoading = () => {
  if (!containerRef.value) return

  // 如果观察器已存在，先断开
  if (lazyObserver.value) {
    lazyObserver.value.disconnect()
  }

  lazyObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.getAttribute('data-src')
          
          if (src && !img.src) {
            img.src = src
            lazyObserver.value?.unobserve(img)
          }
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.01
    }
  )

  // 观察所有未加载的图片
  const images = containerRef.value.querySelectorAll('img[data-src]:not([src])')
  images.forEach((img) => lazyObserver.value?.observe(img))
}

// 无限滚动
const setupInfiniteScroll = () => {
  const handleScroll = () => {
    if (!isPaginationMode.value || !hasMore.value || loading.value) return

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 800) {
      loadMoreImages()
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}

// 图片加载完成
const onImageLoad = (id: string | number, index: number, event: Event) => {
  loadedImages.value.add(id)
  
  const img = event.target as HTMLImageElement
  const aspectRatio = img.naturalHeight / img.naturalWidth
  const height = columnWidth.value * aspectRatio
  
  // 计算这张图片的瀑布流位置
  calculateWaterfallPosition(index, height)
  updateContainerHeight()
}

// 图片加载失败
const onImageError = (id: string | number) => {
  console.error(`图片加载失败: ${id}`)
  loadedImages.value.add(id)
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 响应式调整
let resizeTimeout: ReturnType<typeof setTimeout>
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    calculateColumns()
    recalculateLayout()
  }, 200)
}

// 监听图片数组变化
watch(
  () => props.images,
  async (newImages) => {
    if (!isPaginationMode.value) {
      displayImages.value = newImages
      loadedImages.value.clear()
      itemPositions.value.clear()
      itemHeights.value.clear()
      columnHeights.value = new Array(currentColumns.value).fill(0)
      
      await nextTick()
      setupLazyLoading()
    }
  },
  { deep: true }
)

// 监听显示图片变化
watch(displayImages, async () => {
  await nextTick()
  setupLazyLoading()
})

// 生命周期
onMounted(async () => {
  calculateColumns()
  await initializeData()
  setupLazyLoading()
  
  window.addEventListener('resize', handleResize)
  const cleanupScroll = setupInfiniteScroll()
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cleanupScroll()
    lazyObserver.value?.disconnect()
  })
})
</script>

<style scoped>
.image-gallery {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
}

.gallery-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  padding: 1.5rem 2rem;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gallery-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.waterfall-container {
  position: relative;
  max-width: 1600px;
  margin: 2rem auto;
  /* padding: 0 2rem; */
  transition: height 0.3s ease;
}

@media (max-width: 768px) {
  .waterfall-container {
    padding: 0 1rem;
    margin: 1rem auto;
  }
  
  .gallery-header {
    padding: 1rem;
  }
  
  .gallery-title {
    font-size: 1.5rem;
  }
}

.waterfall-item {
  transition: opacity 0.4s ease;
}

.image-card {
  position: relative;
  border-radius: 0px;
  overflow: hidden;
  background: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.image-card:hover {
  /* transform: translateY(-4px); */
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.skeleton-loader {
  position: relative;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gallery-image {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.gallery-image.loaded {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

.author-name {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.image-meta {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-self: flex-end;
}

.meta-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.meta-button:hover {
  background: white;
  transform: scale(1.05);
}

.meta-button .icon {
  width: 16px;
  height: 16px;
}

.download-btn {
  background: #111;
  color: white;
}

.download-btn:hover {
  background: #000;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator p {
  color: #666;
  font-size: 0.875rem;
}

.end-message {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  min-height: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d0d0d0;
  margin-bottom: 1rem;
}

.empty-text {
  color: #999;
  font-size: 1rem;
}
</style>