<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SalaAtendimentoFormWizard from '../../../../../components/petshop/vet/cadastros/SalaAtendimentoFormWizard.vue'
import { createSalaAtendimentoDraft, type SalaAtendimentoUpsertPayload } from '../../../../../composables/createSalaAtendimentoDraft'
import { createSalaAtendimento, loadSalasAtendimentoOptions, type SalasAtendimentoLoadOptions } from '../../../../../services/petshop/vet/cadastros/salasAtendimento.service'

const router = useRouter()

const options = ref<SalasAtendimentoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createSalaAtendimentoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadSalasAtendimentoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: SalaAtendimentoUpsertPayload) {
  await createSalaAtendimento(payload)
  router.push({ name: 'petshop-vet-salas-atendimento' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-salas-atendimento' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <SalaAtendimentoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

