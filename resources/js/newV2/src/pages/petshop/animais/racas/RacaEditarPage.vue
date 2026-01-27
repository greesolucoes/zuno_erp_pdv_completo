<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RacaFormWizard from '../../../../components/petshop/animais/RacaFormWizard.vue'
import { createRacaDraft, type RacaDraft, type RacaUpsertPayload } from '../../../../composables/createRacaDraft'
import { getRacaById, loadRacasOptions, type Raca, type RacasLoadOptions, updateRaca } from '../../../../services/petshop/animais/racas.service'

const router = useRouter()
const route = useRoute()

const racaId = String(route.params.id ?? '')

const options = ref<RacasLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createRacaDraft()

function racaToDraft(raca: Raca): RacaDraft {
  const { id: _id, created_at: _createdAt, ...rest } = raca
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const loadedOptions = await loadRacasOptions()
    options.value = loadedOptions
    const raca = await getRacaById(racaId)
    reset(racaToDraft(raca))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function onSave(payload: RacaUpsertPayload) {
  await updateRaca(racaId, payload)
  router.push({ name: 'petshop-racas' })
}

function onCancel() {
  router.push({ name: 'petshop-racas' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Raça não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <RacaFormWizard v-else-if="options" mode="edit" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>
