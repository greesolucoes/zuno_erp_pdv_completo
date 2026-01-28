<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PelagemFormWizard from '../../../../components/petshop/animais/PelagemFormWizard.vue'
import { createPelagemDraft, type PelagemUpsertPayload } from '../../../../composables/createPelagemDraft'
import { createPelagem, loadPelagensOptions } from '../../../../services/petshop/animais/pelagens.service'

const router = useRouter()

const loading = ref(false)
const { draft } = createPelagemDraft()

onMounted(async () => {
  loading.value = true
  try {
    await loadPelagensOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: PelagemUpsertPayload) {
  await createPelagem(payload)
  router.push({ name: 'petshop-pelagens' })
}

function onCancel() {
  router.push({ name: 'petshop-pelagens' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <PelagemFormWizard v-else mode="create" :model-value="draft" :on-save="onSave" :on-cancel="onCancel" />
</template>

