import { reactive } from 'vue'

export type TipoAtendimento = 'consulta' | 'retorno' | 'pos-operatorio' | 'emergencia'

export type FilaProntuarioDraft = {
  prontuario_id: string
  atendimento_id: string
  status: string

  paciente_id: string
  veterinario_id: string

  tipo_atendimento: TipoAtendimento | ''
  slot: string

  resumo_rapido: string

  modelo_avaliacao_id: string
  avaliacao_campos: Record<string, any>
  checklists: Record<string, string[]>

  anexos: string[]
}

export type FilaProntuarioUpsertPayload = FilaProntuarioDraft

const emptyDraft: FilaProntuarioDraft = {
  prontuario_id: '',
  atendimento_id: '',
  status: '',
  paciente_id: '',
  veterinario_id: '',
  tipo_atendimento: '',
  slot: '',
  resumo_rapido: '',
  modelo_avaliacao_id: '',
  avaliacao_campos: {},
  checklists: {},
  anexos: [],
}

function normalizeDraft(input?: Partial<FilaProntuarioDraft>): FilaProntuarioDraft {
  return {
    ...emptyDraft,
    ...(input ?? {}),
    avaliacao_campos: typeof input?.avaliacao_campos === 'object' && input?.avaliacao_campos ? (input.avaliacao_campos as any) : {},
    checklists: typeof input?.checklists === 'object' && input?.checklists ? (input.checklists as any) : {},
    anexos: Array.isArray(input?.anexos) ? (input!.anexos as any).map(String) : [],
  }
}

export function createFilaProntuarioDraft(initial?: Partial<FilaProntuarioDraft>) {
  const draft = reactive<FilaProntuarioDraft>(normalizeDraft(initial))

  function reset(next?: Partial<FilaProntuarioDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): FilaProntuarioUpsertPayload {
    return {
      prontuario_id: String(draft.prontuario_id ?? ''),
      atendimento_id: String(draft.atendimento_id ?? ''),
      status: String(draft.status ?? ''),
      paciente_id: String(draft.paciente_id ?? ''),
      veterinario_id: String(draft.veterinario_id ?? ''),
      tipo_atendimento:
        draft.tipo_atendimento === 'consulta' ||
        draft.tipo_atendimento === 'retorno' ||
        draft.tipo_atendimento === 'pos-operatorio' ||
        draft.tipo_atendimento === 'emergencia'
          ? draft.tipo_atendimento
          : '',
      slot: String(draft.slot ?? ''),
      resumo_rapido: String(draft.resumo_rapido ?? ''),
      modelo_avaliacao_id: String(draft.modelo_avaliacao_id ?? ''),
      avaliacao_campos: draft.avaliacao_campos ?? {},
      checklists: draft.checklists ?? {},
      anexos: (draft.anexos ?? []).map(String),
    }
  }

  return { draft, reset, toPayload }
}

