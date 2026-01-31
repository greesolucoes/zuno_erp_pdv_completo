import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type UnidadeMedida = {
  id: string
  nome: string
  status: '1' | '0'
  created_at: string
  updated_at: string
}

export type UnidadesMedidaLoadOptions = {
  status: Array<{ value: string; label: string }>
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

export async function listUnidadesMedida(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<UnidadeMedida>> {
  return apiGet<PaginatedResponse<UnidadeMedida>>('/unidades-medida', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadUnidadesMedidaOptions(): Promise<UnidadesMedidaLoadOptions> {
  return apiGet<UnidadesMedidaLoadOptions>('/unidades-medida/options')
}

export async function getUnidadeMedidaById(id: string): Promise<UnidadeMedida | null> {
  try {
    return await apiGet<UnidadeMedida>(`/unidades-medida/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createUnidadeMedida(payload: Record<string, any>): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/unidades-medida', payload as any)
}

export async function updateUnidadeMedida(id: string, payload: Record<string, any>): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/unidades-medida/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteUnidadeMedida(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/unidades-medida/${encodeURIComponent(id)}`)
  return true
}

