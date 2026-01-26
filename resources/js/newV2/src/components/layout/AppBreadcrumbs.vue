<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type BreadcrumbItem = { label: string; to?: string }
type BreadcrumbMetaItem = string | BreadcrumbItem

const props = defineProps<{
  items?: BreadcrumbItem[]
}>()

const route = useRoute()

const effectiveItems = computed<BreadcrumbItem[]>(() => {
  if (props.items?.length) return props.items

  const metaItems = route.meta?.breadcrumbs as BreadcrumbMetaItem[] | undefined
  if (!metaItems?.length) return []

  return metaItems.map((item) => (typeof item === 'string' ? { label: item } : item))
})
</script>

<template>
  <nav class="navbar navbar-default navbar-breadcrumbs">
    <div class="container">
      <div class="breadcrumbs">
        <span class="nome-sistema">
          <RouterLink to="/home">
            <i class="fa fa-home"></i>Home
          </RouterLink>
        </span>

        <template v-for="item in effectiveItems" :key="item.label">
          <span class="separador">::</span>
          <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
          <template v-else> {{ item.label }} </template>
        </template>
      </div>
    </div>
  </nav>
</template>
