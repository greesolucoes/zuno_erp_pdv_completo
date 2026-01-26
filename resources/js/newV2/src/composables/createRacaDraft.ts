import { reactive } from 'vue'

export type RacaDraft = {
  nome: string
  especie_id: string
}

export type RacaUpsertPayload = RacaDraft

const emptyDraft: RacaDraft = {
  nome: '',
  especie_id: '',
}

export function createRacaDraft(initial?: Partial<RacaDraft>) {
  const draft = reactive<RacaDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<RacaDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): RacaUpsertPayload {
    return { ...draft, nome: draft.nome.trim() }
  }

  return { draft, reset, toPayload }
}

