<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EsteticaFormWizard from '../../../../components/petshop/estetica/EsteticaFormWizard.vue'
import { createEsteticaDraft, type EsteticaDraft, type EsteticaUpsertPayload } from '../../../../composables/createEsteticaDraft'
import { getEsteticaById, loadEsteticaOptions, type Estetica, type EsteticaLoadOptions, updateEstetica } from '../../../../services/petshop/estetica/estetica.service'

const router = useRouter()
const route = useRoute()

const esteticaId = String(route.params.id ?? '')

const options = ref<EsteticaLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createEsteticaDraft()

function esteticaToDraft(item: Estetica): EsteticaDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, valor_total: _valorTotal, ...rest } = item
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, item] = await Promise.all([loadEsteticaOptions(), getEsteticaById(esteticaId)])
    options.value = loadedOptions
    if (!item) {
      notFound.value = true
      return
    }
    reset(esteticaToDraft(item))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: EsteticaUpsertPayload) {
  await updateEstetica(esteticaId, payload)
  router.push({ name: 'petshop-estetica-gerenciar' })
}

function onCancel() {
  router.push({ name: 'petshop-estetica-gerenciar' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Registro não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <EsteticaFormWizard v-else-if="options" mode="edit" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

