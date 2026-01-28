<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import VacinaFormWizard from '../../../../../components/petshop/vet/cadastros/VacinaFormWizard.vue'
import { createVacinaDraft, type VacinaUpsertPayload } from '../../../../../composables/createVacinaDraft'
import { createVacina, loadVacinasOptions, type VacinasLoadOptions } from '../../../../../services/petshop/vet/cadastros/vacinas.service'

const router = useRouter()

const options = ref<VacinasLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createVacinaDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadVacinasOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: VacinaUpsertPayload) {
  await createVacina(payload)
  router.push({ name: 'petshop-vet-vacinas' })
}

function onCancel() {
  router.push({ name: 'petshop-vet-vacinas' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <VacinaFormWizard
    v-else
    mode="create"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

