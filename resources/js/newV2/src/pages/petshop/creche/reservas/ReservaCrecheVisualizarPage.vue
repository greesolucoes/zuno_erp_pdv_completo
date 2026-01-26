<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReservaCrecheFormWizard from '../../../../components/petshop/creche/ReservaCrecheFormWizard.vue'
import { createReservaCrecheDraft, type ReservaCrecheDraft } from '../../../../composables/createReservaCrecheDraft'
import { getReservaCrecheById, loadReservasCrecheOptions, type ReservaCreche, type ReservasCrecheLoadOptions } from '../../../../services/petshop/creche/reservas.service'

const router = useRouter()
const route = useRoute()

const reservaId = String(route.params.id ?? '')

const options = ref<ReservasCrecheLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createReservaCrecheDraft()

function reservaToDraft(reserva: ReservaCreche): ReservaCrecheDraft {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, valor_total: _valorTotal, ...rest } = reserva
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, reserva] = await Promise.all([loadReservasCrecheOptions(), getReservaCrecheById(reservaId)])
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

function onCancel() {
  router.push({ name: 'petshop-creche-reservas' })
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

  <ReservaCrecheFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

