<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModeloPrescricaoFormWizard from '../../../../../components/petshop/vet/cadastros/ModeloPrescricaoFormWizard.vue'
import { createModeloPrescricaoDraft, type ModeloPrescricaoUpsertPayload } from '../../../../../composables/createModeloPrescricaoDraft'
import { createModeloPrescricao, loadModeloPrescricaoOptions, type ModeloPrescricaoLoadOptions } from '../../../../../services/petshop/vet/cadastros/modeloPrescricao.service'

const router = useRouter()

const options = ref<ModeloPrescricaoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createModeloPrescricaoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadModeloPrescricaoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ModeloPrescricaoUpsertPayload) {
  await createModeloPrescricao(payload)
  router.push({ name: 'petshop-vet-modelo-prescricao' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-modelo-prescricao' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ModeloPrescricaoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

