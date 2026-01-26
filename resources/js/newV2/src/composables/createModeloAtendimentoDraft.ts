import { reactive } from 'vue'

export type ModeloAtendimentoStatus = 'ativo' | 'inativo'

export type ModeloAtendimentoDraft = {
  title: string
  category: string
  notes: string
  content: string
  status?: ModeloAtendimentoStatus
}

export type ModeloAtendimentoUpsertPayload = {
  title: string
  category: string
  notes: string
  content: string
  status?: ModeloAtendimentoStatus
}

const emptyDraft: ModeloAtendimentoDraft = {
  title: '',
  category: '',
  notes: '',
  content: '',
}

export function createModeloAtendimentoDraft(initial?: Partial<ModeloAtendimentoDraft>) {
  const draft = reactive<ModeloAtendimentoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<ModeloAtendimentoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): ModeloAtendimentoUpsertPayload {
    const payload: ModeloAtendimentoUpsertPayload = {
      title: draft.title.trim(),
      category: draft.category.trim(),
      notes: draft.notes.trim(),
      content: draft.content,
    }

    if (draft.status === 'ativo' || draft.status === 'inativo') payload.status = draft.status

    return payload
  }

  return { draft, reset, toPayload }
}

