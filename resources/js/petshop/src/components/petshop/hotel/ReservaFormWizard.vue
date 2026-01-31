<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createReservaHotelDraft, type ReservaHotelDraft, type ReservaHotelUpsertPayload, type ReservaProduto, type ReservaServicoExtra } from '../../../composables/createReservaHotelDraft'
import type { ReservasHotelLoadOptions, ServicoOption } from '../../../services/petshop/hotel/reservas.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ReservaHotelDraft
  loadOptions: ReservasHotelLoadOptions
  onSave?: (payload: ReservaHotelUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createReservaHotelDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

watch(
  () => [step.value, draft.servicos_extras.length, draft.produtos.length],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

const selectedPet = computed(() => props.loadOptions.pets.find((p) => p.id === draft.animal_id) ?? null)

watch(
  () => draft.animal_id,
  (value) => {
    const pet = props.loadOptions.pets.find((p) => p.id === value) ?? null
    draft.id_animal = pet?.id ?? ''
    draft.cliente_id = pet?.cliente_id ?? ''
    draft.animal_info = pet?.animal_info ?? ''
  },
  { immediate: true },
)

watch(
  () => draft.colaborador_id,
  (value) => {
    const col = props.loadOptions.colaboradores.find((c) => c.id === value) ?? null
    draft.id_colaborador = col?.id ?? ''
    draft.nome_colaborador = col?.label ?? ''
  },
  { immediate: true },
)

watch(
  () => draft.quarto_id,
  (value) => {
    const quarto = props.loadOptions.quartos.find((q) => q.id === value) ?? null
    draft.id_quarto = quarto?.id ?? ''
    draft.nome_quarto = quarto?.label ?? ''
  },
  { immediate: true },
)

const estadoLocked = computed(() => !String(draft.checkout ?? '').trim())

function parseMoneyBr(input: string) {
  const normalized = String(input ?? '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
  const parsed = Number.parseFloat(normalized || '0')
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoneyBr(value: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function emptyServicoExtra(): ReservaServicoExtra {
  return {
    servico_id: '',
    servico_categoria: 'servico',
    tempo_execucao: '',
    servico_data: '',
    servico_hora: '',
    servico_valor: '',
  }
}

function addServicoExtra() {
  if (isReadOnly.value) return
  draft.servicos_extras.push(emptyServicoExtra())
}

function removeServicoExtra(index: number) {
  if (isReadOnly.value) return
  draft.servicos_extras.splice(index, 1)
}

function applyServicoMeta(row: ReservaServicoExtra) {
  const opt = props.loadOptions.servicos.find((s) => s.id === row.servico_id) ?? null
  row.servico_categoria = opt?.categoria ?? row.servico_categoria ?? ''
  row.tempo_execucao = opt?.tempo_execucao ?? ''
  if (!String(row.servico_valor ?? '').trim() && opt?.valor) row.servico_valor = opt.valor
}

watch(
  () => draft.servicos_extras,
  (rows) => {
    for (const r of rows) applyServicoMeta(r)
  },
  { deep: true, immediate: true },
)

const totalServicos = computed(() => {
  return (draft.servicos_extras ?? []).reduce((sum, s) => sum + parseMoneyBr(s.servico_valor), 0)
})

function emptyProduto(): ReservaProduto {
  return {
    produto_id: '',
    qtd_produto: '1',
    valor_unitario_produto: '',
    subtotal_produto: '',
  }
}

function addProduto() {
  if (isReadOnly.value) return
  draft.produtos.push(emptyProduto())
}

function removeProduto(index: number) {
  if (isReadOnly.value) return
  draft.produtos.splice(index, 1)
}

function applyProdutoMeta(row: ReservaProduto) {
  const opt = props.loadOptions.produtos.find((p) => p.id === row.produto_id) ?? null
  row.valor_unitario_produto = opt?.valor_unitario ?? ''

  const qty = Math.max(0, Number.parseInt(String(row.qtd_produto ?? '0'), 10) || 0)
  const subtotal = qty * parseMoneyBr(row.valor_unitario_produto)
  row.subtotal_produto = row.produto_id ? formatMoneyBr(subtotal) : ''
}

watch(
  () => draft.produtos,
  (rows) => {
    for (const p of rows) applyProdutoMeta(p)
  },
  { deep: true, immediate: true },
)

const totalProdutos = computed(() => {
  return (draft.produtos ?? []).reduce((sum, p) => sum + parseMoneyBr(p.subtotal_produto), 0)
})

const freteOptions = computed<ServicoOption[]>(() => props.loadOptions.servicos.filter((s) => s.categoria === 'frete'))

watch(
  () => draft.frete?.servico_id,
  (value) => {
    const opt = freteOptions.value.find((s) => s.id === value) ?? null
    if (!draft.frete) return
    draft.frete.servico_categoria = opt?.categoria ?? draft.frete.servico_categoria ?? 'frete'
    draft.frete.tempo_execucao = opt?.tempo_execucao ?? ''
    if (!String(draft.frete.subtotal_servico ?? '').trim() && opt?.valor) draft.frete.subtotal_servico = opt.valor
  },
  { immediate: true },
)

function onEnderecoCliente() {
  if (isReadOnly.value) return
  const pet = selectedPet.value
  const payload = {
    cliente_id: draft.cliente_id || null,
    pet_id: draft.animal_id || null,
    cliente_nome: pet?.cliente_nome ?? null,
    endereco: 'Rua Exemplo, 123 - Centro',
    cidade: 'Curitiba',
    uf: 'PR',
  }
  draft.frete.endereco_cliente = JSON.stringify(payload)
}

const totalGeral = computed(() => {
  const principal = parseMoneyBr(draft.servico_principal_valor)
  const frete = parseMoneyBr(draft.frete?.subtotal_servico ?? '')
  return principal + totalServicos.value + totalProdutos.value + frete
})

const hasValidTab1 = computed(() => {
  return String(draft.animal_id ?? '').trim().length > 0
})

const hasValidTab2 = computed(() => {
  const checkinOk = String(draft.checkin ?? '').trim().length > 0
  const timeOk = String(draft.timecheckin ?? '').trim().length > 0
  const quartoOk = String(draft.quarto_id ?? '').trim().length > 0
  return checkinOk && timeOk && quartoOk
})

function canAdvanceFrom(stepValue: 1 | 2 | 3) {
  if (isReadOnly.value) return true
  if (stepValue === 1) return hasValidTab1.value
  if (stepValue === 2) return hasValidTab2.value
  return true
}

function goToStep(target: 1 | 2 | 3) {
  if (target <= step.value) {
    step.value = target
    return
  }
  let current = step.value
  while (current < target) {
    if (!canAdvanceFrom(current)) break
    current = (current + 1) as any
  }
  step.value = current
}

function onBack() {
  if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value < 3) {
    if (!canAdvanceFrom(step.value)) return
    step.value = (step.value + 1) as any
    return
  }
  if (!hasValidTab1.value || !hasValidTab2.value) return
  await props.onSave?.(toPayload())
}
</script>

<template>
  <div class="wizard">
    <div class="wizard-inner">
      <div class="connecting-line"></div>
      <ul class="nav nav-tabs" role="tablist">
        <li :class="step === 1 ? 'ativo' : step > 1 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(1)">
            <span class="round-tab">
              <img class="passos-pessoas" src="/img/passos-pessoas-ativo-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Básico</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Agendamento</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Itens</span></a>
        </li>
        <li class="fechado">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag"><span class="tag-text">Finalizar</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <input type="hidden" name="animal_info" :value="draft.animal_info" />
    <input type="hidden" name="id_animal" :value="draft.id_animal" />
    <input type="hidden" name="cliente_id" :value="draft.cliente_id" />
    <input type="hidden" name="nome_colaborador" :value="draft.nome_colaborador" />
    <input type="hidden" name="id_colaborador" :value="draft.id_colaborador" />
    <input type="hidden" name="nome_quarto" :value="draft.nome_quarto" />
    <input type="hidden" name="id_quarto" :value="draft.id_quarto" />

    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Informações gerais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Ordem de serviço</span></label>
                <input
                  v-model="draft.ordem_servico"
                  class="form-control"
                  name="ordem_servico"
                  placeholder="Gerada automaticamente"
                  readonly
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Pet<span class="asterisco">*</span></span></label>
                <select v-model="draft.animal_id" class="form-control form-select2" name="animal_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="p in props.loadOptions.pets" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                <b>Cliente:</b> {{ selectedPet?.cliente_nome ?? '-' }}
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 10px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Colaborador</span></label>
                <select v-model="draft.colaborador_id" class="form-control form-select2" name="colaborador_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="c in props.loadOptions.colaboradores" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Situação</span></label>
                <select v-model="draft.estado" class="form-control form-select2" name="estado" :disabled="isReadOnly || estadoLocked">
                  <option v-for="s in props.loadOptions.estados" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                <div v-if="estadoLocked" class="bd-callout bd-callout-info" style="margin: 10px 0 0">
                  Situação fica disponível após o check-out ser informado.
                </div>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.descricao" class="form-control" name="descricao" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Agendamento</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group">
                <label class="control-label"><span>Check-in<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <input v-model="draft.checkin" class="form-control data" name="checkin" :readonly="isReadOnly" required type="text" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button">
                      <div class="btn-calendario"></div>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Hora do check-in<span class="asterisco">*</span></span></label>
                <input v-model="draft.timecheckin" class="form-control" name="timecheckin" :readonly="isReadOnly" required type="time" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group">
                <label class="control-label"><span>Check-out</span></label>
                <div class="input-group input-group-lg">
                  <input v-model="draft.checkout" class="form-control data" name="checkout" readonly disabled type="text" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button" disabled>
                      <div class="btn-calendario"></div>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Hora do check-out</span></label>
                <input v-model="draft.timecheckout" class="form-control" name="timecheckout" readonly disabled type="time" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Quarto<span class="asterisco">*</span></span></label>
                <select v-model="draft.quarto_id" class="form-control form-select2" name="quarto_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="q in props.loadOptions.quartos" :key="q.id" :value="q.id">{{ q.label }} — {{ q.unidade }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Serviço principal</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tipo</span></label>
                <select v-model="draft.servico_principal_id" class="form-control form-select2" name="servico_principal_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="s in props.loadOptions.servicoPrincipal" :key="s.id" :value="s.id">{{ s.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.servico_principal_valor" class="form-control" name="servico_principal_valor" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Serviços extras</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="addServicoExtra">
            <img src="/img/btn-novo.svg" /><span>Adicionar serviço</span>
          </button>
        </div>

        <div style="padding: 0 20px">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 32%">Serviço</th>
                <th style="width: 18%">Data</th>
                <th style="width: 16%">Hora</th>
                <th style="width: 18%">Valor</th>
                <th style="width: 16%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!draft.servicos_extras.length">
                <td colspan="99"><span class="sem-registros">Nenhum serviço extra</span></td>
              </tr>
              <tr v-for="(s, idx) in draft.servicos_extras" :key="idx">
                <td>
                  <select v-model="s.servico_id" class="form-control form-select2" :disabled="isReadOnly">
                    <option value=""></option>
                    <option v-for="opt in props.loadOptions.servicos.filter((x) => x.categoria === 'servico')" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                  </select>
                  <input type="hidden" :name="`servico_categoria_${idx}`" :value="s.servico_categoria" />
                  <input type="hidden" :name="`tempo_execucao_${idx}`" :value="s.tempo_execucao" />
                </td>
                <td>
                  <div class="input-group input-group-lg">
                    <input v-model="s.servico_data" class="form-control data" :readonly="isReadOnly" type="text" />
                    <span class="input-group-btn">
                      <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button" :disabled="isReadOnly">
                        <div class="btn-calendario"></div>
                      </button>
                    </span>
                  </div>
                </td>
                <td>
                  <input v-model="s.servico_hora" class="form-control" :readonly="isReadOnly" type="time" />
                </td>
                <td>
                  <input v-model="s.servico_valor" class="form-control" :readonly="isReadOnly" placeholder="0,00" type="text" />
                </td>
                <td style="text-align: right; vertical-align: middle">
                  <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" @click.prevent="removeServicoExtra(idx)">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="bd-callout bd-callout-info" style="margin: 0">
            <b>Total serviços:</b> R$ {{ formatMoneyBr(totalServicos) }}
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Produtos</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="addProduto">
            <img src="/img/btn-novo.svg" /><span>Adicionar produto</span>
          </button>
        </div>

        <div style="padding: 0 20px">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 38%">Produto</th>
                <th style="width: 12%">Qtd.</th>
                <th style="width: 18%">Vlr. unit.</th>
                <th style="width: 18%">Subtotal</th>
                <th style="width: 14%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!draft.produtos.length">
                <td colspan="99"><span class="sem-registros">Nenhum produto</span></td>
              </tr>
              <tr v-for="(p, idx) in draft.produtos" :key="idx">
                <td>
                  <select v-model="p.produto_id" class="form-control form-select2" :disabled="isReadOnly">
                    <option value=""></option>
                    <option v-for="opt in props.loadOptions.produtos" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                  </select>
                </td>
                <td>
                  <input v-model="p.qtd_produto" class="form-control" :readonly="isReadOnly" min="0" type="number" />
                </td>
                <td>
                  <input v-model="p.valor_unitario_produto" class="form-control" readonly disabled type="text" />
                </td>
                <td>
                  <input v-model="p.subtotal_produto" class="form-control" readonly disabled type="text" />
                </td>
                <td style="text-align: right; vertical-align: middle">
                  <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" @click.prevent="removeProduto(idx)">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="bd-callout bd-callout-info" style="margin: 0">
            <b>Total produtos:</b> R$ {{ formatMoneyBr(totalProdutos) }}
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Frete</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Serviço de frete</span></label>
                <select v-model="draft.frete.servico_id" class="form-control form-select2" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="f in freteOptions" :key="f.id" :value="f.id">{{ f.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor do frete</span></label>
                <input v-model="draft.frete.subtotal_servico" class="form-control" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12" style="display: flex; align-items: center; justify-content: space-between">
              <div class="bd-callout bd-callout-info" style="margin: 0; flex: 1">
                <b>Endereço:</b>
                <span v-if="draft.frete.endereco_cliente">definido</span>
                <span v-else>não informado</span>
              </div>
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" style="margin-left: 10px" @click.prevent="onEnderecoCliente">
                Endereço
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Total</h2>
        <div style="padding: 0 20px">
          <div class="bd-callout bd-callout-info" style="margin: 0">
            <b>Total da reserva:</b> R$ {{ formatMoneyBr(totalGeral) }}
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>

      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>

      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="step === 1 ? !hasValidTab1 : step === 2 ? !hasValidTab2 : !hasValidTab1 || !hasValidTab2">
        <span>{{ step < 3 ? 'Avançar' : props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.comandos {
  margin: 25px 0;
  text-align: right;
}
</style>
