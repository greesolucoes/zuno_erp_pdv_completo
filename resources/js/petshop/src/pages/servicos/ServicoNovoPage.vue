<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ServicoFormWizard from '../../components/servicos/ServicoFormWizard.vue'
import { createServicoDraft, type ServicoDraft } from '../../composables/createServicoDraft'
import { createServico, loadServicosOptions, type ServicoUpsertPayload, type ServicosLoadOptions } from '../../services/servicos/servicos.service'

const router = useRouter()

const options = ref<ServicosLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createServicoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadServicosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ServicoUpsertPayload) {
  await createServico(payload)
  router.push({ name: 'servicos' })
}

function onCancel() {
  router.push({ name: 'servicos' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ServicoFormWizard v-else mode="create" :model-value="draft as ServicoDraft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

