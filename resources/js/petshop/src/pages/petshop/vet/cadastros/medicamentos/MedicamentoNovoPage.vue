<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MedicamentoFormWizard from '../../../../../components/petshop/vet/cadastros/MedicamentoFormWizard.vue'
import { createMedicamentoDraft, type MedicamentoUpsertPayload } from '../../../../../composables/createMedicamentoDraft'
import { createMedicamento, loadMedicamentosOptions, type MedicamentosLoadOptions } from '../../../../../services/petshop/vet/cadastros/medicamentos.service'

const router = useRouter()

const options = ref<MedicamentosLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createMedicamentoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadMedicamentosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: MedicamentoUpsertPayload) {
  await createMedicamento(payload)
  router.push({ name: 'petshop-vet-medicamentos' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-medicamentos' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <MedicamentoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

