<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EspecieFormWizard from '../../../../components/petshop/animais/EspecieFormWizard.vue'
import { createEspecieDraft, type EspecieDraft, type EspecieUpsertPayload } from '../../../../composables/createEspecieDraft'
import { getEspecieById, loadEspeciesOptions, type Especie, updateEspecie } from '../../../../services/petshop/animais/especies.service'

const router = useRouter()
const route = useRoute()

const especieId = String(route.params.id ?? '')

const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createEspecieDraft()

function especieToDraft(especie: Especie): EspecieDraft {
  const { id: _id, created_at: _createdAt, ...rest } = especie
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    await loadEspeciesOptions()
    const especie = await getEspecieById(especieId)
    reset(especieToDraft(especie))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function onSave(payload: EspecieUpsertPayload) {
  await updateEspecie(especieId, payload)
  router.push({ name: 'petshop-especies' })
}

function onCancel() {
  router.push({ name: 'petshop-especies' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Espécie não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <EspecieFormWizard v-else mode="edit" :model-value="draft" :on-save="onSave" :on-cancel="onCancel" />
</template>
