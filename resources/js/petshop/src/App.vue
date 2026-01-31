<template>
  <RouterView />
  <FeedbackToasts />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import FeedbackToasts from './components/ui/FeedbackToasts.vue'
</script>
