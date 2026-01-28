<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AtendimentoFormWizard from '../vet/atendimentos/AtendimentoFormWizard.vue'
import EsteticaFormWizard from '../estetica/EsteticaFormWizard.vue'
import ReservaFormWizard from '../hotel/ReservaFormWizard.vue'
import ReservaCrecheFormWizard from '../creche/ReservaCrecheFormWizard.vue'

import { createAtendimentoDraft, type AtendimentoUpsertPayload } from '../../../composables/createAtendimentoDraft'
import { createEsteticaDraft, type EsteticaUpsertPayload } from '../../../composables/createEsteticaDraft'
import { createReservaHotelDraft, type ReservaHotelUpsertPayload } from '../../../composables/createReservaHotelDraft'
import { createReservaCrecheDraft, type ReservaCrecheUpsertPayload } from '../../../composables/createReservaCrecheDraft'

import {
  createAtendimento,
  getAtendimentoById,
  loadAtendimentosOptions,
  updateAtendimento,
  type AtendimentoLoadOptions,
} from '../../../services/petshop/vet/atendimentos/atendimentos.service'
import { createEstetica, getEsteticaById, loadEsteticaOptions, updateEstetica, type EsteticaLoadOptions } from '../../../services/petshop/estetica/estetica.service'
import {
  createReservaHotel,
  getReservaHotelById,
  loadReservasHotelOptions,
  updateReservaHotel,
  type ReservasHotelLoadOptions,
} from '../../../services/petshop/hotel/reservas.service'
import {
  createReservaCreche,
  getReservaCrecheById,
  loadReservasCrecheOptions,
  updateReservaCreche,
  type ReservasCrecheLoadOptions,
} from '../../../services/petshop/creche/reservas.service'

type Tab = 'vet' | 'estetica' | 'hotel' | 'creche'
type EditTarget = { source: Tab; id: string }

const props = defineProps<{
  open: boolean
  prefillDate?: string
  defaultTab?: Tab
  editTarget?: EditTarget | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scheduled'): void
}>()

const activeTab = ref<Tab>(props.editTarget?.source ?? props.defaultTab ?? 'vet')
watch(
  () => props.defaultTab,
  (v) => {
    if (props.editTarget?.source) return
    if (v) activeTab.value = v
  },
)

const loading = ref(false)
const saving = ref(false)
const loadingItem = ref(false)

const vetOptions = ref<AtendimentoLoadOptions | null>(null)
const esteticaOptions = ref<EsteticaLoadOptions | null>(null)
const hotelOptions = ref<ReservasHotelLoadOptions | null>(null)
const crecheOptions = ref<ReservasCrecheLoadOptions | null>(null)

const prefillDate = computed(() => String(props.prefillDate ?? '').trim())
const isEdit = computed(() => Boolean(props.editTarget?.id))
const editTarget = computed<EditTarget | null>(() => props.editTarget ?? null)

const { draft: vetDraft, reset: resetVet } = createAtendimentoDraft()
const { draft: esteticaDraft, reset: resetEstetica } = createEsteticaDraft()
const { draft: hotelDraft, reset: resetHotel } = createReservaHotelDraft()
const { draft: crecheDraft, reset: resetCreche } = createReservaCrecheDraft()

function applyPrefillDate() {
  if (!prefillDate.value) return
  vetDraft.data_atendimento = prefillDate.value
  esteticaDraft.data_agendamento = prefillDate.value
  hotelDraft.checkin = prefillDate.value
  crecheDraft.data_entrada = prefillDate.value
}

function resetAll() {
  resetVet()
  resetEstetica()
  resetHotel()
  resetCreche()
  if (!isEdit.value) applyPrefillDate()
}

async function loadAllOptions() {
  loading.value = true
  try {
    const [v, e, h, c] = await Promise.all([
      loadAtendimentosOptions(),
      loadEsteticaOptions(),
      loadReservasHotelOptions(),
      loadReservasCrecheOptions(),
    ])
    vetOptions.value = v
    esteticaOptions.value = e
    hotelOptions.value = h
    crecheOptions.value = c
  } finally {
    loading.value = false
  }
}

async function loadEditItem() {
  if (!editTarget.value) return
  loadingItem.value = true
  try {
    activeTab.value = editTarget.value.source
    if (editTarget.value.source === 'vet') {
      const item = await getAtendimentoById(editTarget.value.id)
      if (item) resetVet(item)
    } else if (editTarget.value.source === 'estetica') {
      const item = await getEsteticaById(editTarget.value.id)
      if (item) resetEstetica(item)
    } else if (editTarget.value.source === 'hotel') {
      const item = await getReservaHotelById(editTarget.value.id)
      if (item) resetHotel(item)
    } else if (editTarget.value.source === 'creche') {
      const item = await getReservaCrecheById(editTarget.value.id)
      if (item) resetCreche(item)
    }
  } finally {
    loadingItem.value = false
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    resetAll()
    await loadAllOptions()
    await loadEditItem()
  },
  { immediate: true },
)

watch(prefillDate, () => {
  if (!props.open) return
  if (!isEdit.value) applyPrefillDate()
})

watch(editTarget, async () => {
  if (!props.open) return
  resetAll()
  await loadEditItem()
})

onMounted(() => {
  if (props.open) loadAllOptions()
})

function close() {
  if (saving.value) return
  emit('close')
}

async function handleSaveVet(payload: AtendimentoUpsertPayload) {
  saving.value = true
  try {
    if (isEdit.value && editTarget.value?.source === 'vet') {
      await updateAtendimento(editTarget.value.id, payload)
    } else {
      await createAtendimento(payload)
    }
    emit('scheduled')
    close()
  } finally {
    saving.value = false
  }
}

