<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, computed } from 'vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')

// 存储事件处理器的引用，以便清理
let menuIcon: Element | null = null
let nav: Element | null = null
let navLinks: NodeListOf<Element> | null = null
let handleMenuClick: (() => void) | null = null
let handleNavLinkClick: (() => void) | null = null
let handleScroll: (() => void) | null = null

onMounted(() => {
  // Mobile menu
  menuIcon = document.querySelector('.menu-icon')
  nav = document.querySelector('nav')

  if (menuIcon && nav) {
    handleMenuClick = () => {
      nav!.classList.toggle('active')
    }

    menuIcon.addEventListener('click', handleMenuClick)

    // 为导航链接添加事件
    navLinks = document.querySelectorAll('nav a')
    handleNavLinkClick = () => {
      nav!.classList.remove('active')
    }

    navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick!)
    })
  }

  // Header scroll effect
  const header = document.querySelector('header')
  
  if (header) {
    handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scroll-active')
      } else {
        header.classList.remove('scroll-active')
      }
    }

    window.addEventListener('scroll', handleScroll)
  }
})

// onUnmounted 应该在顶层作用域，而不是在 onMounted 内部
onUnmounted(() => {
  // 清理菜单事件监听
  if (menuIcon && handleMenuClick) {
    menuIcon.removeEventListener('click', handleMenuClick)
  }
  
  // 清理导航链接事件监听
  if (navLinks && handleNavLinkClick) {
    navLinks.forEach(link => {
      link.removeEventListener('click', handleNavLinkClick!)
    })
  }
  
  // 清理滚动事件监听
  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <header>
    <router-link class="brand" to="/">Wild Huang</router-link>
    <nav>
        <a href="#projects" v-if="isHome">Projects</a>
        <router-link to="/" v-else>Home</router-link>
        <router-link to="/photos">Photos</router-link>
        <router-link to="/photobook">Book</router-link>
        <a href="#contact" v-if="isHome">Contact</a>
    </nav>
    <div class="menu-icon">
        <span></span>
        <span></span>
        <span></span>
    </div>
</header>
<img class="banner" src="@/assets/coms/banner.jpg" v-if="!isHome">
</template>

<style scoped>
img.banner {
  width: 100%;
  display: flex;
}
</style>
