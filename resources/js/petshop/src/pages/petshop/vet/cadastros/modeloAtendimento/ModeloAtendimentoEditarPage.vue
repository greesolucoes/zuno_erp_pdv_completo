<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModeloAtendimentoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloAtendimentoFormWizard.vue'
import { createModeloAtendimentoDraft, type ModeloAtendimentoDraft, type ModeloAtendimentoUpsertPayload } from '../../../../../composables/createModeloAtendimentoDraft'
import {
  getModeloAtendimentoById,
  loadModeloAtendimentoOptions,
  type ModeloAtendimento,
  type ModeloAtendimentoLoadOptions,
  updateModeloAtendimento,
} from '../../../../../services/petshop/vet/cadastros/modeloAtendimento.service'

const router = useRouter()
const route = useRoute()

const modelId = String(route.params.id ?? '')

const options = ref<ModeloAtendimentoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createModeloAtendimentoDraft()

function modelToDraft(model: ModeloAtendimento): ModeloAtendimentoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = model
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, model] = await Promise.all([loadModeloAtendimentoOptions(), getModeloAtendimentoById(modelId)])
    options.value = loadedOptions
    if (!model) {
      notFound.value = true
      return
    }
    reset(modelToDraft(model))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ModeloAtendimentoUpsertPayload) {
  await updateModeloAtendimento(modelId, payload)
  router.push({ name: 'petshop-vet-modelo-atendimento' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-atendimento' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Modelo não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <ModeloAtendimentoFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

