<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createEsteticaDraft, type EsteticaDraft, type EsteticaProduto, type EsteticaServico, type EsteticaUpsertPayload } from '../../../composables/createEsteticaDraft'
import type { EsteticaLoadOptions } from '../../../services/petshop/estetica/estetica.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: EsteticaDraft
  loadOptions: EsteticaLoadOptions
  onSave?: (payload: EsteticaUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createEsteticaDraft(props.modelValue)

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
  () => [step.value, draft.servicos.length, draft.produtos.length],
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

const estadoLocked = computed(() => props.mode === 'create')

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

function emptyServico(): EsteticaServico {
  return { servico_id: '', subtotal_servico: '', tempo_execucao: '' }
}

function addServico() {
  if (isReadOnly.value) return
  draft.servicos.push(emptyServico())
}

function removeServico(index: number) {
  if (isReadOnly.value) return
  draft.servicos.splice(index, 1)
}

function applyServicoMeta(row: EsteticaServico) {
  const opt = props.loadOptions.servicos.find((s) => s.id === row.servico_id) ?? null
  row.tempo_execucao = opt?.tempo_execucao ?? ''
  if (!String(row.subtotal_servico ?? '').trim() && opt?.valor) row.subtotal_servico = opt.valor
}

watch(
  () => draft.servicos,
  (rows) => {
    for (const r of rows) applyServicoMeta(r)
  },
  { deep: true, immediate: true },
)

function emptyProduto(): EsteticaProduto {
  return { produto_id: '', qtd_produto: '1', valor_unitario_produto: '', subtotal_produto: '' }
}

function addProduto() {
  if (isReadOnly.value) return
  draft.produtos.push(emptyProduto())
}

function removeProduto(index: number) {
  if (isReadOnly.value) return
  draft.produtos.splice(index, 1)
}

function applyProdutoMeta(row: EsteticaProduto) {
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

const totalServicos = computed(() => (draft.servicos ?? []).reduce((sum, s) => sum + parseMoneyBr(s.subtotal_servico), 0))
const totalProdutos = computed(() => (draft.produtos ?? []).reduce((sum, p) => sum + parseMoneyBr(p.subtotal_produto), 0))
const totalGeral = computed(() => totalServicos.value + totalProdutos.value + parseMoneyBr(draft.frete?.subtotal_servico ?? ''))

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

const hasValidTab1 = computed(() => {
  const petOk = String(draft.animal_id ?? '').trim().length > 0
  const colOk = String(draft.colaborador_id ?? '').trim().length > 0
  return petOk && colOk
})

const hasValidTab3 = computed(() => {
  const dataOk = String(draft.data_agendamento ?? '').trim().length > 0
  const inicioOk = String(draft.horario_agendamento ?? '').trim().length > 0
  const fimOk = String(draft.horario_saida ?? '').trim().length > 0
  return dataOk && inicioOk && fimOk
})

function canAdvanceFrom(stepValue: 1 | 2 | 3) {
  if (isReadOnly.value) return true
  if (stepValue === 1) return hasValidTab1.value
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
  if (!hasValidTab1.value || !hasValidTab3.value) return
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Informações</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Itens</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Agendamento</span></a>
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

    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Informações gerais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Ordem de serviço</span></label>
                <input v-model="draft.ordem_servico" class="form-control" name="ordem_servico" placeholder="Gerada automaticamente" readonly type="text" />
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
                <label class="control-label"><span>Colaborador<span class="asterisco">*</span></span></label>
                <select v-model="draft.colaborador_id" class="form-control form-select2" name="colaborador_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="c in props.loadOptions.colaboradores" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Situação<span class="asterisco">*</span></span></label>
                <select v-model="draft.estado" class="form-control" name="estado" :disabled="isReadOnly || estadoLocked" required>
                  <option v-for="s in props.loadOptions.estados" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                <div v-if="estadoLocked" class="bd-callout bd-callout-info" style="margin: 10px 0 0">
                  Situação é definida como <b>Agendado</b> na criação.
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
        <h2>Serviços</h2>
        <div v-if="!isReadOnly" style="padding: 0 20px 15px; margin-top: 10px">
          <button type="button" class="btn btn-lg btn-info" @click.prevent="addServico">
            <img src="/img/btn-novo.svg" /><span>Adicionar serviço</span>
          </button>
        </div>

        <div style="padding: 0 20px">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 60%">Serviço</th>
                <th style="width: 25%">Valor</th>
                <th style="width: 15%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!draft.servicos.length">
                <td colspan="99"><span class="sem-registros">Nenhum serviço</span></td>
              </tr>
              <tr v-for="(s, idx) in draft.servicos" :key="idx">
                <td>
                  <select v-model="s.servico_id" class="form-control form-select2" :disabled="isReadOnly">
                    <option value=""></option>
                    <option v-for="opt in props.loadOptions.servicos" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                  </select>
                  <input type="hidden" :name="`tempo_execucao_${idx}`" :value="s.tempo_execucao" />
                </td>
                <td>
                  <input v-model="s.subtotal_servico" class="form-control" :readonly="isReadOnly" placeholder="0,00" type="text" />
                </td>
                <td style="text-align: right; vertical-align: middle">
                  <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" @click.prevent="removeServico(idx)">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Produtos</h2>
        <div v-if="!isReadOnly" style="padding: 0 20px 15px; margin-top: 10px">
          <button type="button" class="btn btn-lg btn-info" @click.prevent="addProduto">
            <img src="/img/btn-novo.svg" /><span>Adicionar produto</span>
          </button>
        </div>

        <div style="padding: 0 20px">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 40%">Produto</th>
                <th style="width: 10%">Qtd.</th>
                <th style="width: 20%">Vlr. unit.</th>
                <th style="width: 20%">Subtotal</th>
                <th style="width: 10%"></th>
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
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Frete</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor do frete</span></label>
                <input v-model="draft.frete.subtotal_servico" class="form-control" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6" style="display: flex; align-items: end; justify-content: flex-end">
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="onEnderecoCliente">Endereço</button>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                <b>Endereço:</b> {{ draft.frete.endereco_cliente ? 'definido' : 'não informado' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Total</h2>
        <div style="padding: 0 20px">
          <div class="bd-callout bd-callout-info" style="margin: 0">
            <b>Total:</b> R$ {{ formatMoneyBr(totalGeral) }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Agendamento</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group">
                <label class="control-label"><span>Data<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <input v-model="draft.data_agendamento" class="form-control data" name="data_agendamento" :readonly="isReadOnly" required type="text" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button" :disabled="isReadOnly">
                      <div class="btn-calendario"></div>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Horário (início)<span class="asterisco">*</span></span></label>
                <input v-model="draft.horario_agendamento" class="form-control" name="horario_agendamento" :readonly="isReadOnly" required type="time" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Horário (fim)<span class="asterisco">*</span></span></label>
                <input v-model="draft.horario_saida" class="form-control" name="horario_saida" :readonly="isReadOnly" required type="time" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Informações do dia (JS)</h2>
        <div class="retratil" style="padding: 10px 20px">
          <div class="bd-callout bd-callout-info">Este bloco é preenchido por JS no legado (horário de funcionamento, intervalos e restrições).</div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Agendamentos do dia (JS)</h2>
        <div class="retratil" style="padding: 10px 20px">
          <div class="bd-callout bd-callout-info">Lista operacional preenchida por JS no legado.</div>
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

      <button
        v-if="!isReadOnly"
        id="btnAvancar"
        type="submit"
        class="btn btn-lg btn-primary direita has-spin"
        :disabled="step === 1 ? !hasValidTab1 : step === 3 ? !hasValidTab1 || !hasValidTab3 : !hasValidTab1"
      >
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

