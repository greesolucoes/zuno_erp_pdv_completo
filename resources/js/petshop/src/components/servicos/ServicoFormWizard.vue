<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createServicoDraft, type ServicoDraft } from '../../composables/createServicoDraft'
import type { ServicoUpsertPayload, ServicosLoadOptions } from '../../services/servicos/servicos.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ServicoDraft
  loadOptions: ServicosLoadOptions
  onSave?: (payload: ServicoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3 | 4>(1)

const { draft, reset, toPayload } = createServicoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

const canAdvanceFrom1 = computed(() => String(draft.nome ?? '').trim().length > 0)

function goToStep(target: 1 | 2 | 3 | 4) {
  if (target <= step.value) {
    step.value = target
    return
  }
  if (!isReadOnly.value && step.value === 1 && !canAdvanceFrom1.value) return
  step.value = target
}

function onBack() {
  if (step.value === 4) step.value = 3
  else if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value === 1) {
    if (!canAdvanceFrom1.value) return
    step.value = 2
    return
  }
  if (step.value === 2) {
    step.value = 3
    return
  }
  if (step.value === 3) {
    step.value = 4
    return
  }
  await props.onSave?.(toPayload())
}

const saving = ref(false)

async function onSubmit() {
  if (isReadOnly.value) return
  saving.value = true
  try {
    await props.onSave?.(toPayload())
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  await nextTick()
  initLegacyUiBindings()
})

