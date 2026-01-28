import { reactive } from 'vue'

export type InternacaoStatus = 'draft' | 'active' | 'discharged'

export type InternacaoDraft = {
  atendimento_id: string
  status: InternacaoStatus

  patient_id: string
  sala_internacao_id: string
  veterinario_id: string

  admission_date: string
  admission_time: string
  expected_discharge_date: string

  nivel_risco: string
  reason: string
  notes: string
}

export type InternacaoUpsertPayload = InternacaoDraft

const emptyDraft: InternacaoDraft = {
  atendimento_id: '',
  status: 'draft',
  patient_id: '',
  sala_internacao_id: '',
  veterinario_id: '',
  admission_date: '',
  admission_time: '',
  expected_discharge_date: '',
  nivel_risco: '',
  reason: '',
  notes: '',
}

function normalizeDraft(input?: Partial<InternacaoDraft>): InternacaoDraft {
  return {
    ...emptyDraft,
    ...(input ?? {}),
    status: (input?.status ?? emptyDraft.status) as any,
  }
}

export function createInternacaoDraft(initial?: Partial<InternacaoDraft>) {
  const draft = reactive<InternacaoDraft>(normalizeDraft(initial))

  function reset(next?: Partial<InternacaoDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): InternacaoUpsertPayload {
    return {
      atendimento_id: String(draft.atendimento_id ?? ''),
      status: draft.status === 'discharged' ? 'discharged' : draft.status === 'active' ? 'active' : 'draft',
      patient_id: String(draft.patient_id ?? ''),
      sala_internacao_id: String(draft.sala_internacao_id ?? ''),
      veterinario_id: String(draft.veterinario_id ?? ''),
      admission_date: String(draft.admission_date ?? ''),
      admission_time: String(draft.admission_time ?? ''),
      expected_discharge_date: String(draft.expected_discharge_date ?? ''),
      nivel_risco: String(draft.nivel_risco ?? ''),
      reason: String(draft.reason ?? ''),
      notes: String(draft.notes ?? ''),
    }
  }

  return { draft, reset, toPayload }
}

