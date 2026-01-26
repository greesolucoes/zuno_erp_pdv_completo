<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SalaInternacaoFormWizard from '../../../../../components/petshop/vet/cadastros/SalaInternacaoFormWizard.vue'
import { createSalaInternacaoDraft, type SalaInternacaoUpsertPayload } from '../../../../../composables/createSalaInternacaoDraft'
import { createSalaInternacao, loadSalasInternacaoOptions, type SalasInternacaoLoadOptions } from '../../../../../services/petshop/vet/cadastros/salasInternacao.service'

const router = useRouter()

const options = ref<SalasInternacaoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createSalaInternacaoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadSalasInternacaoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: SalaInternacaoUpsertPayload) {
  await createSalaInternacao(payload)
  router.push({ name: 'petshop-vet-salas-internacao' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-salas-internacao' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <SalaInternacaoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

