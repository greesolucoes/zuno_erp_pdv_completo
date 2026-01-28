<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AtendimentoFormWizard from '../../../../components/petshop/vet/atendimentos/AtendimentoFormWizard.vue'
import { createAtendimentoDraft, type AtendimentoUpsertPayload } from '../../../../composables/createAtendimentoDraft'
import { createAtendimento, loadAtendimentosOptions, type AtendimentoLoadOptions } from '../../../../services/petshop/vet/atendimentos/atendimentos.service'

const router = useRouter()

const options = ref<AtendimentoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createAtendimentoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadAtendimentosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: AtendimentoUpsertPayload) {
  await createAtendimento(payload)
  router.push({ name: 'petshop-vet-atendimentos' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-atendimentos' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <AtendimentoFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

