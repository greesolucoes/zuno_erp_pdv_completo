import type { VacinaDraft, VacinaUpsertPayload } from '../../../../composables/createVacinaDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type Vacina = VacinaDraft & {
  id: string
  created_at: string
  tags: string[]
}

export type SelectOption = { id: string; label: string }

export type ProdutoOption = SelectOption & {
  inventory_current_stock: number
  inventory_minimum_stock: number
  inventory_safety_stock: number
  inventory_reserved_doses: number
}

export type VacinasLoadOptions = {
  products: ProdutoOption[]
  species: SelectOption[]
  statusOptions: Array<{ value: 'ativa' | 'inativa'; label: string }>
  groupOptions: string[]
  categoryOptions: string[]
  manufacturerOptions: string[]
  presentationOptions: string[]
  minimumAgeOptions: string[]
  boosterIntervalOptions: string[]
  routeOptions: string[]
  applicationSiteOptions: string[]
  storageConditionOptions: string[]
  documentationOptions: string[]
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

export async function listVacinas(params?: { busca?: string; page?: number; group?: string; status?: string; species?: string[] }): Promise<PaginatedResponse<Vacina>> {
  return apiGet<PaginatedResponse<Vacina>>('/petshop/vet/vacinas', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    group: params?.group ?? '',
    status: params?.status ?? '',
  } as any)
}

export async function loadVacinasOptions(): Promise<VacinasLoadOptions> {
  return apiGet<VacinasLoadOptions>('/petshop/vet/vacinas/options')
}

export async function getVacinaById(id: string): Promise<Vacina | null> {
  try {
    return await apiGet<Vacina>(`/petshop/vet/vacinas/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createVacina(payload: VacinaUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/vacinas', payload as any)
}

export async function updateVacina(id: string, payload: VacinaUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/vacinas/${encodeURIComponent(id)}`, payload as any)
}
