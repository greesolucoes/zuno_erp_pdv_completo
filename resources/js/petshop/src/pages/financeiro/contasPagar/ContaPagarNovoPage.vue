<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ContaPagarFormWizard from '../../../components/financeiro/ContaPagarFormWizard.vue'
import { createContaPagarDraft } from '../../../composables/createContaPagarDraft'
import { createContaPagar, loadContasPagarOptions, type ContaPagarUpsertPayload, type ContasPagarOptions } from '../../../services/financeiro/contasPagar.service'

const router = useRouter()

const options = ref<ContasPagarOptions | null>(null)
const loading = ref(false)

const { draft } = createContaPagarDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadContasPagarOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ContaPagarUpsertPayload) {
  await createContaPagar(payload)
  router.push({ name: 'contas-pagar' })
}

function onCancel() {
  router.push({ name: 'contas-pagar' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ContaPagarFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

