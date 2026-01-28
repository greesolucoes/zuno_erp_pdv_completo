<script setup lang="ts">
defineProps<{
  id: string
  title: string
  iconSrc: string
  bodyClass?: string
}>()
</script>

<template>
  <div :id="id" class="widget">
    <div class="cabecalho"><img class="icone" :src="iconSrc" />{{ title }}</div>
    <div class="jdash-body" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