async function handleSaveEstetica(payload: EsteticaUpsertPayload) {
  saving.value = true
  try {
    if (isEdit.value && editTarget.value?.source === 'estetica') {
      await updateEstetica(editTarget.value.id, payload)
    } else {
      await createEstetica(payload)
    }
    emit('scheduled')
    close()
  } finally {
    saving.value = false
  }
}

async function handleSaveHotel(payload: ReservaHotelUpsertPayload) {
  saving.value = true
  try {
    if (isEdit.value && editTarget.value?.source === 'hotel') {
      await updateReservaHotel(editTarget.value.id, payload)
    } else {
      await createReservaHotel(payload)
    }
    emit('scheduled')
    close()
  } finally {
    saving.value = false
  }
}

async function handleSaveCreche(payload: ReservaCrecheUpsertPayload) {
  saving.value = true
  try {
    if (isEdit.value && editTarget.value?.source === 'creche') {
      await updateReservaCreche(editTarget.value.id, payload)
    } else {
      await createReservaCreche(payload)
    }
    emit('scheduled')
    close()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <transition name="agenda-modal-backdrop">
    <div v-if="open" class="modal-backdrop fade in"></div>
  </transition>

  <transition name="agenda-modal-dialog">
    <div v-if="open" class="modal fade in" tabindex="-1" role="dialog" style="display: block">
      <div class="modal-dialog modal-lg agenda-modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" aria-label="Close" @click.prevent="close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">{{ isEdit ? 'Editar agendamento' : 'Agendar' }}</h4>
          </div>

          <div class="modal-body" style="padding: 0">
            <ul class="nav nav-tabs" style="margin: 0 20px; padding-top: 15px">
              <li :class="activeTab === 'vet' ? 'active' : ''">
                <a href="javascript:void(0);" :style="isEdit && editTarget?.source !== 'vet' ? 'pointer-events:none;opacity:.55' : ''" @click.prevent="activeTab = 'vet'">
                  Veterinário
                </a>
              </li>
              <li :class="activeTab === 'estetica' ? 'active' : ''">
                <a
                  href="javascript:void(0);"
                  :style="isEdit && editTarget?.source !== 'estetica' ? 'pointer-events:none;opacity:.55' : ''"
                  @click.prevent="activeTab = 'estetica'"
                >
                  Estética
                </a>
              </li>
              <li :class="activeTab === 'hotel' ? 'active' : ''">
                <a href="javascript:void(0);" :style="isEdit && editTarget?.source !== 'hotel' ? 'pointer-events:none;opacity:.55' : ''" @click.prevent="activeTab = 'hotel'">
                  Hotel
                </a>
              </li>
              <li :class="activeTab === 'creche' ? 'active' : ''">
                <a href="javascript:void(0);" :style="isEdit && editTarget?.source !== 'creche' ? 'pointer-events:none;opacity:.55' : ''" @click.prevent="activeTab = 'creche'">
                  Creche
                </a>
              </li>
            </ul>

            <div v-if="loading" class="pnlCollapse semi-aberto" style="margin: 15px 20px">
              <h2>Carregando...</h2>
              <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
            </div>

            <div v-else-if="loadingItem" class="pnlCollapse semi-aberto" style="margin: 15px 20px">
              <h2>Carregando registro...</h2>
              <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
            </div>

            <div v-else style="padding: 0 20px 20px">
              <AtendimentoFormWizard
                v-if="activeTab === 'vet' && vetOptions"
                :mode="isEdit && editTarget?.source === 'vet' ? 'edit' : 'create'"
                :model-value="vetDraft"
                :load-options="vetOptions"
                :on-save="handleSaveVet"
                :on-cancel="close"
              />

              <EsteticaFormWizard
                v-else-if="activeTab === 'estetica' && esteticaOptions"
                :mode="isEdit && editTarget?.source === 'estetica' ? 'edit' : 'create'"
                :model-value="esteticaDraft"
                :load-options="esteticaOptions"
                :on-save="handleSaveEstetica"
                :on-cancel="close"
              />

              <ReservaFormWizard
                v-else-if="activeTab === 'hotel' && hotelOptions"
                :mode="isEdit && editTarget?.source === 'hotel' ? 'edit' : 'create'"
                :model-value="hotelDraft"
                :load-options="hotelOptions"
                :on-save="handleSaveHotel"
                :on-cancel="close"
              />

              <ReservaCrecheFormWizard
                v-else-if="activeTab === 'creche' && crecheOptions"
                :mode="isEdit && editTarget?.source === 'creche' ? 'edit' : 'create'"
                :model-value="crecheDraft"
                :load-options="crecheOptions"
                :on-save="handleSaveCreche"
                :on-cancel="close"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-lg btn-primary direita" @click.prevent="close">Fechar</button>
            <span v-if="saving" class="text-muted" style="margin-left: 10px">Salvando…</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.agenda-modal-backdrop-enter-active,
.agenda-modal-backdrop-leave-active {
  transition: opacity 160ms ease;
}

.agenda-modal-backdrop-enter-from,
.agenda-modal-backdrop-leave-to {
  opacity: 0;
}

.agenda-modal-dialog-enter-active,
.agenda-modal-dialog-leave-active {
  transition:
    opacity 170ms ease,
    transform 170ms ease;
}

.agenda-modal-dialog-enter-from,
.agenda-modal-dialog-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
}

.agenda-modal-dialog-enter-to,
.agenda-modal-dialog-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.agenda-modal-dialog {
  width: min(98vw, 1420px);
}
</style>
