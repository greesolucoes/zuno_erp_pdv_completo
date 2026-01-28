<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MedicamentoFormWizard from '../../../../../components/petshop/vet/cadastros/MedicamentoFormWizard.vue'
import { createMedicamentoDraft, type MedicamentoDraft } from '../../../../../composables/createMedicamentoDraft'
import { getMedicamentoById, loadMedicamentosOptions, type Medicamento, type MedicamentosLoadOptions } from '../../../../../services/petshop/vet/cadastros/medicamentos.service'

const router = useRouter()
const route = useRoute()

const medicamentoId = String(route.params.id ?? '')

const options = ref<MedicamentosLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createMedicamentoDraft()

function medicamentoToDraft(medicamento: Medicamento): MedicamentoDraft {
  const { id: _id, created_at: _createdAt, ...rest } = medicamento
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, medicamento] = await Promise.all([loadMedicamentosOptions(), getMedicamentoById(medicamentoId)])
    options.value = loadedOptions
    if (!medicamento) {
      notFound.value = true
      return
    }
    reset(medicamentoToDraft(medicamento))
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'petshop-vet-medicamentos' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Medicamento não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <MedicamentoFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

