import { reactive } from 'vue'

export type PelagemDraft = {
  nome: string
}

export type PelagemUpsertPayload = PelagemDraft

const emptyDraft: PelagemDraft = {
  nome: '',
}

export function createPelagemDraft(initial?: Partial<PelagemDraft>) {
  const draft = reactive<PelagemDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<PelagemDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): PelagemUpsertPayload {
    return { ...draft, nome: draft.nome.trim() }
  }

  return { draft, reset, toPayload }
}

