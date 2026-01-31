import { reactive } from 'vue'

export type CategoriaServicoDraft = {
  id?: string
  nome: string
  marketplace: '1' | '0'
}

export type CategoriaServicoUpsertPayload = Omit<CategoriaServicoDraft, 'id'>

const emptyDraft: CategoriaServicoDraft = {
  nome: '',
  marketplace: '0',
}

export function createCategoriaServicoDraft(initial?: Partial<CategoriaServicoDraft>) {
  const draft = reactive<CategoriaServicoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<CategoriaServicoDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): CategoriaServicoUpsertPayload {
    return {
      nome: String(draft.nome ?? '').trim(),
      marketplace: draft.marketplace === '1' ? '1' : '0',
    }
  }

  return { draft, reset, toPayload }
}

