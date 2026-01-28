<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChecklistFormWizard from '../../../../../components/petshop/vet/cadastros/ChecklistFormWizard.vue'
import { createChecklistDraft, type ChecklistDraft, type ChecklistUpsertPayload } from '../../../../../composables/createChecklistDraft'
import { getChecklistById, loadChecklistsOptions, type Checklist, type ChecklistsLoadOptions, updateChecklist } from '../../../../../services/petshop/vet/cadastros/checklist.service'

const router = useRouter()
const route = useRoute()

const checklistId = String(route.params.id ?? '')

const options = ref<ChecklistsLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createChecklistDraft()

function checklistToDraft(checklist: Checklist): ChecklistDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = checklist
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, checklist] = await Promise.all([loadChecklistsOptions(), getChecklistById(checklistId)])
    options.value = loadedOptions
    if (!checklist) {
      notFound.value = true
      return
    }
    reset(checklistToDraft(checklist))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ChecklistUpsertPayload) {
  await updateChecklist(checklistId, payload)
  router.push({ name: 'petshop-vet-checklist' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-checklist' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Checklist não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <ChecklistFormWizard v-else-if="options" mode="edit" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

