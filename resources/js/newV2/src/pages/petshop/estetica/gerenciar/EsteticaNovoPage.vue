<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EsteticaFormWizard from '../../../../components/petshop/estetica/EsteticaFormWizard.vue'
import { createEsteticaDraft, type EsteticaUpsertPayload } from '../../../../composables/createEsteticaDraft'
import { createEstetica, loadEsteticaOptions, type EsteticaLoadOptions } from '../../../../services/petshop/estetica/estetica.service'

const router = useRouter()

const options = ref<EsteticaLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createEsteticaDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadEsteticaOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: EsteticaUpsertPayload) {
  await createEstetica(payload)
  router.push({ name: 'petshop-estetica-gerenciar' })
}

function onCancel() {
  router.push({ name: 'petshop-estetica-gerenciar' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <EsteticaFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

