import { reactive } from 'vue'

export type SalaInternacaoStatus = 'disponivel' | 'ocupada' | 'reservada' | 'manutencao'
export type SalaInternacaoTipo =
  | 'internacao-geral'
  | 'isolamento'
  | 'terapia-intensiva'
  | 'pos-operatorio'
  | 'recuperacao'
  | 'infectocontagioso'
  | 'neonatal'
  | 'outro'

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
  status: 'disponivel',
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
      status: (draft.status || 'disponivel') as any,
      tipo: (draft.tipo || '') as any,
    }
  }

  return { draft, reset, toPayload }
}
