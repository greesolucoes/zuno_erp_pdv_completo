<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModeloAvaliacaoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloAvaliacaoFormWizard.vue'
import { createModeloAvaliacaoDraft, type ModeloAvaliacaoUpsertPayload } from '../../../../../composables/createModeloAvaliacaoDraft'
import { createModeloAvaliacao, loadModeloAvaliacaoOptions, type ModeloAvaliacaoLoadOptions } from '../../../../../services/petshop/vet/cadastros/modeloAvaliacao.service'

const router = useRouter()

const options = ref<ModeloAvaliacaoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createModeloAvaliacaoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadModeloAvaliacaoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ModeloAvaliacaoUpsertPayload) {
  await createModeloAvaliacao(payload)
  router.push({ name: 'petshop-vet-modelo-avaliacao' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-avaliacao' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ModeloAvaliacaoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

