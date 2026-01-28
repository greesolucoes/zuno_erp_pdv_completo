<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import RacaFormWizard from '../../../../components/petshop/animais/RacaFormWizard.vue'
import { createRacaDraft, type RacaUpsertPayload } from '../../../../composables/createRacaDraft'
import { createRaca, loadRacasOptions, type RacasLoadOptions } from '../../../../services/petshop/animais/racas.service'

const router = useRouter()

const options = ref<RacasLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createRacaDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadRacasOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: RacaUpsertPayload) {
  await createRaca(payload)
  router.push({ name: 'petshop-racas' })
}

function onCancel() {
  router.push({ name: 'petshop-racas' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <RacaFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

