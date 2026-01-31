<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UnidadeMedidaForm from '../../../components/produtos/unidades/UnidadeMedidaForm.vue'
import { createUnidadeMedidaDraft, type UnidadeMedidaUpsertPayload } from '../../../composables/createUnidadeMedidaDraft'
import { createUnidadeMedida, loadUnidadesMedidaOptions, type UnidadesMedidaLoadOptions } from '../../../services/produtos/unidadesMedida.service'

const router = useRouter()

const options = ref<UnidadesMedidaLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createUnidadeMedidaDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadUnidadesMedidaOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: UnidadeMedidaUpsertPayload) {
  await createUnidadeMedida(payload)
  router.push({ name: 'unidades-medida' })
}

function onCancel() {
  router.push({ name: 'unidades-medida' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <UnidadeMedidaForm v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

