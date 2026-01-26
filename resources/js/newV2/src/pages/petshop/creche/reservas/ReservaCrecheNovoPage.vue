<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ReservaCrecheFormWizard from '../../../../components/petshop/creche/ReservaCrecheFormWizard.vue'
import { createReservaCrecheDraft, type ReservaCrecheUpsertPayload } from '../../../../composables/createReservaCrecheDraft'
import { createReservaCreche, loadReservasCrecheOptions, type ReservasCrecheLoadOptions } from '../../../../services/petshop/creche/reservas.service'

const router = useRouter()

const options = ref<ReservasCrecheLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createReservaCrecheDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadReservasCrecheOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ReservaCrecheUpsertPayload) {
  await createReservaCreche(payload)
  router.push({ name: 'petshop-creche-reservas' })
}

function onCancel() {
  router.push({ name: 'petshop-creche-reservas' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ReservaCrecheFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

