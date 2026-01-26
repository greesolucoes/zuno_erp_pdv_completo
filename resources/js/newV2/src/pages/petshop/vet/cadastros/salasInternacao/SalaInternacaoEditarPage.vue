<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SalaInternacaoFormWizard from '../../../../../components/petshop/vet/cadastros/SalaInternacaoFormWizard.vue'
import { createSalaInternacaoDraft, type SalaInternacaoDraft, type SalaInternacaoUpsertPayload } from '../../../../../composables/createSalaInternacaoDraft'
import {
  getSalaInternacaoById,
  loadSalasInternacaoOptions,
  type SalaInternacao,
  type SalasInternacaoLoadOptions,
  updateSalaInternacao,
} from '../../../../../services/petshop/vet/cadastros/salasInternacao.service'

const router = useRouter()
const route = useRoute()

const salaId = String(route.params.id ?? '')

const options = ref<SalasInternacaoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createSalaInternacaoDraft()

function salaToDraft(sala: SalaInternacao): SalaInternacaoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = sala
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, sala] = await Promise.all([loadSalasInternacaoOptions(), getSalaInternacaoById(salaId)])
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

async function onSave(payload: SalaInternacaoUpsertPayload) {
  await updateSalaInternacao(salaId, payload)
  router.push({ name: 'petshop-vet-salas-internacao' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-salas-internacao' })
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

  <SalaInternacaoFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

