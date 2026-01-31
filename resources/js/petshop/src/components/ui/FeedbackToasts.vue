<script setup lang="ts">
import { computed } from 'vue'
import { feedback, useFeedbackStore } from '../../services/feedback'

const store = useFeedbackStore()
const items = computed(() => store.items)
</script>

<template>
  <div v-if="items.length" class="erp-toast-stack" role="region" aria-label="Notificações" aria-live="polite">
    <div v-for="item in items" :key="item.id" class="erp-toast" :class="`erp-toast--${item.type}`" role="status">
      <button class="erp-toast__close" type="button" aria-label="Fechar" @click="feedback.remove(item.id)">×</button>
      <div v-if="item.title" class="erp-toast__title">{{ item.title }}</div>
      <div class="erp-toast__message">{{ item.message }}</div>
    </div>
  </div>
</template>
