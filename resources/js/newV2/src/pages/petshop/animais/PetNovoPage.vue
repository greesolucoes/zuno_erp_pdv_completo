<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PetFormWizard from '../../../components/petshop/animais/PetFormWizard.vue'
import { createNovoPetDraft } from '../../../composables/createNovoPetDraft'
import { createPet, loadPetsOptions, type PetsLoadOptions } from '../../../services/petshop/animais/pets.service'
import type { PetUpsertPayload } from '../../../composables/createNovoPetDraft'

const router = useRouter()

const options = ref<PetsLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createNovoPetDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadPetsOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: PetUpsertPayload) {
  await createPet(payload)
  router.push({ name: 'petshop-lista-pets' })
}

function onCancel() {
  router.push({ name: 'petshop-lista-pets' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <PetFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>
