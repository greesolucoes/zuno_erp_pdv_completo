import { reactive } from 'vue'

export type MedicoStatus = 'ativo' | 'inativo'

export type MedicoDraft = {
  funcionario_id: string
  status: MedicoStatus
  crmv: string
  especialidade: string
  email: string
  telefone: string
  observacoes: string
}

export type MedicoUpsertPayload = MedicoDraft

const emptyDraft: MedicoDraft = {
  funcionario_id: '',
  status: 'ativo',
  crmv: '',
  especialidade: '',
  email: '',
  telefone: '',
  observacoes: '',
}

export function createMedicoDraft(initial?: Partial<MedicoDraft>) {
  const draft = reactive<MedicoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<MedicoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): MedicoUpsertPayload {
    return {
      ...draft,
      crmv: draft.crmv.trim(),
      especialidade: draft.especialidade.trim(),
      email: draft.email.trim(),
      telefone: draft.telefone.trim(),
      observacoes: draft.observacoes.trim(),
    }
  }

  return { draft, reset, toPayload }
}

