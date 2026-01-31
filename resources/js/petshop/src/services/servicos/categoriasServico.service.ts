import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type CategoriaServico = {
  id: string
  nome: string
  marketplace: '1' | '0'
  created_at: string
  updated_at: string
}

export type CategoriasServicoLoadOptions = {
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

export async function listCategoriasServico(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<CategoriaServico>> {
  return apiGet<PaginatedResponse<CategoriaServico>>('/categorias-servico', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadCategoriasServicoOptions(): Promise<CategoriasServicoLoadOptions> {
  return apiGet<CategoriasServicoLoadOptions>('/categorias-servico/options')
}

export async function getCategoriaServicoById(id: string): Promise<CategoriaServico | null> {
  try {
    return await apiGet<CategoriaServico>(`/categorias-servico/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createCategoriaServico(payload: Record<string, any>): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/categorias-servico', payload as any)
}

export async function updateCategoriaServico(id: string, payload: Record<string, any>): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/categorias-servico/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteCategoriaServico(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/categorias-servico/${encodeURIComponent(id)}`)
  return true
}

