<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoriaServicoForm from '../../../components/servicos/categorias/CategoriaServicoForm.vue'
import { createCategoriaServicoDraft, type CategoriaServicoDraft } from '../../../composables/createCategoriaServicoDraft'
import { getCategoriaServicoById, loadCategoriasServicoOptions, type CategoriasServicoLoadOptions } from '../../../services/servicos/categoriasServico.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<CategoriasServicoLoadOptions | null>(null)
const loading = ref(false)
const model = ref<CategoriaServicoDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadCategoriasServicoOptions(), getCategoriaServicoById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'categorias-servico' })
      return
    }
    const { draft } = createCategoriaServicoDraft({
      id: item.id,
      nome: item.nome,
      marketplace: item.marketplace,
    })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'categorias-servico' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <CategoriaServicoForm v-else mode="view" :model-value="model" :load-options="options" :on-cancel="onCancel" />
</template>

