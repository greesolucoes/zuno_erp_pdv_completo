import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type Marca = {
  id: string
  nome: string
  created_at: string
  updated_at: string
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

export async function listMarcas(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Marca>> {
  return apiGet<PaginatedResponse<Marca>>('/marcas', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function getMarcaById(id: string): Promise<Marca | null> {
  try {
    return await apiGet<Marca>(`/marcas/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createMarca(payload: Record<string, any>): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/marcas', payload as any)
}

export async function updateMarca(id: string, payload: Record<string, any>): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/marcas/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteMarca(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/marcas/${encodeURIComponent(id)}`)
  return true
}

