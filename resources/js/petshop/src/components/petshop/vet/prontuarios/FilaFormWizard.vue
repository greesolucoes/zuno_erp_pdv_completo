<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createFilaProntuarioDraft, type FilaProntuarioDraft, type FilaProntuarioUpsertPayload, type TipoAtendimento } from '../../../../composables/createFilaProntuarioDraft'
import type { FilaProntuarioLoadOptions, SlotOption } from '../../../../services/petshop/vet/prontuarios/fila.service'
import { initLegacyUiBindings, loadLegacyScriptOnce, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: FilaProntuarioDraft
  loadOptions: FilaProntuarioLoadOptions
  onSave?: (payload: FilaProntuarioUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createFilaProntuarioDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

const initialPacienteId = String(props.modelValue?.paciente_id ?? '')

const pacienteLocked = computed(() => {
  if (props.mode !== 'create') return true
  return Boolean(initialPacienteId)
})

const slotMode = computed(() => (props.loadOptions.slots.length <= 12 ? 'chips' : 'select'))

function canAdvanceFrom(stepValue: 1 | 2 | 3) {
  if (isReadOnly.value) return true
  if (stepValue === 1) {
    const vetOk = draft.veterinario_id.trim().length > 0
    const tipoOk = draft.tipo_atendimento.trim().length > 0
    const slotOk = draft.slot.trim().length > 0
    const pacienteOk = draft.paciente_id.trim().length > 0
    return vetOk && tipoOk && slotOk && pacienteOk
  }
  return true
}

function goToStep(target: 1 | 2 | 3) {
  if (target <= step.value) {
    step.value = target
    return
  }
  if (canAdvanceFrom(step.value)) step.value = target
}

function onBack() {
  if (step.value === 2) step.value = 1
  else if (step.value === 3) step.value = 2
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value === 1) {
    if (!canAdvanceFrom(1)) return
    step.value = 2
    return
  }
  if (step.value === 2) {
    step.value = 3
    return
  }
  await props.onSave?.(toPayload())
}

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

watch(
  () => step.value,
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

const tipoOptions = computed(() => props.loadOptions.tiposAtendimento)

function setTipo(value: TipoAtendimento) {
  if (isReadOnly.value) return
  draft.tipo_atendimento = value
}

const slotOptions = computed<SlotOption[]>(() => props.loadOptions.slots)

function setSlot(slot: string) {
  if (isReadOnly.value) return
  draft.slot = slot
}

function selectedVeterinarioLabel() {
  return props.loadOptions.veterinarios.find((v) => v.id === draft.veterinario_id)?.label ?? ''
}

function selectedPaciente() {
  return props.loadOptions.pacientes.find((p) => p.id === draft.paciente_id) ?? null
}

// Resumo rápido (TinyMCE)
const editorId = `fila-prontuario-highlights-${Math.random().toString(36).slice(2)}`
const editorReady = ref(false)
let editorInstance: any | null = null

function destroyEditor() {
  try {
    const w = window as any
    w?.tinymce?.get?.(editorId)?.remove?.()
  } catch {
    // ignore
  }
  editorInstance = null
  editorReady.value = false
}

async function initEditor() {
  if (editorReady.value) return
  try {
    await loadLegacyScriptOnce({
      id: 'legacy-tinymce',
      src: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js',
    })
  } catch {
    return
  }

  await nextTick()

  const w = window as any
  const tinymce = w?.tinymce
  if (!tinymce) return

  destroyEditor()

  tinymce.init({
    selector: `#${editorId}`,
    height: 280,
    menubar: false,
    statusbar: false,
    plugins: 'lists link fullscreen',
    toolbar: isReadOnly.value ? false : 'undo redo | bold italic underline | bullist numlist | link | fullscreen',
    branding: false,
    setup: (editor: any) => {
      editorInstance = editor

      editor.on('init', () => {
        editorReady.value = true
        editor.setContent(draft.resumo_rapido || '')
        if (isReadOnly.value && editor?.mode?.set) editor.mode.set('readonly')
      })

      editor.on('change keyup setcontent', () => {
        if (isReadOnly.value) return
        const html = editor.getContent()
        if (draft.resumo_rapido !== html) draft.resumo_rapido = html
      })
    },
  })
}

watch(
  () => step.value,
  async (value) => {
    if (value !== 1) return
    await initEditor()
  },
  { immediate: true },
)

watch(
  () => draft.resumo_rapido,
  (value) => {
    if (!editorInstance) return
    if (!editorReady.value) return
    try {
      const current = editorInstance.getContent()
      if (current !== value) editorInstance.setContent(value || '')
    } catch {
      // ignore
    }
  },
)

function toggleFullscreen() {
  if (!editorInstance) return
  try {
    editorInstance.execCommand('mceFullScreen')
  } catch {
    // ignore
  }
}

// Avaliação dinâmica
const selectedModelo = computed(() => {
  if (!draft.modelo_avaliacao_id) return null
  return props.loadOptions.modelosAvaliacao.find((m) => m.id === draft.modelo_avaliacao_id) ?? null
})

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function fieldKey(label: string, index: number) {
  const base = slugify(label) || `campo_${index + 1}`
  return `${base}_${index + 1}`
}

type RenderField = {
  key: string
  label: string
  type: string
  placeholder?: string
  textarea_placeholder?: string
  number_min?: string
  number_max?: string
  integer_min?: string
  integer_max?: string
  select_options?: string
  multi_select_options?: string
  radio_group_options?: string
  radio_group_default?: string
  checkbox_default?: string
  checkbox_label_checked?: string
  checkbox_label_unchecked?: string
  checkbox_group_options?: string
}

const avaliacaoFields = computed<RenderField[]>(() => {
  const modelo = selectedModelo.value
  if (!modelo) return []

  return (modelo.fields ?? []).map((f: any, idx: number) => ({
    key: fieldKey(String(f?.label ?? `Campo ${idx + 1}`), idx),
    label: String(f?.label ?? `Campo ${idx + 1}`),
    type: String(f?.type ?? 'texto_curto'),
    placeholder: String(f?.placeholder ?? ''),
    textarea_placeholder: String(f?.textarea_placeholder ?? ''),
    number_min: String(f?.number_min ?? ''),
    number_max: String(f?.number_max ?? ''),
    integer_min: String(f?.integer_min ?? ''),
    integer_max: String(f?.integer_max ?? ''),
    select_options: String(f?.select_options ?? ''),
    multi_select_options: String(f?.multi_select_options ?? ''),
    radio_group_options: String(f?.radio_group_options ?? ''),
    radio_group_default: String(f?.radio_group_default ?? ''),
    checkbox_default: String(f?.checkbox_default ?? ''),
    checkbox_label_checked: String(f?.checkbox_label_checked ?? ''),
    checkbox_label_unchecked: String(f?.checkbox_label_unchecked ?? ''),
    checkbox_group_options: String(f?.checkbox_group_options ?? ''),
  }))
})

function ensureAvaliacaoDefaults() {
  const fields = avaliacaoFields.value
  if (!fields.length) return
  for (const f of fields) {
    if (draft.avaliacao_campos[f.key] !== undefined) continue
    if (f.type === 'checkbox') {
      draft.avaliacao_campos[f.key] = f.checkbox_default === 'S'
      continue
    }
    if (f.type === 'checkbox_group' || f.type === 'multi_select') {
      draft.avaliacao_campos[f.key] = []
      continue
    }
    if (f.type === 'radio_group' && f.radio_group_default) {
      draft.avaliacao_campos[f.key] = f.radio_group_default
      continue
    }
    draft.avaliacao_campos[f.key] = ''
  }
}

watch(
  () => draft.modelo_avaliacao_id,
  () => ensureAvaliacaoDefaults(),
  { immediate: true },
)

function parseOptions(input: string) {
  return (input ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Checklist assistencial
function checklistArray(id: string): string[] {
  const current = draft.checklists?.[id]
  return Array.isArray(current) ? current : []
}

function toggleChecklistItem(checklistId: string, itemIndex: number) {
  if (isReadOnly.value) return
  const key = String(itemIndex)
  const current = new Set(checklistArray(checklistId))
  if (current.has(key)) current.delete(key)
  else current.add(key)
  draft.checklists[checklistId] = Array.from(current.values())
}

// Anexos
function handleFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  draft.anexos = files.map((f) => JSON.stringify({ name: f.name, size: f.size, type: f.type }))
}

onBeforeUnmount(() => {
  destroyEditor()
})
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Atendimento</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Avaliação</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : step > 3 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Documentação</span></a>
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
    <input v-model="draft.prontuario_id" type="hidden" name="prontuario_id" />
    <input v-model="draft.atendimento_id" type="hidden" name="atendimento_id" />
    <input v-model="draft.status" type="hidden" name="status" />
    <input v-model="draft.paciente_id" type="hidden" name="paciente_id" />

    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Paciente e responsável</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Paciente<span class="asterisco">*</span></span></label>
                <select
                  v-model="draft.paciente_id"
                  class="form-control form-select2"
                  name="paciente_select"
                  :disabled="isReadOnly || pacienteLocked"
                  required
                >
                  <option value=""></option>
                  <option v-for="p in props.loadOptions.pacientes" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Profissional responsável<span class="asterisco">*</span></span></label>
                <select v-model="draft.veterinario_id" class="form-control form-select2" name="veterinario_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="v in props.loadOptions.veterinarios" :key="v.id" :value="v.id">{{ v.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                <div><b>Tutor:</b> {{ selectedPaciente()?.tutor_nome ?? '-' }}</div>
                <div><b>Contato:</b> {{ selectedPaciente()?.contato_tutor ?? '-' }}</div>
                <div><b>E-mail:</b> {{ selectedPaciente()?.email_tutor ?? '-' }}</div>
                <div v-if="selectedVeterinarioLabel()"><b>Responsável:</b> {{ selectedVeterinarioLabel() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Tipo de atendimento</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Selecione uma opção<span class="asterisco">*</span></span></label>
                <div class="radio-options">
                  <div v-for="t in tipoOptions" :key="t.value" class="radiobutton">
                    <label>
                      <input v-model="draft.tipo_atendimento" :disabled="isReadOnly" name="tipo_atendimento" type="radio" :value="t.value" @change="setTipo(t.value)" />
                      {{ t.label }}<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Agendamento (data e horário)</h2>
        <div style="padding: 0 20px 20px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Slot<span class="asterisco">*</span></span></label>

                <div v-if="slotMode === 'chips'" class="chips">
                  <button
                    v-for="s in slotOptions"
                    :key="s.value"
                    type="button"
                    class="btn btn-lg btn-default chip"
                    :class="draft.slot === s.value ? 'ativo' : ''"
                    :disabled="isReadOnly"
                    @click.prevent="setSlot(s.value)"
                  >
                    {{ s.label }}
                  </button>
                </div>

                <select v-else v-model="draft.slot" class="form-control form-chosen" name="slot" :readonly="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="s in slotOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Resumo rápido / Highlights</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                Use o resumo rápido para destacar pontos importantes do atendimento. Pode ser preenchido depois.
              </div>
            </div>
            <div class="col-md-4" style="text-align: right">
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="toggleFullscreen">Tela cheia</button>
            </div>
          </div>
        </div>
        <div style="padding: 0 20px 20px">
          <textarea :id="editorId" class="form-control" name="resumo_rapido"></textarea>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Modelo aplicado</h2>
        <div style="padding: 0 20px 20px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Modelo de avaliação</span></label>
                <select v-model="draft.modelo_avaliacao_id" class="form-control form-select2" name="modelo_avaliacao_id" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="m in props.loadOptions.modelosAvaliacao" :key="m.id" :value="m.id">{{ m.title }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Campos do modelo</h2>
        <div style="padding: 0 20px 20px">
          <div v-if="!selectedModelo" class="bd-callout bd-callout-info" style="margin: 0">
            Selecione um modelo para preencher os campos de avaliação.
          </div>

          <div v-else id="assessmentModelFields">
            <div v-for="f in avaliacaoFields" :key="f.key" class="row" style="margin-top: 5px; margin-bottom: 0">
              <div class="col-md-12">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>{{ f.label }}</span></label>

                  <input
                    v-if="f.type === 'texto_curto' || f.type === 'email' || f.type === 'phone'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    :type="f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'"
                    :placeholder="f.placeholder"
                  />

                  <textarea
                    v-else-if="f.type === 'texto_longo'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    rows="4"
                    style="resize: none"
                    :placeholder="f.textarea_placeholder"
                  ></textarea>

                  <input
                    v-else-if="f.type === 'numero_decimal'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    type="number"
                    step="0.01"
                    :min="f.number_min || undefined"
                    :max="f.number_max || undefined"
                    :placeholder="f.placeholder"
                  />

                  <input
                    v-else-if="f.type === 'inteiro'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    type="number"
                    step="1"
                    :min="f.integer_min || undefined"
                    :max="f.integer_max || undefined"
                    :placeholder="f.placeholder"
                  />

                  <input
                    v-else-if="f.type === 'data'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    type="date"
                  />

                  <input
                    v-else-if="f.type === 'hora'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    type="time"
                  />

                  <input
                    v-else-if="f.type === 'data_hora'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    type="datetime-local"
                  />

                  <select
                    v-else-if="f.type === 'select'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control form-select2"
                    :name="`avaliacao_campos[${f.key}]`"
                    :disabled="isReadOnly"
                  >
                    <option value=""></option>
                    <option v-for="opt in parseOptions(f.select_options || '')" :key="opt" :value="opt">{{ opt }}</option>
                  </select>

                  <select
                    v-else-if="f.type === 'multi_select'"
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control form-select2"
                    multiple
                    :name="`avaliacao_campos[${f.key}][]`"
                    :disabled="isReadOnly"
                  >
                    <option v-for="opt in parseOptions(f.multi_select_options || '')" :key="opt" :value="opt">{{ opt }}</option>
                  </select>

                  <div v-else-if="f.type === 'checkbox'" class="checkbox">
                    <label>
                      <input v-model="draft.avaliacao_campos[f.key]" :disabled="isReadOnly" type="checkbox" />
                      <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                      <span class="cr-text">
                        {{ draft.avaliacao_campos[f.key] ? (f.checkbox_label_checked || 'Sim') : (f.checkbox_label_unchecked || 'Não') }}
                      </span>
                    </label>
                  </div>

                  <div v-else-if="f.type === 'checkbox_group'" class="checkbox-group">
                    <div
                      v-for="opt in parseOptions(f.checkbox_group_options || '')"
                      :key="opt"
                      class="checkbox"
                      style="margin-top: 10px"
                    >
                      <label>
                        <input
                          :checked="Array.isArray(draft.avaliacao_campos[f.key]) && draft.avaliacao_campos[f.key].includes(opt)"
                          :disabled="isReadOnly"
                          type="checkbox"
                          @change="
                            () => {
                              const current = new Set(Array.isArray(draft.avaliacao_campos[f.key]) ? draft.avaliacao_campos[f.key] : [])
                              if (current.has(opt)) current.delete(opt)
                              else current.add(opt)
                              draft.avaliacao_campos[f.key] = Array.from(current.values())
                            }
                          "
                        />
                        <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                        <span class="cr-text">{{ opt }}</span>
                      </label>
                    </div>
                  </div>

                  <div v-else-if="f.type === 'radio_group'" class="radio-options">
                    <div v-for="opt in parseOptions(f.radio_group_options || '')" :key="opt" class="radiobutton">
                      <label>
                        <input v-model="draft.avaliacao_campos[f.key]" :disabled="isReadOnly" type="radio" :name="`avaliacao_campos[${f.key}]`" :value="opt" />
                        {{ opt }}<span class="cr"><i class="cr-icon"></i></span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    v-else
                    v-model="draft.avaliacao_campos[f.key]"
                    class="form-control"
                    :name="`avaliacao_campos[${f.key}]`"
                    :readonly="isReadOnly"
                    rows="3"
                    style="resize: none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Checklist clínico (assistencial)</h2>
        <div style="padding: 0 20px 20px">
          <div v-if="!props.loadOptions.checklists.length" class="bd-callout bd-callout-info" style="margin: 0">Nenhum checklist ativo.</div>

          <div v-for="c in props.loadOptions.checklists" :key="c.id" class="pnlCollapse semi-aberto" style="margin-top: 10px">
            <h2 style="font-size: 18px">{{ c.titulo }}</h2>
            <div class="retratil" style="padding: 10px 20px">
              <div v-for="(item, idx) in c.itens" :key="idx" class="checkbox" style="margin-top: 10px">
                <label>
                  <input :checked="checklistArray(c.id).includes(String(idx))" :disabled="isReadOnly" type="checkbox" @change="toggleChecklistItem(c.id, idx)" />
                  <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                  <span class="cr-text">{{ item.texto }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Anexos</h2>
        <div style="padding: 0 20px 20px">
          <div class="form-group">
            <label class="control-label"><span>Arquivos</span></label>
            <input class="form-control" name="arquivos" :disabled="isReadOnly" multiple type="file" @change="handleFilesChange" />
          </div>

          <div v-if="draft.anexos.length" class="bd-callout bd-callout-info" style="margin: 0">
            <div v-for="(a, idx) in draft.anexos" :key="idx">{{ a }}</div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>

      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>

      <button
        v-if="!isReadOnly"
        id="btnAvancar"
        type="submit"
        class="btn btn-lg btn-primary direita has-spin"
        :disabled="step === 1 ? !canAdvanceFrom(1) : false"
      >
        <span>{{ step < 3 ? 'Avançar' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.comandos {
  margin: 25px 0;
  text-align: right;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  min-width: 92px;
}

.chip.ativo {
  border-color: #2e3b82;
  background: #2e3b82;
  color: #fff;
}
</style>
