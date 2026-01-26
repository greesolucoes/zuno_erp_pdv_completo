<script setup lang="ts">
type Props = {
  id: string
  title?: string
  iconSrc?: string
  bodyClass?: string
}

defineProps<Props>()
</script>

<template>
  <div :id="id" class="widget">
    <div class="cabecalho">
      <img v-if="iconSrc" class="icone" :src="iconSrc" />
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div :class="['jdash-body', bodyClass]">
      <slot />
    </div>
  </div>
</template>
