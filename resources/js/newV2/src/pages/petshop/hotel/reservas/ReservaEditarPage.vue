<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReservaFormWizard from '../../../../components/petshop/hotel/ReservaFormWizard.vue'
import { createReservaHotelDraft, type ReservaHotelDraft, type ReservaHotelUpsertPayload } from '../../../../composables/createReservaHotelDraft'
import {
  getReservaHotelById,
  loadReservasHotelOptions,
  type ReservaHotel,
  type ReservasHotelLoadOptions,
  updateReservaHotel,
} from '../../../../services/petshop/hotel/reservas.service'

const router = useRouter()
const route = useRoute()

const reservaId = String(route.params.id ?? '')

const options = ref<ReservasHotelLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createReservaHotelDraft()

function reservaToDraft(reserva: ReservaHotel): ReservaHotelDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, valor_total: _valorTotal, ...rest } = reserva
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, reserva] = await Promise.all([loadReservasHotelOptions(), getReservaHotelById(reservaId)])
    options.value = loadedOptions
    if (!reserva) {
      notFound.value = true
      return
    }
    reset(reservaToDraft(reserva))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ReservaHotelUpsertPayload) {
  await updateReservaHotel(reservaId, payload)
  router.push({ name: 'petshop-hotel-reservas' })
}

function onCancel() {
  router.push({ name: 'petshop-hotel-reservas' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Reserva não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <ReservaFormWizard
    v-else-if="options"
    mode="edit"
    :model-value="draft"
    :load-options="options"
    :on-save="onSave"
    :on-cancel="onCancel"
  />
</template>

