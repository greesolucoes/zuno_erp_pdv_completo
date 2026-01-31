<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnidadeMedidaForm from '../../../components/produtos/unidades/UnidadeMedidaForm.vue'
import type { UnidadeMedidaDraft } from '../../../composables/createUnidadeMedidaDraft'
import { createUnidadeMedidaDraft } from '../../../composables/createUnidadeMedidaDraft'
import { getUnidadeMedidaById, loadUnidadesMedidaOptions, type UnidadesMedidaLoadOptions } from '../../../services/produtos/unidadesMedida.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<UnidadesMedidaLoadOptions | null>(null)
const loading = ref(false)
const model = ref<UnidadeMedidaDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadUnidadesMedidaOptions(), getUnidadeMedidaById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'unidades-medida' })
      return
    }
    const { draft } = createUnidadeMedidaDraft({ id: item.id, nome: item.nome, status: item.status })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'unidades-medida' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <UnidadeMedidaForm v-else mode="view" :model-value="model" :load-options="options" :on-cancel="onCancel" />
</template>

