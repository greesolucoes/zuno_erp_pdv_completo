import type { PelagemDraft, PelagemUpsertPayload } from '../../../composables/createPelagemDraft'
import { httpJson } from '../../http'

export type Pelagem = PelagemDraft & {
  id: string
  created_at: string
}

export type PelagensListResponse = {
  data: Pelagem[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function loadPelagensOptions(): Promise<Record<string, never>> {
  return httpJson<Record<string, never>>('/v2/api/petshop/pelagens/options')
}

export async function listPelagens(params?: { busca?: string; page?: number }): Promise<PelagensListResponse> {
  const search = (params?.busca ?? '').trim()
  const page = params?.page && params.page > 0 ? params.page : 1

  const url = new URL('/v2/api/petshop/pelagens', window.location.origin)
  if (search) url.searchParams.set('busca', search)
  if (page && page !== 1) url.searchParams.set('page', String(page))

  return httpJson<PelagensListResponse>(url)
}

export async function getPelagemById(id: string): Promise<Pelagem> {
  return httpJson<Pelagem>(`/v2/api/petshop/pelagens/${encodeURIComponent(id)}`)
}

export async function createPelagem(payload: PelagemUpsertPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>('/v2/api/petshop/pelagens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updatePelagem(id: string, payload: PelagemUpsertPayload): Promise<{ ok: true }> {
  return httpJson<{ ok: true }>(`/v2/api/petshop/pelagens/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
