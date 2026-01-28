<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ReservaFormWizard from '../../../../components/petshop/hotel/ReservaFormWizard.vue'
import { createReservaHotelDraft, type ReservaHotelUpsertPayload } from '../../../../composables/createReservaHotelDraft'
import { createReservaHotel, loadReservasHotelOptions, type ReservasHotelLoadOptions } from '../../../../services/petshop/hotel/reservas.service'

const router = useRouter()

const options = ref<ReservasHotelLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createReservaHotelDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadReservasHotelOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ReservaHotelUpsertPayload) {
  await createReservaHotel(payload)
  router.push({ name: 'petshop-hotel-reservas' })
}

function onCancel() {
  router.push({ name: 'petshop-hotel-reservas' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ReservaFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

