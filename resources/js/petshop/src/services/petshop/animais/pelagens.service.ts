import type { PelagemDraft, PelagemUpsertPayload } from '../../../composables/createPelagemDraft'
import type { ApiError } from '../../http'
import { apiGet, apiPost, apiPut } from '../../http'

export type Pelagem = PelagemDraft & {
  id: string
  created_at: string
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

export async function listPelagens(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Pelagem>> {
  return apiGet<PaginatedResponse<Pelagem>>('/petshop/pelagens', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadPelagensOptions(): Promise<Record<string, never>> {
  return apiGet<Record<string, never>>('/petshop/pelagens/options')
}

export async function getPelagemById(id: string): Promise<Pelagem | null> {
  try {
    return await apiGet<Pelagem>(`/petshop/pelagens/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createPelagem(payload: PelagemUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/pelagens', payload as any)
}

export async function updatePelagem(id: string, payload: PelagemUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/pelagens/${encodeURIComponent(id)}`, payload as any)
}

