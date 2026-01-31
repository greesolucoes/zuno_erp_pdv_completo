import { reactive } from 'vue'

export type ProdutoDraft = {
  nome: string
  codigo_barras: string
  ncm: string
  unidade: string
  categoria_id: string
  valor_compra: string
  valor_unitario: string
  status: '1' | '0'
  gerenciar_estoque: '1' | '0'
  descricao: string
  observacao: string
}

export type ProdutoUpsertPayload = ProdutoDraft

const emptyDraft: ProdutoDraft = {
  nome: '',
  codigo_barras: '',
  ncm: '',
  unidade: 'UN',
  categoria_id: '',
  valor_compra: '',
  valor_unitario: '',
  status: '1',
  gerenciar_estoque: '0',
  descricao: '',
  observacao: '',
}

function normalizeDraft(input?: Partial<ProdutoDraft>): ProdutoDraft {
  return {
    ...emptyDraft,
    ...(input ?? {}),
    status: (input?.status ?? emptyDraft.status) as any,
    gerenciar_estoque: (input?.gerenciar_estoque ?? emptyDraft.gerenciar_estoque) as any,
  }
}

export function createProdutoDraft(initial?: Partial<ProdutoDraft>) {
  const draft = reactive<ProdutoDraft>(normalizeDraft(initial))

  function reset(next?: Partial<ProdutoDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): ProdutoUpsertPayload {
    return {
      nome: String(draft.nome ?? '').trim(),
      codigo_barras: String(draft.codigo_barras ?? '').trim(),
      ncm: String(draft.ncm ?? '').trim(),
      unidade: String(draft.unidade ?? '').trim(),
      categoria_id: String(draft.categoria_id ?? '').trim(),
      valor_compra: String(draft.valor_compra ?? '').trim(),
      valor_unitario: String(draft.valor_unitario ?? '').trim(),
      status: draft.status === '0' ? '0' : '1',
      gerenciar_estoque: draft.gerenciar_estoque === '1' ? '1' : '0',
      descricao: String(draft.descricao ?? ''),
      observacao: String(draft.observacao ?? ''),
    }
  }

  return { draft, reset, toPayload }
}

