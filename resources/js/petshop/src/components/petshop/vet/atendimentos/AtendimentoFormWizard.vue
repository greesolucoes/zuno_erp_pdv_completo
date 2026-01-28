<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createAtendimentoDraft, type AtendimentoDraft, type AtendimentoUpsertPayload } from '../../../../composables/createAtendimentoDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { AtendimentoLoadOptions } from '../../../../services/petshop/vet/atendimentos/atendimentos.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: AtendimentoDraft
  loadOptions: AtendimentoLoadOptions
  onSave?: (payload: AtendimentoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const isExisting = computed(() => props.mode === 'edit' || props.mode === 'view')

const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createAtendimentoDraft(props.modelValue)

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
  () => step.value,
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

const salaMode = computed<'radio' | 'select'>(() => (props.loadOptions.salas.length > 0 && props.loadOptions.salas.length <= 6 ? 'radio' : 'select'))
const horarioMode = computed<'radio' | 'select'>(() => (props.loadOptions.horarios.length > 0 && props.loadOptions.horarios.length <= 16 ? 'radio' : 'select'))

function patientById(id: string) {
  return props.loadOptions.pacientes.find((p) => p.id === id) ?? null
}

watch(
  () => draft.paciente_id,
  (id) => {
    const p = patientById(id)
    if (!p) {
      draft.tutor_id = ''
      draft.tutor_nome = ''
      draft.contato_tutor = ''
      draft.email_tutor = ''
      return
    }
    draft.tutor_id = p.tutor_id
    draft.tutor_nome = p.tutor_nome
    draft.contato_tutor = p.contato_tutor
    draft.email_tutor = p.email_tutor
  },
  { immediate: true },
)

const dateChoice = ref<'today' | 'tomorrow' | 'custom'>('custom')

function formatDateBr(date: Date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

watch(
  () => dateChoice.value,
  (choice) => {
    if (choice === 'today') draft.data_atendimento = formatDateBr(new Date())
    else if (choice === 'tomorrow') {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      draft.data_atendimento = formatDateBr(d)
    }
  },
)

watch(
  () => draft.data_atendimento,
  (value) => {
    if (!value) return
    const today = formatDateBr(new Date())
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrow = formatDateBr(tomorrowDate)

    if (value === today) dateChoice.value = 'today'
    else if (value === tomorrow) dateChoice.value = 'tomorrow'
    else dateChoice.value = 'custom'
  },
  { immediate: true },
)

const hasValidTab1 = computed(() => {
  const pacienteOk = String(draft.paciente_id || '').trim().length > 0
  const vetOk = String(draft.veterinario_id || '').trim().length > 0
  const servicoOk = String(draft.servico_id || '').trim().length > 0
  const salaOk = String(draft.sala_id || '').trim().length > 0
  const dataOk = String(draft.data_atendimento || '').trim().length > 0
  const horarioOk = String(draft.horario || '').trim().length > 0
  return pacienteOk && vetOk && servicoOk && salaOk && dataOk && horarioOk
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
  await props.onSave?.(toPayload())
}

function handleAttachmentsChange(event: Event) {
  if (isReadOnly.value) return
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  draft.quick_attachments = files.map((f) => f.name)
}

function toggleChecklistItem(checklistId: string, itemText: string, checked: boolean) {
  if (isReadOnly.value) return
  const current = draft.triagem.checklists[checklistId] ?? []
  if (checked) {
    if (!current.includes(itemText)) current.push(itemText)
  } else {
    const idx = current.indexOf(itemText)
    if (idx >= 0) current.splice(idx, 1)
  }
  draft.triagem.checklists[checklistId] = current
}

function isChecklistItemChecked(checklistId: string, itemText: string) {
  return (draft.triagem.checklists[checklistId] ?? []).includes(itemText)
}

function stripHtml(input: string) {
  return String(input || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const selectedModelo = ref<string>('')

function applyModelo(modelId: string) {
  if (isReadOnly.value) return
  const m = props.loadOptions.modelosAtendimento.find((x) => x.id === modelId)
  if (!m) return
  draft.motivo_visita = stripHtml(m.content)
}

watch(
  () => selectedModelo.value,
  (value) => {
    if (!value) return
    applyModelo(value)
  },
)

const motivoFullscreen = ref(false)
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Pré-atendimento</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Triagem</span></a>
        </li>
        <li v-if="isExisting" :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Status</span></a>
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
        <h2>Dados do atendimento</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Paciente<span class="asterisco">*</span></span></label>
                <select v-model="draft.paciente_id" class="form-control form-select2" name="paciente_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="p in props.loadOptions.pacientes" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
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
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Serviço<span class="asterisco">*</span></span></label>
                <select v-model="draft.servico_id" class="form-control form-select2" name="servico_id" :disabled="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="s in props.loadOptions.servicos" :key="s.id" :value="s.id">{{ s.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Sala<span class="asterisco">*</span></span></label>

                <div v-if="salaMode === 'radio'" class="radio-options">
                  <div v-for="s in props.loadOptions.salas" :key="s.id" class="radiobutton">
                    <label>
                      <input v-model="draft.sala_id" :disabled="isReadOnly" name="sala_id" type="radio" :value="s.id" />
                      {{ s.label }}<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>

                <select v-else v-model="draft.sala_id" class="form-control form-chosen" name="sala_id" :readonly="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="s in props.loadOptions.salas" :key="s.id" :value="s.id">{{ s.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <input v-model="draft.tutor_id" name="tutor_id" type="hidden" />
          <input v-model="draft.tutor_nome" name="tutor_nome" type="hidden" />

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Contato do tutor</span></label>
                <input v-model="draft.contato_tutor" class="form-control" name="contato_tutor" readonly type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>E-mail do tutor</span></label>
                <input v-model="draft.email_tutor" class="form-control" name="email_tutor" readonly type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Agendamento do atendimento</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Data do atendimento<span class="asterisco">*</span></span></label>
                <div class="radio-options" style="margin-bottom: 10px">
                  <div class="radiobutton">
                    <label>
                      <input v-model="dateChoice" :disabled="isReadOnly" name="data_choice" type="radio" value="today" />
                      Hoje<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                  <div class="radiobutton">
                    <label>
                      <input v-model="dateChoice" :disabled="isReadOnly" name="data_choice" type="radio" value="tomorrow" />
                      Amanhã<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                  <div class="radiobutton">
                    <label>
                      <input v-model="dateChoice" :disabled="isReadOnly" name="data_choice" type="radio" value="custom" />
                      Escolher<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>

                <div class="input-group input-group-lg">
                  <input
                    v-model="draft.data_atendimento"
                    class="form-control data"
                    name="data_atendimento"
                    :readonly="isReadOnly"
                    required
                    type="text"
                  />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button">
                      <div class="btn-calendario"></div>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Horário<span class="asterisco">*</span></span></label>

                <div v-if="horarioMode === 'radio'" class="chips">
                  <button
                    v-for="h in props.loadOptions.horarios"
                    :key="h"
                    type="button"
                    class="btn btn-lg btn-default chip"
                    :class="draft.horario === h ? 'ativo' : ''"
                    :disabled="isReadOnly"
                    @click.prevent="draft.horario = h"
                  >
                    {{ h }}
                  </button>
                </div>

                <select v-else v-model="draft.horario" class="form-control form-chosen" name="horario" :readonly="isReadOnly" required>
                  <option value=""></option>
                  <option v-for="h in props.loadOptions.horarios" :key="h" :value="h">{{ h }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Motivo da visita / Tipo de atendimento</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="form-group">
                <label class="control-label"><span>Carregar modelo</span></label>
                <select v-model="selectedModelo" class="form-control" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="m in props.loadOptions.modelosAtendimento" :key="m.id" :value="m.id">{{ m.title }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4" style="text-align: right; padding-top: 28px">
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="motivoFullscreen = true">Tela cheia</button>
            </div>
          </div>
        </div>

        <div style="padding: 0 20px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Motivo da visita</span></label>
            <textarea v-model="draft.motivo_visita" class="form-control" name="motivo_visita" :readonly="isReadOnly" rows="6" style="resize: none"></textarea>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Anexos rápidos</h2>
        <div style="padding: 0 20px 20px">
          <div class="form-group">
            <label class="control-label"><span>Arquivos</span></label>
            <input class="form-control" name="quick_attachments" :disabled="isReadOnly" multiple type="file" @change="handleAttachmentsChange" />
          </div>
          <div v-if="draft.quick_attachments.length" class="bd-callout bd-callout-info" style="margin: 0">
            <div v-for="(f, idx) in draft.quick_attachments" :key="idx">{{ f }}</div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Sinais vitais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Peso</span></label>
                <input v-model="draft.triagem.peso" class="form-control" name="peso" :readonly="isReadOnly" placeholder="(kg)" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Temperatura</span></label>
                <input v-model="draft.triagem.temperatura" class="form-control" name="temperatura" :readonly="isReadOnly" placeholder="(°C)" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Frequência cardíaca</span></label>
                <input v-model="draft.triagem.frequencia_cardiaca" class="form-control" name="frequencia_cardiaca" :readonly="isReadOnly" placeholder="(bpm)" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Frequência respiratória</span></label>
                <input v-model="draft.triagem.frequencia_respiratoria" class="form-control" name="frequencia_respiratoria" :readonly="isReadOnly" placeholder="(irpm)" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observações</span></label>
                <textarea v-model="draft.triagem.observacoes_triagem" class="form-control" name="observacoes_triagem" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Checklist assistencial</h2>
        <div style="padding: 0 20px 20px">
          <div v-if="!props.loadOptions.checklists.length" class="bd-callout bd-callout-info" style="margin: 0">Nenhum checklist disponível.</div>

          <div v-for="c in props.loadOptions.checklists" :key="c.id" style="margin-bottom: 20px">
            <div class="bd-callout bd-callout-info" style="margin: 0 0 10px">{{ c.titulo }}</div>
            <div v-for="(i, idx) in c.itens" :key="idx" class="checkbox">
              <label>
                <input
                  type="checkbox"
                  :disabled="isReadOnly"
                  :checked="isChecklistItemChecked(c.id, i.texto)"
                  @change="toggleChecklistItem(c.id, i.texto, ($event.target as HTMLInputElement).checked)"
                />
                <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                <span class="cr-text">{{ i.texto }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Status do atendimento</h2>
        <div style="padding: 0 20px 20px">
          <div class="bd-callout bd-callout-info" style="margin: 0">
            <b>Status atual:</b>
            {{
              (props.loadOptions.status.find((s) => s.value === draft.status)?.label ?? draft.status)
            }}
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
        :disabled="step === 1 ? !hasValidTab1 : false"
      >
        <span>{{ step < (isExisting ? 3 : 2) ? 'Avançar' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>

  <div v-if="motivoFullscreen" class="fullscreen-overlay">
    <div class="fullscreen-inner">
      <div class="fullscreen-header">
        <div class="fullscreen-title">Motivo da visita</div>
        <button type="button" class="btn btn-lg btn-default" @click.prevent="motivoFullscreen = false">Fechar</button>
      </div>
      <textarea v-model="draft.motivo_visita" class="form-control fullscreen-textarea" :readonly="isReadOnly" rows="20"></textarea>
    </div>
  </div>
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

.fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  padding: 20px;
}

.fullscreen-inner {
  background: #fff;
  height: 100%;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.fullscreen-title {
  font-size: 20px;
  font-weight: 600;
}

.fullscreen-textarea {
  flex: 1;
  resize: none;
}
</style>
