<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createContaReceberDraft, type ContaReceberDraft } from '../../composables/createContaReceberDraft'
import type { ContaReceberUpsertPayload, ContasReceberOptions } from '../../services/financeiro/contasReceber.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ContaReceberDraft
  loadOptions: ContasReceberOptions
  onSave?: (payload: ContaReceberUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2>(1)
const saving = ref(false)

const { draft, reset, toPayload } = createContaReceberDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

const canAdvanceFrom1 = computed(() => {
  return String(draft.cliente_id ?? '').trim().length > 0 && String(draft.data_vencimento ?? '').trim().length > 0
})

function goToStep(target: 1 | 2) {
  if (target <= step.value) {
    step.value = target
    return
  }
  if (!isReadOnly.value && step.value === 1 && !canAdvanceFrom1.value) return
  step.value = target
}

function onBack() {
  if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value === 1) {
    if (!canAdvanceFrom1.value) return
    step.value = 2
    return
  }
  await onSubmit()
}

watch(
  () => draft.status,
  (value) => {
    if (value !== '1') {
      draft.data_recebimento = ''
      draft.valor_recebido = '0,00'
    } else {
      if (!String(draft.data_recebimento ?? '').trim()) {
        const today = new Date()
        const yyyy = String(today.getFullYear())
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        draft.data_recebimento = `${yyyy}-${mm}-${dd}`
      }
      if (!String(draft.valor_recebido ?? '').trim() || String(draft.valor_recebido) === '0,00') {
        draft.valor_recebido = String(draft.valor_integral ?? '0,00')
      }
    }
  },
)

onMounted(async () => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  await nextTick()
  initLegacyUiBindings()
})

watch(
  () => [step.value, draft.local_id, draft.cliente_id, draft.categoria_conta_id, draft.tipo_pagamento, draft.status],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

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
  <div class="wizard">
    <div class="wizard-inner">
      <div class="connecting-line"></div>
      <ul class="nav nav-tabs" role="tablist">
        <li :class="step === 1 ? 'ativo' : step > 1 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(1)">
            <span class="round-tab"><img class="passos-pessoas" src="/img/passos-pessoas-ativo-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Identificação</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab"><img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Pagamentos</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Identificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div v-if="props.loadOptions.multiLocal === 1" class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Local<span class="asterisco">*</span></span></label>
                <select v-model="draft.local_id" class="form-control form-select2" name="local_id" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="l in props.loadOptions.locais" :key="l.id" :value="l.id">{{ l.label }}</option>
                </select>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <input v-model="draft.descricao" class="form-control" name="descricao" :readonly="isReadOnly" type="text" />
              </div>
            </div>

            <div class="col-md-5">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cliente<span class="asterisco">*</span></span></label>
                <select v-model="draft.cliente_id" class="form-control form-select2" name="cliente_id" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="c in props.loadOptions.clientes" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <select v-model="draft.categoria_conta_id" class="form-control form-select2" name="categoria_conta_id" :disabled="isReadOnly">
                  <option value="">Selecione</option>
                  <option v-for="c in props.loadOptions.categorias" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observação</span></label>
                <input v-model="draft.observacao" class="form-control" name="observacao" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observação 2</span></label>
                <input v-model="draft.observacao2" class="form-control" name="observacao2" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observação 3</span></label>
                <input v-model="draft.observacao3" class="form-control" name="observacao3" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Pagamentos</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor integral<span class="asterisco">*</span></span></label>
                <input v-model="draft.valor_integral" class="form-control moeda" name="valor_integral" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Data vencimento<span class="asterisco">*</span></span></label>
                <input v-model="draft.data_vencimento" class="form-control" name="data_vencimento" :readonly="isReadOnly" required type="date" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Conta recebida?</span>
                  <a
                    data-content="Marque Sim se este valor já foi recebido. Se marcar Não, ele ficará como pendente."
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
                    <label><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                  <div class="radiobutton">
                    <label><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tipo pagamento<span class="asterisco">*</span></span></label>
                <select v-model="draft.tipo_pagamento" class="form-control form-select2" name="tipo_pagamento" :disabled="isReadOnly" required>
                  <option v-for="t in props.loadOptions.tiposPagamento" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="draft.status === '1'" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Data recebimento</span></label>
                <input v-model="draft.data_recebimento" class="form-control" name="data_recebimento" :readonly="isReadOnly" type="date" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor recebido</span></label>
                <input v-model="draft.valor_recebido" class="form-control moeda" name="valor_recebido" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Anterior
      </button>
      <button v-if="!isReadOnly && step < 2" type="submit" class="btn btn-lg btn-primary direita">
        Continuar <img src="/img/btn-avancar.svg" />
      </button>
      <button v-if="!isReadOnly && step === 2" id="btnSalvarContaReceber" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

