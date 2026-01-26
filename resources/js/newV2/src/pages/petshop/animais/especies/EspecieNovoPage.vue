<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EspecieFormWizard from '../../../../components/petshop/animais/EspecieFormWizard.vue'
import { createEspecieDraft, type EspecieUpsertPayload } from '../../../../composables/createEspecieDraft'
import { createEspecie, loadEspeciesOptions } from '../../../../services/petshop/animais/especies.service'

const router = useRouter()

const loading = ref(false)
const { draft } = createEspecieDraft()

onMounted(async () => {
  loading.value = true
  try {
    await loadEspeciesOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: EspecieUpsertPayload) {
  await createEspecie(payload)
  router.push({ name: 'petshop-especies' })
}

function onCancel() {
  router.push({ name: 'petshop-especies' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <EspecieFormWizard v-else mode="create" :model-value="draft" :on-save="onSave" :on-cancel="onCancel" />
</template>

