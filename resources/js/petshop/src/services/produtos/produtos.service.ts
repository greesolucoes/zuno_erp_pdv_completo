import type { ProdutoUpsertPayload } from '../../composables/createProdutoDraft'
import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type SelectOption = { id: string; label: string }

export type Produto = {
  id: string
  nome: string
  codigo_barras: string
  ncm: string
  unidade: string
  categoria_id: string
  categoria_nome: string
  valor_compra: string
  valor_unitario: string
  status: '1' | '0'
  gerenciar_estoque: '1' | '0'
  descricao: string
  observacao: string
  created_at: string
  updated_at: string
}

export type ProdutosLoadOptions = {
  categorias: SelectOption[]
  status: Array<{ value: string; label: string }>
  gerenciarEstoque: Array<{ value: string; label: string }>
  unidades: Array<{ value: string; label: string }>
}

export type PaginatedMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginatedMeta
}

export async function listProdutos(params?: {
  busca?: string
  page?: number
  categoria_id?: string
  status?: string
  gerenciar_estoque?: string
}): Promise<PaginatedResponse<Produto>> {
  return apiGet<PaginatedResponse<Produto>>('/produtos', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    categoria_id: params?.categoria_id ?? '',
    status: params?.status ?? '',
    gerenciar_estoque: params?.gerenciar_estoque ?? '',
  })
}

export async function loadProdutosOptions(): Promise<ProdutosLoadOptions> {
  return apiGet<ProdutosLoadOptions>('/produtos/options')
}

export async function getProdutoById(id: string): Promise<Produto | null> {
  try {
    return await apiGet<Produto>(`/produtos/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createProduto(payload: ProdutoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/produtos', payload as any)
}

export async function updateProduto(id: string, payload: ProdutoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/produtos/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteProduto(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/produtos/${encodeURIComponent(id)}`)
  return true
}

