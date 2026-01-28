<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModeloAtendimentoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloAtendimentoFormWizard.vue'
import { createModeloAtendimentoDraft, type ModeloAtendimentoUpsertPayload } from '../../../../../composables/createModeloAtendimentoDraft'
import { createModeloAtendimento, loadModeloAtendimentoOptions, type ModeloAtendimentoLoadOptions } from '../../../../../services/petshop/vet/cadastros/modeloAtendimento.service'

const router = useRouter()

const options = ref<ModeloAtendimentoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createModeloAtendimentoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadModeloAtendimentoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ModeloAtendimentoUpsertPayload) {
  await createModeloAtendimento(payload)
  router.push({ name: 'petshop-vet-modelo-atendimento' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-atendimento' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ModeloAtendimentoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

