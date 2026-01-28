<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PetFormWizard from '../../../components/petshop/animais/PetFormWizard.vue'
import { createNovoPetDraft, type PetDraft, type PetUpsertPayload } from '../../../composables/createNovoPetDraft'
import { getPetById, loadPetsOptions, type Pet, type PetsLoadOptions, updatePet } from '../../../services/petshop/animais/pets.service'

const router = useRouter()
const route = useRoute()

const petId = String(route.params.id ?? '')

const options = ref<PetsLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createNovoPetDraft()

function petToDraft(pet: Pet): PetDraft {
  const { id: _id, tutor: _tutor, ...rest } = pet
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, pet] = await Promise.all([loadPetsOptions(), getPetById(petId)])
    options.value = loadedOptions
    if (!pet) {
      notFound.value = true
      return
    }
    reset(petToDraft(pet))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: PetUpsertPayload) {
  await updatePet(petId, payload)
  router.push({ name: 'petshop-lista-pets' })
}

function onCancel() {
  router.push({ name: 'petshop-lista-pets' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Pet não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <PetFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>
