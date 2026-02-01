<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContaReceberFormWizard from '../../../components/financeiro/ContaReceberFormWizard.vue'
import { createContaReceberDraft, type ContaReceberDraft } from '../../../composables/createContaReceberDraft'
import { getContaReceberById, loadContasReceberOptions, updateContaReceber, type ContaReceberUpsertPayload, type ContasReceberOptions } from '../../../services/financeiro/contasReceber.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<ContasReceberOptions | null>(null)
const loading = ref(false)
const model = ref<ContaReceberDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadContasReceberOptions(), getContaReceberById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'contas-receber' })
      return
    }
    const { draft } = createContaReceberDraft({
      id: item.id,
      local_id: item.local_id,
      descricao: item.descricao,
      cliente_id: item.cliente_id,
      categoria_conta_id: item.categoria_conta_id,
      valor_integral: item.valor_integral,
      valor_recebido: item.valor_recebido,
      data_vencimento: item.data_vencimento,
      data_recebimento: item.data_recebimento,
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

async function onSave(payload: ContaReceberUpsertPayload) {
  await updateContaReceber(id.value, payload)
  router.push({ name: 'contas-receber' })
}

function onCancel() {
  router.push({ name: 'contas-receber' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ContaReceberFormWizard v-else mode="edit" :model-value="model" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

