<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VacinaFormWizard from '../../../../../components/petshop/vet/cadastros/VacinaFormWizard.vue'
import { createVacinaDraft, type VacinaDraft } from '../../../../../composables/createVacinaDraft'
import { getVacinaById, loadVacinasOptions, type Vacina, type VacinasLoadOptions } from '../../../../../services/petshop/vet/cadastros/vacinas.service'

const router = useRouter()
const route = useRoute()

const vacinaId = String(route.params.id ?? '')

const options = ref<VacinasLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createVacinaDraft()

function vacinaToDraft(vacina: Vacina): VacinaDraft {
  const { id: _id, created_at: _createdAt, tags: _tags, ...rest } = vacina
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, vacina] = await Promise.all([loadVacinasOptions(), getVacinaById(vacinaId)])
    options.value = loadedOptions
    if (!vacina) {
      notFound.value = true
      return
    }
    reset(vacinaToDraft(vacina))
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'petshop-vet-vacinas' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Vacina não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <VacinaFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

