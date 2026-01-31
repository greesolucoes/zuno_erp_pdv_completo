import { reactive } from 'vue'

export type MarcaDraft = {
  id?: string
  nome: string
}

export type MarcaUpsertPayload = Omit<MarcaDraft, 'id'>

const emptyDraft: MarcaDraft = {
  nome: '',
}

export function createMarcaDraft(initial?: Partial<MarcaDraft>) {
  const draft = reactive<MarcaDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<MarcaDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): MarcaUpsertPayload {
    return { nome: String(draft.nome ?? '').trim() }
  }

  return { draft, reset, toPayload }
}

