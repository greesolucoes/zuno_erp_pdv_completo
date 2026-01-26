<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'
import { createInternacaoDraft, type InternacaoDraft, type InternacaoUpsertPayload } from '../../../../composables/createInternacaoDraft'
import type { InternacoesLoadOptions } from '../../../../services/petshop/vet/internacoes/internacoes.service'
import { initLegacyUiBindings } from '../../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: InternacaoDraft
  loadOptions: InternacoesLoadOptions
  onSave?: (payload: InternacaoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const { draft, reset, toPayload } = createInternacaoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

const riskMode = computed(() => (props.loadOptions.riskLevels.length <= 5 ? 'radio' : 'select'))

const selectedPatient = computed(() => props.loadOptions.patients.find((p) => p.id === draft.patient_id) ?? null)

const isValid = computed(() => {
  const patientOk = draft.patient_id.trim().length > 0
  const roomOk = draft.sala_internacao_id.trim().length > 0
  const vetOk = draft.veterinario_id.trim().length > 0
  const dateOk = draft.admission_date.trim().length > 0
  const timeOk = draft.admission_time.trim().length > 0
  return patientOk && roomOk && vetOk && dateOk && timeOk
})

async function submitWithStatus(status: InternacaoDraft['status']) {
  if (isReadOnly.value) return
  if (!isValid.value) return
  draft.status = status
  await props.onSave?.(toPayload())
}

onMounted(async () => {
  await nextTick()
  initLegacyUiBindings()
})

watch(
  () => [draft.patient_id, draft.sala_internacao_id, draft.veterinario_id] as const,
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)
</script>

<template>
  <form class="formdps" action="#" method="post" novalidate @submit.prevent="submitWithStatus('active')">
    <input v-model="draft.status" type="hidden" name="status" />
    <input v-model="draft.atendimento_id" type="hidden" name="atendimento_id" />

    <div class="pnlCollapse semi-aberto">
      <h2>Identificação / contexto</h2>
      <div class="retratil" style="padding: 10px 20px">
        <div class="bd-callout bd-callout-info" style="margin: 0">
          <div><b>Status:</b> {{ props.loadOptions.statusOptions.find((s) => s.value === draft.status)?.label ?? draft.status }}</div>
          <div v-if="draft.atendimento_id"><b>Atendimento vinculado:</b> {{ draft.atendimento_id }}</div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Paciente</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Paciente<span class="asterisco">*</span></span></label>
              <select v-model="draft.patient_id" class="form-control form-select2" name="patient_id" :disabled="isReadOnly" required>
                <option value=""></option>
                <option v-for="p in props.loadOptions.patients" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="bd-callout bd-callout-info" style="margin: 0">
              <b>Tutor:</b> {{ selectedPatient?.tutor_nome ?? '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Dados da internação</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Sala de internação<span class="asterisco">*</span></span></label>
              <select v-model="draft.sala_internacao_id" class="form-control form-select2" name="sala_internacao_id" :disabled="isReadOnly" required>
                <option value=""></option>
                <option v-for="r in props.loadOptions.rooms" :key="r.id" :value="r.id">{{ r.label }}</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Veterinário responsável<span class="asterisco">*</span></span></label>
              <select v-model="draft.veterinario_id" class="form-control form-select2" name="veterinario_id" :disabled="isReadOnly" required>
                <option value=""></option>
                <option v-for="v in props.loadOptions.veterinarios" :key="v.id" :value="v.id">{{ v.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-4">
            <div class="form-group">
              <label class="control-label"><span>Data de admissão<span class="asterisco">*</span></span></label>
              <div class="input-group input-group-lg">
                <input v-model="draft.admission_date" class="form-control data" name="admission_date" :readonly="isReadOnly" required type="text" />
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
              <label class="control-label"><span>Hora de admissão<span class="asterisco">*</span></span></label>
              <input v-model="draft.admission_time" class="form-control" name="admission_time" :readonly="isReadOnly" required type="time" />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label class="control-label"><span>Previsão de alta</span></label>
              <div class="input-group input-group-lg">
                <input v-model="draft.expected_discharge_date" class="form-control data" name="expected_discharge_date" :readonly="isReadOnly" type="text" />
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
              <label class="control-label"><span>Nível de risco</span></label>
              <div v-if="riskMode === 'radio'" class="radio-options">
                <div v-for="r in props.loadOptions.riskLevels" :key="r.value" class="radiobutton">
                  <label>
                    <input v-model="draft.nivel_risco" :disabled="isReadOnly" name="nivel_risco" type="radio" :value="r.value" />
                    {{ r.label }}<span class="cr"><i class="cr-icon"></i></span>
                  </label>
                </div>
              </div>
              <select v-else v-model="draft.nivel_risco" class="form-control form-select2" name="nivel_risco" :disabled="isReadOnly">
                <option value=""></option>
                <option v-for="r in props.loadOptions.riskLevels" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Motivo</span></label>
              <textarea v-model="draft.reason" class="form-control" name="reason" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Observações</span></label>
              <textarea v-model="draft.notes" class="form-control" name="notes" :readonly="isReadOnly" rows="6" style="resize: none"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>

      <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" style="margin-right: 10px" :disabled="!isValid" @click.prevent="submitWithStatus('draft')">
        Salvar rascunho
      </button>

      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="!isValid">
        <span>{{ props.mode === 'edit' ? 'Salvar' : 'Registrar' }}</span><img src="/img/btn-avancar.svg" />
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

