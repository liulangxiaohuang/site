<template>
  <div class="app">
    <!-- 示例1: 直接传入图片数组 -->
    <ImageGallery
      v-if="mode === 'array'"
      :images="staticImages"
      title="精选图片集"
      :show-likes="true"
      @like="handleLike"
      @download="handleDownload"
    >
      <template #actions>
        <button class="switch-btn" @click="mode = 'pagination'">
          切换到分页模式
        </button>
      </template>
    </ImageGallery>

    <!-- 示例2: 使用分页接口 -->
    <ImageGallery
      v-else
      :pagination="paginationConfig"
      title="无限滚动图片流"
      :show-likes="true"
      @like="handleLike"
      @download="handleDownload"
    >
      <template #actions>
        <button class="switch-btn" @click="mode = 'array'">
          切换到数组模式
        </button>
      </template>
    </ImageGallery>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageGallery, { type ImageItem, type PaginationConfig } from '@/components/PhotoList.vue'

const mode = ref<'array' | 'pagination'>('array')

// 示例1: 静态图片数组
const staticImages2 = ref<ImageItem[]>([
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1760594386925-519fba2ad5ba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMjN8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '山脉风景',
    author: 'John Doe',
    authorAvatar: 'https://i.pravatar.cc/150?img=1',
    likes: 1234,
    width: 800,
    height: 1200
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    alt: '自然风光',
    author: 'Jane Smith',
    authorAvatar: 'https://i.pravatar.cc/150?img=2',
    likes: 5678,
    width: 800,
    height: 600
  },
  {
    id: 3,
    url: 'https://plus.unsplash.com/premium_photo-1760445178715-6b473a4ba42b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMzh8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '森林小径',
    author: 'Bob Wilson',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    likes: 890,
    width: 800,
    height: 1000
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1760715658357-57df8f045b8e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=900',
    alt: '湖泊倒影',
    author: 'Alice Brown',
    authorAvatar: 'https://i.pravatar.cc/150?img=4',
    likes: 2345,
    width: 800,
    height: 533
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
    alt: '山顶日出',
    author: 'Charlie Davis',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    likes: 3456,
    width: 800,
    height: 1200
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
    alt: '海滨日落',
    author: 'Eva Martinez',
    authorAvatar: 'https://i.pravatar.cc/150?img=6',
    likes: 4567,
    width: 800,
    height: 600
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
    alt: '雪山景观',
    author: 'Frank Lee',
    authorAvatar: 'https://i.pravatar.cc/150?img=7',
    likes: 1890,
    width: 800,
    height: 900
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1747447597297-0716bbd5b049?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0MHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=900',
    alt: '花田美景',
    author: 'Grace Kim',
    authorAvatar: 'https://i.pravatar.cc/150?img=8',
    likes: 2789,
    width: 800,
    height: 533
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1760985813018-b6b951c57fe8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5NXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=900',
    alt: '海滨日落',
    author: 'Eva Martinez',
    authorAvatar: 'https://i.pravatar.cc/150?img=6',
    likes: 4567,
    width: 800,
    height: 600
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1760286159549-4413b0063baf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNjF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '花田美景',
    author: 'Grace Kim',
    authorAvatar: 'https://i.pravatar.cc/150?img=8',
    likes: 2789,
    width: 800,
    height: 533
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
    alt: '雪山景观',
    author: 'Frank Lee',
    authorAvatar: 'https://i.pravatar.cc/150?img=7',
    likes: 1890,
    width: 800,
    height: 900
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1760594387039-8db5aa19c06a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzNDV8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 15,
    url: 'https://plus.unsplash.com/premium_photo-1698406096055-91a364147db5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzNjZ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 16,
    url: 'https://plus.unsplash.com/premium_photo-1760269682838-4f7a3d586ad3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0NTh8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1757106322111-fd92ecd4a0a2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=985',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1760883956955-31d8adb4e6d9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDEwfDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 19,
    url: 'https://plus.unsplash.com/premium_photo-1760289959686-f000a437f39c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDQwfDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
  {
    id: 20,
    url: 'https://images.unsplash.com/photo-1760972067614-ddc10b94863f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDM3fDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=900',
    alt: '城市夜景',
    author: 'Henry Zhang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    likes: 5234,
    width: 800,
    height: 1200
  },
])

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

const staticImages = ref<ImageItem[]>(generateMockImages(99))

function getRandomInt(min, max) {
    let lastNumber; // 用于存储上一个随机数
    let randomNumber; // 用于存储当前随机数

    // 生成一个初始的随机数，但不检查是否与前一个相邻
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    lastNumber = randomNumber; // 初始化上一个随机数为当前随机数

    // 检查并确保生成的随机数与前一个随机数不相邻
    while (Math.abs(randomNumber - lastNumber) === 1) {
        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 更新上一个随机数为当前随机数，以便下一次使用
    lastNumber = randomNumber;

    return randomNumber;
}

// 示例2: 模拟分页接口
const mockImageDatabase: ImageItem[] = Array.from({ length: 100 }, (_, i) => {
  const imageTopics = [
    'nature', 'mountain', 'ocean', 'forest', 'sunset', 'city', 
    'landscape', 'sky', 'water', 'architecture'
  ]
  const topic = imageTopics[i % imageTopics.length]
  const randomHeight = Math.floor(Math.random() * 400) + 600

  const img = staticImages.value[getRandomInt(0, 19)]
  // console.log(3333, img.height, randomHeight)
  
  return {
    id: `img-${i + 1}`,
    // url: `https://source.unsplash.com/800x${randomHeight}/?${topic}&sig=${i}`,
    url: img.url,
    alt: `${topic} ${i + 1}`,
    author: `摄影师 ${String.fromCharCode(65 + (i % 26))}`,
    authorAvatar: `https://images.unsplash.com/photo-1757489952588-e05db1d85c28?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=40&dpr=2&h=40`,
    likes: Math.floor(Math.random() * 10000),
    width: 800,
    // height: img.height
    height: randomHeight
  }
})

const paginationConfig: PaginationConfig = {
  fetchFunction: async (page: number, pageSize: number) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = mockImageDatabase.slice(start, end)
    
    return {
      data,
      hasMore: end < mockImageDatabase.length
    }
  },
  pageSize: 15
}

// 事件处理
const handleLike = (image: ImageItem) => {
  console.log('点赞图片:', image)
  // 这里可以调用 API 进行点赞操作
}

const handleDownload = (image: ImageItem) => {
  console.log('下载图片:', image)
  // 这里可以实现图片下载逻辑
  const link = document.createElement('a')
  link.href = image.url
  link.download = `image-${image.id}.jpg`
  link.click()
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
}

.switch-btn {
  padding: 0.625rem 1.25rem;
  background: #111;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  background: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.switch-btn:active {
  transform: translateY(0);
}
</style>