watch(
  () => [
    step.value,
    draft.categoria_id,
    draft.unidade_cobranca,
    draft.status,
    draft.reserva,
    draft.padrao_reserva_nfse,
    draft.marketplace,
    draft.destaque_marketplace,
    draft.estado_local_prestacao_servico,
  ],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

watch(
  () => draft.marketplace,
  (value) => {
    if (value !== '1') {
      draft.destaque_marketplace = '0'
    }
  },
)

watch(
  () => draft.reserva,
  (value) => {
    if (value !== '1') {
      draft.padrao_reserva_nfse = '0'
    }
  },
)

const canShowReservas = computed(() => String(props.loadOptions.plans?.reservas ?? 0) === '1')
const canShowDelivery = computed(() => String(props.loadOptions.plans?.delivery ?? 0) === '1')
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
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab"><img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Operação</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : step > 3 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab"><img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Fiscal</span></a>
        </li>
        <li :class="step === 4 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(4)">
            <span class="round-tab"><img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(4)"><span class="tag-text">Integrações</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="step === 4 ? onSubmit() : onPrimary()">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Dados do serviço</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome<span class="asterisco">*</span></span></label>
                <input v-model="draft.nome" class="form-control" name="nome" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria<span class="asterisco">*</span></span></label>
                <select v-model="draft.categoria_id" class="form-control form-select2" name="categoria_id" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="c in props.loadOptions.categorias" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor<span class="asterisco">*</span></span></label>
                <input v-model="draft.valor" class="form-control moeda" name="valor" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tempo de execução (min)</span></label>
                <input v-model="draft.tempo_servico" class="form-control numerico" name="tempo_servico" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Comissão (opcional)</span></label>
                <input v-model="draft.comissao" class="form-control moeda" name="comissao" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Unidade cobrança</span></label>
                <select v-model="draft.unidade_cobranca" class="form-control form-select2" name="unidade_cobranca" :disabled="isReadOnly">
                  <option v-for="u in props.loadOptions.unidadesCobranca" :key="u.value" :value="u.value">{{ u.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.descricao" class="form-control" rows="4" name="descricao" :readonly="isReadOnly"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Status</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Serviço ativo?</span>
                  <a
                    data-content="Se estiver ativo, ele aparece nas listas para uso. Se estiver inativo, fica guardado e não atrapalha o dia a dia."
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
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Tempo e valores adicionais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tempo adicional (min)</span></label>
                <input v-model="draft.tempo_adicional" class="form-control numerico" name="tempo_adicional" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor adicional</span></label>
                <input v-model="draft.valor_adicional" class="form-control moeda" name="valor_adicional" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tempo de tolerância (min)</span></label>
                <input v-model="draft.tempo_tolerancia" class="form-control numerico" name="tempo_tolerancia" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Códigos</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código do serviço</span></label>
                <input v-model="draft.codigo_servico" class="form-control" name="codigo_servico" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código de tributação municipal</span></label>
                <input v-model="draft.codigo_tributacao_municipio" class="form-control" name="codigo_tributacao_municipio" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canShowReservas" class="pnlCollapse semi-aberto">
        <h2>Reservas</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Usar este serviço em reservas?</span>
                  <a
                    data-content="Se marcar Sim, este serviço pode ser escolhido quando você for criar uma reserva."
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
                    <label><input v-model="draft.reserva" :disabled="isReadOnly" name="reserva" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                  <div class="radiobutton">
                    <label><input v-model="draft.reserva" :disabled="isReadOnly" name="reserva" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="draft.reserva === '1'" class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Usar como padrão na NFSe de reserva?</span>
                  <a
                    data-content="Se marcar Sim, este serviço já vem selecionado quando você for emitir uma NFSe de reserva."
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
                      ><input v-model="draft.padrao_reserva_nfse" :disabled="isReadOnly" name="padrao_reserva_nfse" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.padrao_reserva_nfse" :disabled="isReadOnly" name="padrao_reserva_nfse" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 3">
      <div class="pnlCollapse semi-aberto">
        <h2>Alíquotas</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% ISS</span></label>
                <input v-model="draft.aliquota_iss" class="form-control percentual" name="aliquota_iss" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% PIS</span></label>
                <input v-model="draft.aliquota_pis" class="form-control percentual" name="aliquota_pis" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% COFINS</span></label>
                <input v-model="draft.aliquota_cofins" class="form-control percentual" name="aliquota_cofins" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% INSS</span></label>
                <input v-model="draft.aliquota_inss" class="form-control percentual" name="aliquota_inss" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% IR</span></label>
                <input v-model="draft.aliquota_ir" class="form-control percentual" name="aliquota_ir" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% CSLL</span></label>
                <input v-model="draft.aliquota_csll" class="form-control percentual" name="aliquota_csll" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Deduções e descontos</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Deduções</span></label>
                <input v-model="draft.valor_deducoes" class="form-control moeda" name="valor_deducoes" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Desconto incondicional</span></label>
                <input v-model="draft.desconto_incondicional" class="form-control moeda" name="desconto_incondicional" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Desconto condicional</span></label>
                <input v-model="draft.desconto_condicional" class="form-control moeda" name="desconto_condicional" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Outras retenções</span></label>
                <input v-model="draft.outras_retencoes" class="form-control moeda" name="outras_retencoes" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Local de prestação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cód. CNAE</span></label>
                <input v-model="draft.codigo_cnae" class="form-control" name="codigo_cnae" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>UF do local de prestação</span></label>
                <select
                  v-model="draft.estado_local_prestacao_servico"
                  class="form-control form-select2"
                  name="estado_local_prestacao_servico"
                  :disabled="isReadOnly"
                >
                  <option value="">Selecione</option>
                  <option v-for="uf in props.loadOptions.ufs" :key="uf.value" :value="uf.value">{{ uf.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Natureza de Operação</span></label>
                <input v-model="draft.natureza_operacao" class="form-control" name="natureza_operacao" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="canShowDelivery" class="pnlCollapse semi-aberto">
        <h2>Marketplace</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Usar este serviço no Marketplace (Delivery)?</span>
                  <a
                    data-content="Marque Sim se este serviço deve aparecer no Delivery/Marketplace."
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
                      ><input v-model="draft.marketplace" :disabled="isReadOnly" name="marketplace" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.marketplace" :disabled="isReadOnly" name="marketplace" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="draft.marketplace === '1'" class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Destaque no Marketplace?</span>
                  <a
                    data-content="Marque Sim se você quer que este serviço apareça em destaque no Delivery/Marketplace."
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
                      ><input v-model="draft.destaque_marketplace" :disabled="isReadOnly" name="destaque_marketplace" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.destaque_marketplace" :disabled="isReadOnly" name="destaque_marketplace" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
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
      <button v-if="!isReadOnly && step < 4" type="submit" class="btn btn-lg btn-primary direita">
        Continuar <img src="/img/btn-avancar.svg" />
      </button>
      <button v-if="!isReadOnly && step === 4" id="btnSalvarServico" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>
