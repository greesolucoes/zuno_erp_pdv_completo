<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createMedicamentoDraft, type MedicamentoDraft, type MedicamentoUpsertPayload } from '../../../../composables/createMedicamentoDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { MedicamentosLoadOptions } from '../../../../services/petshop/vet/cadastros/medicamentos.service'

type Mode = 'create' | 'edit' | 'view'

const CUSTOM = '__CUSTOM__'

const props = defineProps<{
  mode: Mode
  modelValue: MedicamentoDraft
  loadOptions: MedicamentosLoadOptions
  onSave?: (payload: MedicamentoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3 | 4>(1)

const { draft, reset, toPayload } = createMedicamentoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

function inferSelectChoice(value: string, options: string[]) {
  const normalized = value.trim()
  if (!normalized) return { choice: '', custom: '' }
  if (options.includes(normalized)) return { choice: normalized, custom: '' }
  return { choice: CUSTOM, custom: normalized }
}

function useCustomSelect(field: keyof MedicamentoDraft, options: string[]) {
  const ui = reactive<{ choice: string; custom: string }>({ choice: '', custom: '' })

  function syncFromDraft() {
    const inferred = inferSelectChoice(String(draft[field] ?? ''), options)
    ui.choice = inferred.choice
    ui.custom = inferred.custom
  }

  syncFromDraft()

  watch(
    () => ui.choice,
    (value) => {
      if (value === CUSTOM) (draft as any)[field] = ui.custom
      else (draft as any)[field] = value
    },
    { immediate: true },
  )

  watch(
    () => ui.custom,
    (value) => {
      if (ui.choice !== CUSTOM) return
      ;(draft as any)[field] = value
    },
  )

  watch(
    () => String(draft[field] ?? ''),
    () => syncFromDraft(),
  )

  return ui
}

const classeTerapeutica = useCustomSelect('classe_terapeutica', props.loadOptions.classeTerapeuticaOptions)
const viaAdministracao = useCustomSelect('via_administracao', props.loadOptions.viaAdministracaoOptions)
const apresentacao = useCustomSelect('apresentacao', props.loadOptions.apresentacaoOptions)
const formaDispensacao = useCustomSelect('forma_dispensacao', props.loadOptions.formaDispensacaoOptions)
const restricaoIdade = useCustomSelect('restricao_idade', props.loadOptions.restricaoIdadeOptions)
const condicaoArmazenamento = useCustomSelect('condicao_armazenamento', props.loadOptions.condicaoArmazenamentoOptions)

const classificacaoControleChoice = ref<string>('')
const classificacaoControleCustom = ref<string>('')

function inferClassificacaoControle() {
  const value = draft.classificacao_controle.trim()
  if (!value) {
    classificacaoControleChoice.value = ''
    classificacaoControleCustom.value = ''
    return
  }
  if (props.loadOptions.classificacaoControleQuickOptions.includes(value)) {
    classificacaoControleChoice.value = value
    classificacaoControleCustom.value = ''
    return
  }
  classificacaoControleChoice.value = CUSTOM
  classificacaoControleCustom.value = value
}

watch(
  () => props.loadOptions.classificacaoControleQuickOptions,
  () => inferClassificacaoControle(),
  { immediate: true },
)

watch(
  () => props.modelValue.classificacao_controle,
  () => inferClassificacaoControle(),
)

watch(
  () => classificacaoControleChoice.value,
  (value) => {
    if (value === CUSTOM) draft.classificacao_controle = classificacaoControleCustom.value
    else draft.classificacao_controle = value
  },
  { immediate: true },
)

watch(
  () => classificacaoControleCustom.value,
  (value) => {
    if (classificacaoControleChoice.value !== CUSTOM) return
    draft.classificacao_controle = value
  },
)

const selectedProduto = computed(() => props.loadOptions.produtos.find((p) => p.id === draft.produto_id) ?? null)

function requiredFilled(value: string) {
  return value.trim().length > 0
}

function canAdvanceFrom(stepValue: 1 | 2 | 3 | 4) {
  if (isReadOnly.value) return true

  if (stepValue === 1) {
    return (
      requiredFilled(draft.nome_comercial) &&
      requiredFilled(draft.nome_generico) &&
      requiredFilled(draft.classe_terapeutica) &&
      requiredFilled(draft.classe_farmacologica) &&
      requiredFilled(draft.via_administracao) &&
      requiredFilled(draft.apresentacao)
    )
  }

  if (stepValue === 2) {
    return (
      requiredFilled(draft.concentracao) &&
      requiredFilled(draft.forma_dispensacao) &&
      requiredFilled(draft.dosagem) &&
      requiredFilled(draft.frequencia) &&
      requiredFilled(draft.condicao_armazenamento)
    )
  }

  if (stepValue === 3) return true

  return requiredFilled(draft.indicacoes) && (draft.especies?.length ?? 0) > 0
}

function goToStep(target: 1 | 2 | 3 | 4) {
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
  if (step.value === 4) step.value = 3
  else if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return

  if (step.value < 4) {
    if (!canAdvanceFrom(step.value)) return
    step.value = (step.value + 1) as any
    return
  }

  if (!canAdvanceFrom(4)) return
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Informações gerais</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Administração</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : step > 3 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Estoque</span></a>
        </li>
        <li :class="step === 4 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(4)">
            <span class="round-tab">
              <img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(4)"><span class="tag-text">Orientações</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Vínculo</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Produto</span></label>
                <select v-model="draft.produto_id" class="form-control" name="produto_id" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="p in props.loadOptions.produtos" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Situação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-9">
              <div class="form-group">
                <label class="control-label">
                  <span>Status<span class="asterisco">*</span></span>
                  <a
                    data-content="Define se o medicamento está ativo para prescrição/uso no sistema."
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
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="ativo" />
                      Ativo<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                  <div class="radiobutton">
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="inativo" />
                      Inativo<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Identificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome comercial<span class="asterisco">*</span></span></label>
                <input v-model="draft.nome_comercial" class="form-control" name="nome_comercial" placeholder="Digite o nome comercial" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome genérico<span class="asterisco">*</span></span></label>
                <input v-model="draft.nome_generico" class="form-control" name="nome_generico" placeholder="Digite o nome genérico" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Classificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Classe terapêutica<span class="asterisco">*</span></span></label>
                <select v-model="classeTerapeutica.choice" class="form-control" name="classe_terapeutica_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="o in props.loadOptions.classeTerapeuticaOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="classeTerapeutica.choice === CUSTOM"
                  v-model="classeTerapeutica.custom"
                  class="form-control"
                  name="classe_terapeutica_custom"
                  placeholder="Digite a classe terapêutica"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Classe farmacológica<span class="asterisco">*</span></span></label>
                <input
                  v-model="draft.classe_farmacologica"
                  class="form-control"
                  name="classe_farmacologica"
                  placeholder="Digite a classe farmacológica"
                  :readonly="isReadOnly"
                  required
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Classificação de controle</span></label>
                <div class="radio-options">
                  <div v-for="o in props.loadOptions.classificacaoControleQuickOptions" :key="o" class="radiobutton">
                    <label>
                      <input v-model="classificacaoControleChoice" :disabled="isReadOnly" name="classificacao_controle_choice" type="radio" :value="o" />
                      {{ o }}<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                  <div class="radiobutton">
                    <label>
                      <input v-model="classificacaoControleChoice" :disabled="isReadOnly" name="classificacao_controle_choice" type="radio" :value="CUSTOM" />
                      Personalizado<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
                <input
                  v-if="classificacaoControleChoice === CUSTOM"
                  v-model="classificacaoControleCustom"
                  class="form-control"
                  name="classificacao_controle_custom"
                  placeholder="Digite a classificação de controle"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Forma</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Via de administração<span class="asterisco">*</span></span></label>
                <select v-model="viaAdministracao.choice" class="form-control" name="via_administracao_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="o in props.loadOptions.viaAdministracaoOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="viaAdministracao.choice === CUSTOM"
                  v-model="viaAdministracao.custom"
                  class="form-control"
                  name="via_administracao_custom"
                  placeholder="Digite a via"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Apresentação<span class="asterisco">*</span></span></label>
                <select v-model="apresentacao.choice" class="form-control" name="apresentacao_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="o in props.loadOptions.apresentacaoOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="apresentacao.choice === CUSTOM"
                  v-model="apresentacao.custom"
                  class="form-control"
                  name="apresentacao_custom"
                  placeholder="Digite a apresentação"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Posologia</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Concentração<span class="asterisco">*</span></span></label>
                <input v-model="draft.concentracao" class="form-control" name="concentracao" placeholder="Ex.: 250mg" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Forma de dispensação<span class="asterisco">*</span></span></label>
                <select v-model="formaDispensacao.choice" class="form-control" name="forma_dispensacao_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="o in props.loadOptions.formaDispensacaoOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="formaDispensacao.choice === CUSTOM"
                  v-model="formaDispensacao.custom"
                  class="form-control"
                  name="forma_dispensacao_custom"
                  placeholder="Digite a forma de dispensação"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Dosagem<span class="asterisco">*</span></span></label>
                <input v-model="draft.dosagem" class="form-control" name="dosagem" placeholder="Ex.: 10mg/kg" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Frequência<span class="asterisco">*</span></span></label>
                <input v-model="draft.frequencia" class="form-control" name="frequencia" placeholder="Ex.: 12/12h" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Duração</span></label>
                <input v-model="draft.duracao" class="form-control" name="duracao" placeholder="Ex.: 7 dias" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Restrição de idade</span></label>
                <select v-model="restricaoIdade.choice" class="form-control" name="restricao_idade_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.restricaoIdadeOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="restricaoIdade.choice === CUSTOM"
                  v-model="restricaoIdade.custom"
                  class="form-control"
                  name="restricao_idade_custom"
                  placeholder="Digite a restrição"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Restrições e conservação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Condição de armazenamento<span class="asterisco">*</span></span></label>
                <select v-model="condicaoArmazenamento.choice" class="form-control" name="condicao_armazenamento_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="o in props.loadOptions.condicaoArmazenamentoOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="condicaoArmazenamento.choice === CUSTOM"
                  v-model="condicaoArmazenamento.custom"
                  class="form-control"
                  name="condicao_armazenamento_custom"
                  placeholder="Digite a condição de armazenamento"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Validade</span></label>
                <input v-model="draft.validade" class="form-control" name="validade" placeholder="Ex.: 24 meses" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Logística</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Fornecedor</span></label>
                <input v-model="draft.fornecedor" class="form-control" name="fornecedor" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>SKU</span></label>
                <input v-model="draft.sku" class="form-control" name="sku" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 3">
      <div class="pnlCollapse semi-aberto">
        <h2>Estoque</h2>
        <div class="retratil">
          <div v-if="!draft.produto_id" class="bd-callout bd-callout-info">
            Selecione um produto para visualizar o estoque.
          </div>

          <div v-else style="padding: 0 20px">
            <div class="row" style="margin-top: 5px; margin-bottom: 0">
              <div class="col-md-6">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Estoque atual</span></label>
                  <input class="form-control" :value="String(selectedProduto?.current_stock ?? '')" readonly type="text" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Estoque mínimo</span></label>
                  <input class="form-control" :value="String(selectedProduto?.minimum_stock ?? '')" readonly type="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Aplicação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Espécies<span class="asterisco">*</span></span></label>
                <select v-model="draft.especies" class="form-control" name="especies" :disabled="isReadOnly" multiple required style="min-height: 140px">
                  <option v-for="e in props.loadOptions.especies" :key="e.id" :value="e.id">{{ e.label }}</option>
                </select>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Indicações<span class="asterisco">*</span></span></label>
                <textarea
                  v-model="draft.indicacoes"
                  class="form-control"
                  name="indicacoes"
                  placeholder="Descreva as indicações"
                  :readonly="isReadOnly"
                  required
                  rows="6"
                  style="resize: none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Segurança</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Contraindicações</span></label>
                <textarea v-model="draft.contraindicacoes" class="form-control" name="contraindicacoes" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Efeitos adversos</span></label>
                <textarea v-model="draft.efeitos_adversos" class="form-control" name="efeitos_adversos" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Interações</span></label>
                <textarea v-model="draft.interacoes" class="form-control" name="interacoes" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Acompanhamento e instrução</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Monitoramento</span></label>
                <textarea v-model="draft.monitoramento" class="form-control" name="monitoramento" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Orientações ao tutor</span></label>
                <textarea
                  v-model="draft.orientacoes_tutor"
                  class="form-control"
                  name="orientacoes_tutor"
                  :readonly="isReadOnly"
                  rows="4"
                  style="resize: none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Interno</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observações</span></label>
                <textarea v-model="draft.observacoes" class="form-control" name="observacoes" :readonly="isReadOnly" rows="6" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>
      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>{{ step < 4 ? 'Avançar' : props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>
