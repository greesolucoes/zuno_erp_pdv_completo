import type { RacaDraft, RacaUpsertPayload } from '../../../composables/createRacaDraft'
import { httpJson } from '../../http'

export type Raca = RacaDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type RacasLoadOptions = {
  especies: SelectOption[]
}

export async function loadRacasOptions(): Promise<RacasLoadOptions> {
  return httpJson<RacasLoadOptions>('/v2/api/petshop/racas/options')
}

export type RacasListResponse = {
  data: Raca[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function listRacas(params?: { busca?: string; page?: number }): Promise<RacasListResponse> {
  const search = (params?.busca ?? '').trim()
  const page = params?.page && params.page > 0 ? params.page : 1

  const url = new URL('/v2/api/petshop/racas', window.location.origin)
  if (search) url.searchParams.set('busca', search)
  if (page && page !== 1) url.searchParams.set('page', String(page))

  return httpJson<RacasListResponse>(url)
}

export async function getRacaById(id: string): Promise<Raca> {
  return httpJson<Raca>(`/v2/api/petshop/racas/${encodeURIComponent(id)}`)
}

export async function createRaca(payload: RacaUpsertPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>('/v2/api/petshop/racas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateRaca(id: string, payload: RacaUpsertPayload): Promise<{ ok: true }> {
  return httpJson<{ ok: true }>(`/v2/api/petshop/racas/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
