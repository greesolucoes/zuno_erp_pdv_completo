import { reactive } from 'vue'

export type SalaAtendimentoStatus = 'ativa' | 'inativa'
export type SalaAtendimentoTipo = 'consultorio' | 'cirurgia' | 'banho_tosa'

export type SalaAtendimentoDraft = {
  nome: string
  identificador: string
  tipo: SalaAtendimentoTipo | ''
  status: SalaAtendimentoStatus
  capacidade: string
  equipamentos: string
  observacoes: string
}

export type SalaAtendimentoUpsertPayload = SalaAtendimentoDraft

const emptyDraft: SalaAtendimentoDraft = {
  nome: '',
  identificador: '',
  tipo: '',
  status: 'ativa',
  capacidade: '',
  equipamentos: '',
  observacoes: '',
}

export function createSalaAtendimentoDraft(initial?: Partial<SalaAtendimentoDraft>) {
  const draft = reactive<SalaAtendimentoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<SalaAtendimentoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): SalaAtendimentoUpsertPayload {
    return {
      ...draft,
      nome: draft.nome.trim(),
      identificador: draft.identificador.trim(),
      capacidade: draft.capacidade.trim(),
      equipamentos: draft.equipamentos.trim(),
      observacoes: draft.observacoes.trim(),
      status: draft.status === 'inativa' ? 'inativa' : 'ativa',
      tipo: (draft.tipo || '') as any,
    }
  }

  return { draft, reset, toPayload }
}

