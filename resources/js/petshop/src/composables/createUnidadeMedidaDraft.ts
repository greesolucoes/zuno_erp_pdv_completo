import { reactive } from 'vue'

export type UnidadeMedidaDraft = {
  id?: string
  nome: string
  status: '1' | '0'
}

export type UnidadeMedidaUpsertPayload = Omit<UnidadeMedidaDraft, 'id'>

const emptyDraft: UnidadeMedidaDraft = {
  nome: '',
  status: '1',
}

export function createUnidadeMedidaDraft(initial?: Partial<UnidadeMedidaDraft>) {
  const draft = reactive<UnidadeMedidaDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<UnidadeMedidaDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): UnidadeMedidaUpsertPayload {
    return {
      nome: String(draft.nome ?? '').trim(),
      status: draft.status === '0' ? '0' : '1',
    }
  }

  return { draft, reset, toPayload }
}

