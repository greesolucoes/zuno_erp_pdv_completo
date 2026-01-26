<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => {
  const fromMeta = (route.meta as any)?.title as string | undefined
  if (fromMeta) return fromMeta

  const crumbs = (route.meta as any)?.breadcrumbs as any[] | undefined
  const last = Array.isArray(crumbs) ? crumbs[crumbs.length - 1] : undefined
  if (typeof last === 'string') return last
  if (last && typeof last === 'object' && typeof (last as any).label === 'string') return (last as any).label

  return 'Petshop'
})
</script>

<template>
  <div class="pnlCollapse semi-aberto">
    <h2>{{ title }}</h2>
    <div class="retratil" style="padding: 10px 20px">
      <div class="bd-callout bd-callout-info">Tela em construção.</div>
    </div>
  </div>
</template>

