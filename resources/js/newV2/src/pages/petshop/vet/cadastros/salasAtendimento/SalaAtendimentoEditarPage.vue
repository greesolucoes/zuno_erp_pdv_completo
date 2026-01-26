<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SalaAtendimentoFormWizard from '../../../../../components/petshop/vet/cadastros/SalaAtendimentoFormWizard.vue'
import { createSalaAtendimentoDraft, type SalaAtendimentoDraft, type SalaAtendimentoUpsertPayload } from '../../../../../composables/createSalaAtendimentoDraft'
import {
  getSalaAtendimentoById,
  loadSalasAtendimentoOptions,
  type SalaAtendimento,
  type SalasAtendimentoLoadOptions,
  updateSalaAtendimento,
} from '../../../../../services/petshop/vet/cadastros/salasAtendimento.service'

const router = useRouter()
const route = useRoute()

const salaId = String(route.params.id ?? '')

const options = ref<SalasAtendimentoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createSalaAtendimentoDraft()

function salaToDraft(sala: SalaAtendimento): SalaAtendimentoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = sala
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, sala] = await Promise.all([loadSalasAtendimentoOptions(), getSalaAtendimentoById(salaId)])
    options.value = loadedOptions
    if (!sala) {
      notFound.value = true
      return
    }
    reset(salaToDraft(sala))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: SalaAtendimentoUpsertPayload) {
  await updateSalaAtendimento(salaId, payload)
  router.push({ name: 'petshop-vet-salas-atendimento' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-salas-atendimento' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Sala não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <SalaAtendimentoFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

