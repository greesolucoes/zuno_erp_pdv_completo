<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InternacaoFormWizard from '../../../../../components/petshop/vet/internacoes/InternacaoFormWizard.vue'
import { createInternacaoDraft, type InternacaoUpsertPayload } from '../../../../../composables/createInternacaoDraft'
import { createInternacao, loadInternacoesOptions, type InternacoesLoadOptions } from '../../../../../services/petshop/vet/internacoes/internacoes.service'

const router = useRouter()
const route = useRoute()

const options = ref<InternacoesLoadOptions | null>(null)
const loading = ref(false)

const prefill = {
  atendimento_id: String(route.query.atendimento_id ?? ''),
  status: (route.query.status as any) ?? 'draft',
  patient_id: String(route.query.patient_id ?? ''),
}

const { draft } = createInternacaoDraft(prefill)

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadInternacoesOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: InternacaoUpsertPayload) {
  await createInternacao(payload)
  router.push({ name: 'petshop-vet-internacoes-historico' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-internacoes-historico' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <InternacaoFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

