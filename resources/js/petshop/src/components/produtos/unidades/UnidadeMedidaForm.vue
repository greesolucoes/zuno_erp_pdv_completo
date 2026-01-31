<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { UnidadeMedidaDraft, UnidadeMedidaUpsertPayload } from '../../../composables/createUnidadeMedidaDraft'
import type { UnidadesMedidaLoadOptions } from '../../../services/produtos/unidadesMedida.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: UnidadeMedidaDraft
  loadOptions: UnidadesMedidaLoadOptions
  onSave?: (payload: UnidadeMedidaUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const saving = ref(false)

const draft = ref<UnidadeMedidaDraft>({ ...props.modelValue })

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
  () => [draft.value.status],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

function toPayload(): UnidadeMedidaUpsertPayload {
  return {
    nome: String(draft.value.nome ?? '').trim(),
    status: draft.value.status === '0' ? '0' : '1',
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
      <h2>Dados da unidade</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome<span class="asterisco">*</span></span></label>
              <input v-model="draft.nome" class="form-control" name="nome" :readonly="isReadOnly" required type="text" />
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Esta unidade está ativa?<span class="asterisco">*</span></span>
                <a
                  data-content="Se estiver como Não, ela não aparece para seleção no cadastro."
                  data-placement="top"
                  data-toggle="popover"
                  data-trigger="focus"
                  role="button"
                  tabindex="0"
                >
                  <i class="fa fa-question-circle helpBox"></i>
                </a>
              </label>
              <div class="radio-options">
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="!isReadOnly" id="btnSalvarUnidade" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

