<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AtendimentoFormWizard from '../../../../components/petshop/vet/atendimentos/AtendimentoFormWizard.vue'
import { createAtendimentoDraft, type AtendimentoDraft } from '../../../../composables/createAtendimentoDraft'
import { getAtendimentoById, loadAtendimentosOptions, type Atendimento, type AtendimentoLoadOptions } from '../../../../services/petshop/vet/atendimentos/atendimentos.service'

const router = useRouter()
const route = useRoute()

const atendimentoId = String(route.params.id ?? '')

const options = ref<AtendimentoLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createAtendimentoDraft()

function atendimentoToDraft(model: Atendimento): AtendimentoDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, inicio_atendimento: _inicioAtendimento, ...rest } = model
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, atendimento] = await Promise.all([loadAtendimentosOptions(), getAtendimentoById(atendimentoId)])
    options.value = loadedOptions
    if (!atendimento) {
      notFound.value = true
      return
    }
    reset(atendimentoToDraft(atendimento))
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'petshop-vet-atendimentos' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Atendimento não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <AtendimentoFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

