<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarcaForm from '../../../components/produtos/marcas/MarcaForm.vue'
import type { MarcaDraft } from '../../../composables/createMarcaDraft'
import { createMarcaDraft } from '../../../composables/createMarcaDraft'
import { getMarcaById } from '../../../services/produtos/marcas.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))
const loading = ref(false)
const model = ref<MarcaDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const item = await getMarcaById(id.value)
    if (!item) {
      router.push({ name: 'marcas' })
      return
    }
    const { draft } = createMarcaDraft({ id: item.id, nome: item.nome })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'marcas' })
}
</script>

<template>
  <div v-if="!model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <MarcaForm v-else mode="view" :model-value="model" :on-cancel="onCancel" />
</template>

