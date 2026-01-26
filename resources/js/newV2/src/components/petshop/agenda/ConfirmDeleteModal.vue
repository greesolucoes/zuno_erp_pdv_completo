<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  message: string
  details?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const title = computed(() => props.title ?? 'Confirmar remoção')
const confirmLabel = computed(() => props.confirmLabel ?? 'Remover')
const cancelLabel = computed(() => props.cancelLabel ?? 'Voltar')
const loading = computed(() => Boolean(props.loading))

function cancel() {
  if (loading.value) return
  emit('cancel')
}

function confirm() {
  if (loading.value) return
  emit('confirm')
}
</script>

<template>
  <transition name="agenda-modal-backdrop">
    <div v-if="open" class="modal-backdrop fade in"></div>
  </transition>

  <transition name="agenda-modal-dialog">
    <div v-if="open" class="modal fade in" tabindex="-1" role="dialog" style="display: block">
      <div class="modal-dialog agenda-confirm-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" aria-label="Close" @click.prevent="cancel">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">{{ title }}</h4>
          </div>

          <div class="modal-body" style="padding: 20px">
            <div style="font-size: 16px; color: #333">{{ message }}</div>
            <div v-if="details" class="text-muted" style="margin-top: 10px">{{ details }}</div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-lg btn-default" :disabled="loading" @click.prevent="cancel">{{ cancelLabel }}</button>
            <button type="button" class="btn btn-lg btn-danger direita" :disabled="loading" @click.prevent="confirm">
              <span>{{ confirmLabel }}</span>
              <i v-if="loading" class="fa fa-spinner fa-spin" style="margin-left: 10px"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.agenda-confirm-dialog {
  width: min(92vw, 560px);
}

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
</style>

