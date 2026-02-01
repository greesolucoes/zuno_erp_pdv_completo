<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContaPagarFormWizard from '../../../components/financeiro/ContaPagarFormWizard.vue'
import { createContaPagarDraft, type ContaPagarDraft } from '../../../composables/createContaPagarDraft'
import { getContaPagarById, loadContasPagarOptions, updateContaPagar, type ContaPagarUpsertPayload, type ContasPagarOptions } from '../../../services/financeiro/contasPagar.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<ContasPagarOptions | null>(null)
const loading = ref(false)
const model = ref<ContaPagarDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadContasPagarOptions(), getContaPagarById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'contas-pagar' })
      return
    }
    const { draft } = createContaPagarDraft({
      id: item.id,
      local_id: item.local_id,
      descricao: item.descricao,
      fornecedor_id: item.fornecedor_id,
      categoria_conta_id: item.categoria_conta_id,
      valor_integral: item.valor_integral,
      valor_pago: item.valor_pago,
      data_vencimento: item.data_vencimento,
      data_pagamento: item.data_pagamento,
      status: item.status,
      tipo_pagamento: item.tipo_pagamento,
      observacao: item.observacao,
      observacao2: item.observacao2,
      observacao3: item.observacao3,
    })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ContaPagarUpsertPayload) {
  await updateContaPagar(id.value, payload)
  router.push({ name: 'contas-pagar' })
}

function onCancel() {
  router.push({ name: 'contas-pagar' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ContaPagarFormWizard v-else mode="edit" :model-value="model" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

