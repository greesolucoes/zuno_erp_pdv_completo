<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ChecklistFormWizard from '../../../../../components/petshop/vet/cadastros/ChecklistFormWizard.vue'
import { createChecklistDraft, type ChecklistUpsertPayload } from '../../../../../composables/createChecklistDraft'
import { createChecklist, loadChecklistsOptions, type ChecklistsLoadOptions } from '../../../../../services/petshop/vet/cadastros/checklist.service'

const router = useRouter()

const options = ref<ChecklistsLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createChecklistDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadChecklistsOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ChecklistUpsertPayload) {
  await createChecklist(payload)
  router.push({ name: 'petshop-vet-checklist' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-checklist' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ChecklistFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

