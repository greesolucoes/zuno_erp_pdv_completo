<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ContaReceberFormWizard from '../../../components/financeiro/ContaReceberFormWizard.vue'
import { createContaReceberDraft } from '../../../composables/createContaReceberDraft'
import { createContaReceber, loadContasReceberOptions, type ContaReceberUpsertPayload, type ContasReceberOptions } from '../../../services/financeiro/contasReceber.service'

const router = useRouter()

const options = ref<ContasReceberOptions | null>(null)
const loading = ref(false)

const { draft } = createContaReceberDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadContasReceberOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ContaReceberUpsertPayload) {
  await createContaReceber(payload)
  router.push({ name: 'contas-receber' })
}

function onCancel() {
  router.push({ name: 'contas-receber' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ContaReceberFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

