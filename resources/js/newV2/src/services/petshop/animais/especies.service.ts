import type { EspecieDraft, EspecieUpsertPayload } from '../../../composables/createEspecieDraft'
import { httpJson } from '../../http'

export type Especie = EspecieDraft & {
  id: string
  created_at: string
}

export type EspeciesListResponse = {
  data: Especie[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function loadEspeciesOptions(): Promise<Record<string, never>> {
  return httpJson<Record<string, never>>('/v2/api/petshop/especies/options')
}

export async function listEspecies(params?: { busca?: string; page?: number }): Promise<EspeciesListResponse> {
  const search = (params?.busca ?? '').trim()
  const page = params?.page && params.page > 0 ? params.page : 1

  const url = new URL('/v2/api/petshop/especies', window.location.origin)
  if (search) url.searchParams.set('busca', search)
  if (page && page !== 1) url.searchParams.set('page', String(page))

  return httpJson<EspeciesListResponse>(url)
}

export async function getEspecieById(id: string): Promise<Especie> {
  return httpJson<Especie>(`/v2/api/petshop/especies/${encodeURIComponent(id)}`)
}

export async function createEspecie(payload: EspecieUpsertPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>('/v2/api/petshop/especies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateEspecie(id: string, payload: EspecieUpsertPayload): Promise<{ ok: true }> {
  return httpJson<{ ok: true }>(`/v2/api/petshop/especies/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
