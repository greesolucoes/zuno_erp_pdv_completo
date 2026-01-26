<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RacaFormWizard from '../../../../components/petshop/animais/RacaFormWizard.vue'
import { createRacaDraft, type RacaDraft } from '../../../../composables/createRacaDraft'
import { getRacaById, loadRacasOptions, type Raca, type RacasLoadOptions } from '../../../../services/petshop/animais/racas.service'

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
    const [loadedOptions, raca] = await Promise.all([loadRacasOptions(), getRacaById(racaId)])
    options.value = loadedOptions
    if (!raca) {
      notFound.value = true
      return
    }
    reset(racaToDraft(raca))
  } finally {
    loading.value = false
  }
})

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

  <RacaFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

