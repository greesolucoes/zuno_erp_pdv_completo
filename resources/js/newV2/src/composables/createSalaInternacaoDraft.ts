import { reactive } from 'vue'

export type SalaInternacaoStatus = 'ativa' | 'inativa'
export type SalaInternacaoTipo = 'enfermaria' | 'isolamento' | 'uti'

export type SalaInternacaoDraft = {
  nome: string
  identificador: string
  tipo: SalaInternacaoTipo | ''
  status: SalaInternacaoStatus
  capacidade: string
  equipamentos: string
  observacoes: string
}

export type SalaInternacaoUpsertPayload = SalaInternacaoDraft

const emptyDraft: SalaInternacaoDraft = {
  nome: '',
  identificador: '',
  tipo: '',
  status: 'ativa',
  capacidade: '',
  equipamentos: '',
  observacoes: '',
}

export function createSalaInternacaoDraft(initial?: Partial<SalaInternacaoDraft>) {
  const draft = reactive<SalaInternacaoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<SalaInternacaoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): SalaInternacaoUpsertPayload {
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

