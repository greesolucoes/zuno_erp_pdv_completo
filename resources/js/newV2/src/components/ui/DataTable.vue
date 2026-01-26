<script setup lang="ts">
import PaginationBar from './PaginationBar.vue'

const props = withDefaults(
  defineProps<{
    rows: unknown[]
    rowKey?: (row: unknown, index: number) => string | number
    loading?: boolean
    emptyText?: string
    page?: number
    totalPages?: number
    totalItems?: number
    showPagination?: boolean
  }>(),
  {
    loading: false,
    emptyText: 'Nenhum registro encontrado',
    page: 1,
    totalPages: 1,
    showPagination: true,
  },
)

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()
</script>

<template>
  <table class="table table-striped">
    <thead>
      <slot name="head" />
    </thead>
    <tbody>
      <template v-if="rows.length">
        <template v-for="(row, index) in rows" :key="props.rowKey ? props.rowKey(row, index) : index">
          <slot name="row" :row="row" :index="index" />
        </template>
      </template>
      <tr v-else-if="!loading">
        <td colspan="99">
          <slot name="empty">
            <span class="sem-registros">{{ emptyText }}</span>
          </slot>
        </td>
      </tr>
      <tr v-else>
        <td colspan="99">
          <slot name="loading">
            <span class="sem-registros">Nenhum registro encontrado</span>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>

  <PaginationBar
    v-if="showPagination && totalPages > 1"
    :page="page"
    :total-pages="totalPages"
    :total-items="totalItems"
    @change="(p) => emit('page-change', p)"
  />
</template>
