<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const idr = computed(() => (Array.isArray(route.query.idr) ? route.query.idr[0] : route.query.idr) ?? '')
</script>

<template>
  <section style="padding: 24px">
    <h1>DPS Serviço</h1>
    <p><b>idr:</b> {{ idr }}</p>
  </section>
</template>

