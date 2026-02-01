<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { EstoqueOptions } from '../../services/estoque/estoque.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: { produto_id: string; quantidade: string; local_id: string }
  loadOptions: EstoqueOptions
  onSave?: (payload: { produto_id: string; quantidade: string; local_id?: string }) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const saving = ref(false)
const draft = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    draft.value = { ...value }
  },
  { deep: true },
)

onMounted(async () => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  await nextTick()
  initLegacyUiBindings()
})

watch(
  () => [draft.value.produto_id, draft.value.local_id],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

function toPayload() {
  return {
    produto_id: String(draft.value.produto_id ?? ''),
    quantidade: String(draft.value.quantidade ?? ''),
    local_id: props.loadOptions.multiLocal === 1 ? String(draft.value.local_id ?? '') : undefined,
  }
}

async function onSubmit() {
  if (isReadOnly.value) return
  saving.value = true
  try {
    await props.onSave?.(toPayload())
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onSubmit">
    <div class="pnlCollapse semi-aberto">
      <h2>Adicionar / Ajustar estoque</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Produto<span class="asterisco">*</span></span></label>
              <select v-model="draft.produto_id" class="form-control form-select2" name="produto_id" :disabled="isReadOnly" required>
                <option value="">Selecione</option>
                <option v-for="p in props.loadOptions.produtos" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </div>
          </div>
          <div v-if="props.loadOptions.multiLocal === 1" class="col-md-3">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Local<span class="asterisco">*</span></span></label>
              <select v-model="draft.local_id" class="form-control form-select2" name="local_id" :disabled="isReadOnly" required>
                <option value="">Selecione</option>
                <option v-for="l in props.loadOptions.locais" :key="l.id" :value="l.id">{{ l.label }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Quantidade<span class="asterisco">*</span></span></label>
              <input v-model="draft.quantidade" class="form-control quantidade" name="quantidade" :readonly="isReadOnly" required type="text" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="!isReadOnly" id="btnSalvarEstoque" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

