<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CategoriaServicoForm from '../../../components/servicos/categorias/CategoriaServicoForm.vue'
import { createCategoriaServicoDraft, type CategoriaServicoUpsertPayload } from '../../../composables/createCategoriaServicoDraft'
import { createCategoriaServico, loadCategoriasServicoOptions, type CategoriasServicoLoadOptions } from '../../../services/servicos/categoriasServico.service'

const router = useRouter()

const options = ref<CategoriasServicoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createCategoriaServicoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadCategoriasServicoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: CategoriaServicoUpsertPayload) {
  await createCategoriaServico(payload)
  router.push({ name: 'categorias-servico' })
}

function onCancel() {
  router.push({ name: 'categorias-servico' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <CategoriaServicoForm v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

