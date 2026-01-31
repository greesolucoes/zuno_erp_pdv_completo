import type { EspecieDraft, EspecieUpsertPayload } from '../../../composables/createEspecieDraft'
import type { ApiError } from '../../http'
import { apiGet, apiPost, apiPut } from '../../http'

export type Especie = EspecieDraft & {
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

const fallbackSnapshot: Especie[] = [
  { id: '1', nome: 'CACHORRO', created_at: new Date().toISOString() },
  { id: '2', nome: 'GATO', created_at: new Date().toISOString() },
]

let especiesSnapshot: Especie[] = fallbackSnapshot

export async function listEspecies(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Especie>> {
  return apiGet<PaginatedResponse<Especie>>('/petshop/especies', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadEspeciesOptions(): Promise<Record<string, never>> {
  try {
    const [options, firstPage] = await Promise.all([
      apiGet<Record<string, never>>('/petshop/especies/options'),
      listEspecies({ page: 1 }),
    ])
    especiesSnapshot = firstPage.data.length ? firstPage.data : especiesSnapshot
    return options
  } catch {
    return {}
  }
}

export function listEspeciesSnapshot(): Especie[] {
  return especiesSnapshot
}

export async function getEspecieById(id: string): Promise<Especie | null> {
  try {
    return await apiGet<Especie>(`/petshop/especies/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createEspecie(payload: EspecieUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/especies', payload as any)
}

export async function updateEspecie(id: string, payload: EspecieUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/especies/${encodeURIComponent(id)}`, payload as any)
}
