<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FilaFormWizard from '../../../../../components/petshop/vet/prontuarios/FilaFormWizard.vue'
import { createFilaProntuarioDraft, type FilaProntuarioUpsertPayload } from '../../../../../composables/createFilaProntuarioDraft'
import { createFilaProntuario, loadFilaProntuariosOptions, type FilaProntuarioLoadOptions } from '../../../../../services/petshop/vet/prontuarios/fila.service'

const router = useRouter()
const route = useRoute()

const options = ref<FilaProntuarioLoadOptions | null>(null)
const loading = ref(false)

const prefill = {
  prontuario_id: String(route.query.prontuario_id ?? ''),
  atendimento_id: String(route.query.atendimento_id ?? ''),
  status: String(route.query.status ?? ''),
  paciente_id: String(route.query.paciente_id ?? ''),
  veterinario_id: String(route.query.veterinario_id ?? ''),
}

const { draft } = createFilaProntuarioDraft(prefill)

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadFilaProntuariosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: FilaProntuarioUpsertPayload) {
  await createFilaProntuario(payload)
  router.push({ name: 'petshop-vet-prontuarios-fila' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-prontuarios-fila' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <FilaFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

