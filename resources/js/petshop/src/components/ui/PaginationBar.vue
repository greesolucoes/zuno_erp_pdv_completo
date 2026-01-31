<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  totalItems?: number
  maxPagesToShow?: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const safeTotalPages = computed(() => Math.max(1, Math.floor(props.totalPages || 1)))
const safePage = computed(() => Math.min(Math.max(1, Math.floor(props.page || 1)), safeTotalPages.value))
const maxPagesToShow = computed(() => Math.max(1, Math.floor(props.maxPagesToShow ?? 7)))

const pages = computed(() => {
  const total = safeTotalPages.value
  const current = safePage.value
  const max = maxPagesToShow.value

  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1)

  const half = Math.floor(max / 2)
  let start = current - half
  let end = start + max - 1

  if (start < 1) {
    start = 1
    end = max
  }
  if (end > total) {
    end = total
    start = total - max + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goToPage(target: number) {
  const next = Math.min(Math.max(1, target), safeTotalPages.value)
  if (next === safePage.value) return
  emit('change', next)
}
</script>

<template>
  <div class="paginacao">
    <div class="indice">
      <ul class="pagination">
        <li :class="{ disabled: safePage <= 1 }">
          <a href="javascript:void(0);" aria-label="Anterior" @click.prevent="goToPage(safePage - 1)">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>

        <li v-for="p in pages" :key="p" :class="{ active: p === safePage }">
          <a href="javascript:void(0);" @click.prevent="goToPage(p)">{{ p }}</a>
        </li>

        <li :class="{ disabled: safePage >= safeTotalPages }">
          <a href="javascript:void(0);" aria-label="Próxima" @click.prevent="goToPage(safePage + 1)">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="descricao" v-if="typeof totalItems === 'number'">Total de {{ totalItems }} registro(s)</div>
  </div>
</template>

<style scoped>
.paginacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
