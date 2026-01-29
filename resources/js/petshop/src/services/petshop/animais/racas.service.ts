import type { RacaDraft, RacaUpsertPayload } from '../../../composables/createRacaDraft'
import type { ApiError } from '../../http'
import { apiGet, apiPost, apiPut } from '../../http'

export type Raca = RacaDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type RacasLoadOptions = {
  especies: SelectOption[]
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

export async function listRacas(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Raca>> {
  return apiGet<PaginatedResponse<Raca>>('/petshop/racas', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadRacasOptions(): Promise<RacasLoadOptions> {
  return apiGet<RacasLoadOptions>('/petshop/racas/options')
}

export async function getRacaById(id: string): Promise<Raca | null> {
  try {
    return await apiGet<Raca>(`/petshop/racas/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createRaca(payload: RacaUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/racas', payload as any)
}

export async function updateRaca(id: string, payload: RacaUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/racas/${encodeURIComponent(id)}`, payload as any)
}

