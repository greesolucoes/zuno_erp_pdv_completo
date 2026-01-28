<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModeloAvaliacaoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloAvaliacaoFormWizard.vue'
import { createModeloAvaliacaoDraft, type ModeloAvaliacaoDraft } from '../../../../../composables/createModeloAvaliacaoDraft'
import { getModeloAvaliacaoById, loadModeloAvaliacaoOptions, type ModeloAvaliacao, type ModeloAvaliacaoLoadOptions } from '../../../../../services/petshop/vet/cadastros/modeloAvaliacao.service'

const router = useRouter()
const route = useRoute()

const modelId = String(route.params.id ?? '')

const options = ref<ModeloAvaliacaoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createModeloAvaliacaoDraft()

function modelToDraft(model: ModeloAvaliacao): ModeloAvaliacaoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = model
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, model] = await Promise.all([loadModeloAvaliacaoOptions(), getModeloAvaliacaoById(modelId)])
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

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-avaliacao' })
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

  <ModeloAvaliacaoFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

