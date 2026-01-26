<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModeloPrescricaoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloPrescricaoFormWizard.vue'
import { createModeloPrescricaoDraft, type ModeloPrescricaoDraft, type ModeloPrescricaoUpsertPayload } from '../../../../../composables/createModeloPrescricaoDraft'
import {
  getModeloPrescricaoById,
  loadModeloPrescricaoOptions,
  type ModeloPrescricao,
  type ModeloPrescricaoLoadOptions,
  updateModeloPrescricao,
} from '../../../../../services/petshop/vet/cadastros/modeloPrescricao.service'

const router = useRouter()
const route = useRoute()

const modelId = String(route.params.id ?? '')

const options = ref<ModeloPrescricaoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createModeloPrescricaoDraft()

function modelToDraft(model: ModeloPrescricao): ModeloPrescricaoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = model
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, model] = await Promise.all([loadModeloPrescricaoOptions(), getModeloPrescricaoById(modelId)])
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

async function onSave(payload: ModeloPrescricaoUpsertPayload) {
  await updateModeloPrescricao(modelId, payload)
  router.push({ name: 'petshop-vet-modelo-prescricao' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-prescricao' })
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

  <ModeloPrescricaoFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

