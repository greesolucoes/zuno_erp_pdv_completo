import { reactive } from 'vue'

export type EspecieDraft = {
  nome: string
}

export type EspecieUpsertPayload = EspecieDraft

const emptyDraft: EspecieDraft = {
  nome: '',
}

export function createEspecieDraft(initial?: Partial<EspecieDraft>) {
  const draft = reactive<EspecieDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<EspecieDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): EspecieUpsertPayload {
    return { ...draft }
  }

  return { draft, reset, toPayload }
}

