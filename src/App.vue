<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <SpeedInsights />
  <Analytics />
  <router-view />
</template>

<style scoped>
</style>
