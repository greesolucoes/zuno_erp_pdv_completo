<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section style="padding: 24px">
    <h1>Visualizar NFS-e</h1>
    <p><b>ID:</b> {{ route.params.id }}</p>
  </section>
</template>

