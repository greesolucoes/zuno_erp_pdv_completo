<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MedicoFormWizard from '../../../../../components/petshop/vet/cadastros/MedicoFormWizard.vue'
import { createMedicoDraft, type MedicoUpsertPayload } from '../../../../../composables/createMedicoDraft'
import { createMedico, loadMedicosOptions, type MedicosLoadOptions } from '../../../../../services/petshop/vet/cadastros/medicos.service'

const router = useRouter()

const options = ref<MedicosLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createMedicoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadMedicosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: MedicoUpsertPayload) {
  await createMedico(payload)
  router.push({ name: 'petshop-vet-medicos' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-medicos' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <MedicoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

