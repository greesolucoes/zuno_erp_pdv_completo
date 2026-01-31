import { reactive } from 'vue'

export type CategoriaProdutoDraft = {
  id?: string
  nome: string
  status: '1' | '0'
  nome_en: string
  nome_es: string
  cardapio: '1' | '0'
  delivery: '1' | '0'
  tipo_pizza: '1' | '0'
  ecommerce: '1' | '0'
  reserva: '1' | '0'
  categoria_id: string
}

export type CategoriaProdutoUpsertPayload = Omit<CategoriaProdutoDraft, 'id'>

const emptyDraft: CategoriaProdutoDraft = {
  nome: '',
  status: '1',
  nome_en: '',
  nome_es: '',
  cardapio: '0',
  delivery: '0',
  tipo_pizza: '0',
  ecommerce: '0',
  reserva: '0',
  categoria_id: '',
}

export function createCategoriaProdutoDraft(initial?: Partial<CategoriaProdutoDraft>) {
  const draft = reactive<CategoriaProdutoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<CategoriaProdutoDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): CategoriaProdutoUpsertPayload {
    return {
      nome: String(draft.nome ?? '').trim(),
      status: draft.status === '0' ? '0' : '1',
      nome_en: String(draft.nome_en ?? '').trim(),
      nome_es: String(draft.nome_es ?? '').trim(),
      cardapio: draft.cardapio === '1' ? '1' : '0',
      delivery: draft.delivery === '1' ? '1' : '0',
      tipo_pizza: draft.tipo_pizza === '1' ? '1' : '0',
      ecommerce: draft.ecommerce === '1' ? '1' : '0',
      reserva: draft.reserva === '1' ? '1' : '0',
      categoria_id: String(draft.categoria_id ?? '').trim(),
    }
  }

  return { draft, reset, toPayload }
}

