import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type SelectOption = { id: string; label: string }

export type CategoriaProduto = {
  id: string
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
  categoria_nome: string
  created_at: string
  updated_at: string
}

export type CategoriasProdutoLoadOptions = {
  categorias: SelectOption[]
  status: Array<{ value: string; label: string }>
  simNao: Array<{ value: string; label: string }>
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

export async function listCategoriasProduto(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<CategoriaProduto>> {
  return apiGet<PaginatedResponse<CategoriaProduto>>('/categorias-produto', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadCategoriasProdutoOptions(): Promise<CategoriasProdutoLoadOptions> {
  return apiGet<CategoriasProdutoLoadOptions>('/categorias-produto/options')
}

export async function getCategoriaProdutoById(id: string): Promise<CategoriaProduto | null> {
  try {
    return await apiGet<CategoriaProduto>(`/categorias-produto/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createCategoriaProduto(payload: Record<string, any>): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/categorias-produto', payload as any)
}

export async function updateCategoriaProduto(id: string, payload: Record<string, any>): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/categorias-produto/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteCategoriaProduto(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/categorias-produto/${encodeURIComponent(id)}`)
  return true
}

