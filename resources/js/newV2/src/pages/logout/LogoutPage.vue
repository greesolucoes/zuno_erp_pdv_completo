<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ name: 'login' })
})
</script>

<template>
  <section style="padding: 24px">
    <h1>Saindo...</h1>
  </section>
</template>

