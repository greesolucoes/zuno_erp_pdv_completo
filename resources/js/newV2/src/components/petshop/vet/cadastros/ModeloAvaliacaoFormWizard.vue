<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  createModeloAvaliacaoDraft,
  type ModeloAvaliacaoDraft,
  type ModeloAvaliacaoFieldDraft,
  type ModeloAvaliacaoFieldType,
  type ModeloAvaliacaoUpsertPayload,
} from '../../../../composables/createModeloAvaliacaoDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { ModeloAvaliacaoLoadOptions } from '../../../../services/petshop/vet/cadastros/modeloAvaliacao.service'

type Mode = 'create' | 'edit' | 'view'

const CUSTOM = '__CUSTOM__'

const props = defineProps<{
  mode: Mode
  modelValue: ModeloAvaliacaoDraft
  loadOptions: ModeloAvaliacaoLoadOptions
  onSave?: (payload: ModeloAvaliacaoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload, emptyField } = createModeloAvaliacaoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

const categoryChoice = ref<string>('')
const customCategory = ref<string>('')

function inferCategory() {
  const value = draft.category.trim()
  if (!value) {
    categoryChoice.value = ''
    customCategory.value = ''
    return
  }
  if (props.loadOptions.categories.includes(value)) {
    categoryChoice.value = value
    customCategory.value = ''
    return
  }
  categoryChoice.value = CUSTOM
  customCategory.value = value
}

watch(
  () => props.loadOptions.categories,
  () => inferCategory(),
  { immediate: true },
)

watch(
  () => categoryChoice.value,
  (value) => {
    if (value === CUSTOM) draft.category = customCategory.value
    else draft.category = value
  },
  { immediate: true },
)

watch(
  () => customCategory.value,
  (value) => {
    if (categoryChoice.value !== CUSTOM) return
    draft.category = value
  },
)

watch(
  () => draft.category,
  () => inferCategory(),
)

const hasValidTab1 = computed(() => {
  const titleOk = draft.title.trim().length > 0
  const categoryOk = draft.category.trim().length > 0
  return titleOk && categoryOk && (draft.status === 'ativo' || draft.status === 'inativo')
})

const hasAtLeastOneField = computed(() => {
  return (draft.fields ?? []).some((f) => f.label.trim().length > 0 && String(f.type).trim().length > 0)
})

function addField(atIndex?: number) {
  if (isReadOnly.value) return
  const index = typeof atIndex === 'number' ? atIndex : draft.fields.length
  draft.fields.splice(index, 0, { ...emptyField })
}

function removeField(index: number) {
  if (isReadOnly.value) return
  if (draft.fields.length <= 1) {
    Object.assign(draft.fields[0]!, emptyField)
    return
  }
  draft.fields.splice(index, 1)
}

function moveFieldUp(index: number) {
  if (isReadOnly.value) return
  if (index <= 0) return
  const field = draft.fields[index]!
  draft.fields.splice(index, 1)
  draft.fields.splice(index - 1, 0, field)
}

function moveFieldDown(index: number) {
  if (isReadOnly.value) return
  if (index >= draft.fields.length - 1) return
  const field = draft.fields[index]!
  draft.fields.splice(index, 1)
  draft.fields.splice(index + 1, 0, field)
}

function applyTemplate(templateId: string) {
  if (isReadOnly.value) return
  const t = String(templateId || '').trim()
  if (!t) return

  const next: ModeloAvaliacaoFieldDraft[] = []

  if (t === 'basico') {
    next.push(
      { ...emptyField, label: 'Peso (kg)', type: 'numero_decimal', placeholder: 'Ex.: 12.5' },
      { ...emptyField, label: 'Temperatura (°C)', type: 'numero_decimal', placeholder: 'Ex.: 38.5' },
      { ...emptyField, label: 'Observações', type: 'texto_longo', textarea_placeholder: 'Digite as observações...' },
    )
  } else if (t === 'consulta') {
    next.push(
      { ...emptyField, label: 'Queixa principal', type: 'texto_longo', textarea_placeholder: 'Descreva a queixa...' },
      { ...emptyField, label: 'Anamnese', type: 'rich_text', rich_text_default: '' },
      { ...emptyField, label: 'Conduta', type: 'texto_longo', textarea_placeholder: 'Descreva a conduta...' },
    )
  } else if (t === 'internacao') {
    next.push(
      { ...emptyField, label: 'Evolução', type: 'texto_longo', textarea_placeholder: 'Evolução do paciente...' },
      { ...emptyField, label: 'Sinais vitais', type: 'texto_curto', placeholder: 'Ex.: FC/FR/Temp' },
    )
  }

  if (!next.length) return
  draft.fields = next
}

function hasOptions(type: string) {
  return type === 'select' || type === 'multi_select' || type === 'radio_group' || type === 'checkbox_group'
}

function optionsForType(field: ModeloAvaliacaoFieldDraft) {
  const t = String(field.type)
  if (t === 'select') return { key: 'select_options', label: 'Opções (uma por linha)' }
  if (t === 'multi_select') return { key: 'multi_select_options', label: 'Opções (uma por linha)' }
  if (t === 'radio_group') return { key: 'radio_group_options', label: 'Opções (uma por linha)' }
  if (t === 'checkbox_group') return { key: 'checkbox_group_options', label: 'Opções (uma por linha)' }
  return null
}

function canAdvanceFrom(stepValue: 1 | 2 | 3) {
  if (isReadOnly.value) return true
  if (stepValue === 1) return hasValidTab1.value
  if (stepValue === 2) return hasAtLeastOneField.value
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

async function onSaveDraft() {
  if (isReadOnly.value) return
  if (!hasValidTab1.value) return
  await props.onSave?.(toPayload())
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value < 3) {
    if (!canAdvanceFrom(step.value)) return
    step.value = (step.value + 1) as any
    return
  }
  if (!hasValidTab1.value) return
  await props.onSave?.(toPayload())
}

const showSimulacao = ref(false)

const validationIssues = computed(() => {
  const issues: string[] = []
  if (!hasValidTab1.value) issues.push('Preencha Título e Categoria (Tab 1).')
  if (!hasAtLeastOneField.value) issues.push('Adicione ao menos 1 campo com label e tipo (Tab 2).')

  for (const [idx, f] of (draft.fields ?? []).entries()) {
    if (!f.label.trim() && !String(f.type).trim()) continue
    if (!f.label.trim() || !String(f.type).trim()) issues.push(`Campo ${idx + 1}: label e tipo são obrigatórios.`)
    if (hasOptions(String(f.type))) {
      const meta = optionsForType(f)
      const raw = meta ? String((f as any)[meta.key] ?? '').trim() : ''
      if (!raw) issues.push(`Campo ${idx + 1}: opções precisam ser informadas.`)
    }
  }

  return issues
})

function typeLabel(typeValue: string) {
  return props.loadOptions.fieldTypes.find((t) => t.value === typeValue)?.label ?? typeValue
}

function previewComponentTag(typeValue: string) {
  const t = typeValue as ModeloAvaliacaoFieldType
  if (t === 'texto_longo') return 'textarea'
  if (t === 'rich_text') return 'textarea'
  if (t === 'checkbox') return 'checkbox'
  if (t === 'select' || t === 'multi_select' || t === 'radio_group' || t === 'checkbox_group') return 'options'
  return 'input'
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Layout</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Revisão</span></a>
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
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Identificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Título<span class="asterisco">*</span></span></label>
                <input v-model="draft.title" class="form-control" name="title" placeholder="Digite o título do modelo" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Categoria</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria<span class="asterisco">*</span></span></label>
                <select v-model="categoryChoice" class="form-control" name="category_choice" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="c in props.loadOptions.categories" :key="c" :value="c">{{ c }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="categoryChoice === CUSTOM"
                  v-model="customCategory"
                  class="form-control"
                  name="custom_category"
                  placeholder="Digite a categoria"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Status<span class="asterisco">*</span></span></label>
                <div class="radio-options">
                  <div v-for="s in props.loadOptions.status" :key="s.value" class="radiobutton">
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" :value="s.value" />
                      {{ s.label }}<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Observações</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Notas</span></label>
                <textarea v-model="draft.notes" class="form-control" name="notes" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Começar rápido</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                Use um template para preencher o construtor com campos iniciais. Você pode editar tudo depois.
              </div>
            </div>
            <div class="col-md-4">
              <select class="form-control" :disabled="isReadOnly" @change="applyTemplate(($event.target as HTMLSelectElement).value)">
                <option value="">Selecione um template</option>
                <option v-for="t in props.loadOptions.templates" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Campos do modelo</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12" style="display: flex; justify-content: space-between; align-items: center; gap: 10px">
              <div class="bd-callout bd-callout-info" style="margin: 0; flex: 1">
                Adicione os campos do modelo. Cada campo precisa de <strong>Label</strong> e <strong>Tipo</strong>.
              </div>
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-primary" @click.prevent="addField()">
                <img src="/img/btn-novo.svg" /><span>Adicionar campo</span>
              </button>
            </div>
          </div>

          <div class="row" style="margin-top: 15px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="list-group">
                <div v-for="(field, idx) in draft.fields" :key="idx" class="list-group-item" style="padding: 15px">
                  <div class="row" style="margin: 0">
                    <div class="col-md-12">
                      <label class="control-label" style="margin-bottom: 8px">
                        <span>Campo {{ idx + 1 }}<span v-if="idx === 0" class="asterisco">*</span></span>
                      </label>
                    </div>
                  </div>

                  <div class="row" style="margin: 0">
                    <div class="col-md-10">
                      <div class="form-group form-group-lg" style="margin: 0">
                        <label class="control-label"><span>Label<span class="asterisco">*</span></span></label>
                        <input v-model="field.label" class="form-control" :readonly="isReadOnly" placeholder="Ex.: Peso (kg)" type="text" />
                      </div>
                    </div>
                    <div class="col-md-2" style="display: flex; gap: 8px; align-items: center; justify-content: flex-end">
                      <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Subir" @click.prevent="moveFieldUp(idx)">↑</button>
                      <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Descer" @click.prevent="moveFieldDown(idx)">↓</button>
                      <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Remover" @click.prevent="removeField(idx)">×</button>
                    </div>
                  </div>

                  <div class="row" style="margin-top: 10px; margin-bottom: 0">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="control-label"><span>Tipo<span class="asterisco">*</span></span></label>
                        <div class="radio-options">
                          <div v-for="t in props.loadOptions.fieldTypes" :key="t.value" class="radiobutton inline">
                            <label>
                              <input v-model="field.type" :disabled="isReadOnly" :name="`field_type_${idx}`" type="radio" :value="t.value" />
                              {{ t.label }}<span class="cr"><i class="cr-icon"></i></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <template v-if="field.type === 'texto_curto'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Placeholder</span></label>
                          <input v-model="field.placeholder" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'texto_longo'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Placeholder do textarea</span></label>
                          <input v-model="field.textarea_placeholder" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'numero_decimal'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Mínimo</span></label>
                          <input v-model="field.number_min" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Máximo</span></label>
                          <input v-model="field.number_max" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'inteiro'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Mínimo</span></label>
                          <input v-model="field.integer_min" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Máximo</span></label>
                          <input v-model="field.integer_max" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'data'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Dica</span></label>
                          <input v-model="field.date_hint" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'hora'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Dica</span></label>
                          <input v-model="field.time_hint" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'data_hora'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Dica</span></label>
                          <input v-model="field.datetime_hint" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'email'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Placeholder</span></label>
                          <input v-model="field.email_placeholder" class="form-control" :readonly="isReadOnly" placeholder="Ex.: email@dominio.com" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'phone'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Placeholder</span></label>
                          <input v-model="field.phone_placeholder" class="form-control" :readonly="isReadOnly" placeholder="Ex.: (11) 99999-9999" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'file'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Tipos de arquivo</span></label>
                          <input v-model="field.file_types" class="form-control" :readonly="isReadOnly" placeholder="Ex.: .pdf,.jpg" type="text" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Tamanho máximo</span></label>
                          <input v-model="field.file_max_size" class="form-control" :readonly="isReadOnly" placeholder="Ex.: 10MB" type="text" />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'checkbox'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Label marcado</span></label>
                          <input v-model="field.checkbox_label_checked" class="form-control" :readonly="isReadOnly" placeholder="Ex.: Sim" type="text" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Label desmarcado</span></label>
                          <input v-model="field.checkbox_label_unchecked" class="form-control" :readonly="isReadOnly" placeholder="Ex.: Não" type="text" />
                        </div>
                      </div>
                    </div>

                    <div class="row" style="margin-top: 5px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group">
                          <label class="control-label"><span>Padrão</span></label>
                          <div class="radio-options">
                            <div class="radiobutton inline">
                              <label>
                                <input v-model="field.checkbox_default" :disabled="isReadOnly" :name="`checkbox_default_${idx}`" type="radio" value="S" />
                                Marcado<span class="cr"><i class="cr-icon"></i></span>
                              </label>
                            </div>
                            <div class="radiobutton inline">
                              <label>
                                <input v-model="field.checkbox_default" :disabled="isReadOnly" :name="`checkbox_default_${idx}`" type="radio" value="N" />
                                Desmarcado<span class="cr"><i class="cr-icon"></i></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="field.type === 'rich_text'">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>Texto padrão</span></label>
                          <textarea v-model="field.rich_text_default" class="form-control" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="hasOptions(String(field.type))">
                    <div class="row" style="margin-top: 10px; margin-bottom: 0">
                      <div class="col-md-12">
                        <div class="form-group form-group-lg">
                          <label class="control-label"><span>{{ optionsForType(field)?.label }}</span></label>
                          <textarea
                            v-model="(field as any)[optionsForType(field)?.key ?? 'select_options']"
                            class="form-control"
                            :readonly="isReadOnly"
                            rows="5"
                            style="resize: none"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <template v-if="field.type === 'radio_group'">
                      <div class="row" style="margin-top: 5px; margin-bottom: 0">
                        <div class="col-md-12">
                          <div class="form-group form-group-lg">
                            <label class="control-label"><span>Valor padrão</span></label>
                            <input v-model="field.radio_group_default" class="form-control" :readonly="isReadOnly" placeholder="(opcional)" type="text" />
                          </div>
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Checklist de validação</h2>
        <div class="retratil">
          <div v-if="!validationIssues.length" class="bd-callout bd-callout-info">Tudo certo. Você pode salvar o modelo.</div>
          <div v-else class="bd-callout bd-callout-danger">
            <div>Revise os pontos abaixo:</div>
            <ul style="margin-top: 10px">
              <li v-for="(issue, idx) in validationIssues" :key="idx">{{ issue }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Simulação</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <button type="button" class="btn btn-lg btn-info" @click.prevent="showSimulacao = !showSimulacao">
            {{ showSimulacao ? 'Ocultar simulação' : 'Visualizar simulação' }}
          </button>
        </div>

        <div v-if="showSimulacao" style="padding: 0 20px">
          <div class="bd-callout bd-callout-info">Pré-visualização simples do formulário gerado.</div>
          <div v-for="(field, idx) in draft.fields" :key="idx" style="margin-bottom: 15px">
            <template v-if="field.label.trim() && String(field.type).trim()">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>{{ field.label }}</span></label>

                <input
                  v-if="previewComponentTag(String(field.type)) === 'input'"
                  class="form-control"
                  :placeholder="field.placeholder || ''"
                  disabled
                  type="text"
                />

                <textarea
                  v-else-if="previewComponentTag(String(field.type)) === 'textarea'"
                  class="form-control"
                  :placeholder="field.textarea_placeholder || ''"
                  disabled
                  rows="4"
                  style="resize: none"
                ></textarea>

                <div v-else-if="previewComponentTag(String(field.type)) === 'checkbox'" class="checkbox">
                  <label>
                    <input disabled type="checkbox" :checked="field.checkbox_default === 'S'" />
                    <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                    <span class="cr-text">{{ field.checkbox_label_checked || 'Marcado' }}</span>
                  </label>
                </div>

                <div v-else class="bd-callout bd-callout-info" style="margin: 0">
                  {{ typeLabel(String(field.type)) }} — configure as opções no construtor.
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>

      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>

      <button v-if="!isReadOnly && hasValidTab1" type="button" class="btn btn-lg btn-info" style="margin-right: 10px" @click.prevent="onSaveDraft">
        Salvar rascunho
      </button>

      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="step === 1 ? !hasValidTab1 : step === 2 ? !hasAtLeastOneField : !!validationIssues.length">
        <span>{{ step < 3 ? 'Avançar' : props.mode === 'edit' ? 'Salvar modelo' : 'Salvar modelo' }}</span><img src="/img/btn-avancar.svg" />
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

