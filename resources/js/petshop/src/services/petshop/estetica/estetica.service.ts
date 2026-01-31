import type { EsteticaDraft, EsteticaUpsertPayload } from '../../../composables/createEsteticaDraft'
import type { ApiError } from '../../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../../http'

export type Estetica = EsteticaDraft & {
  id: string
  created_at: string
  updated_at: string
  valor_total: string
}

export type SelectOption = { id: string; label: string }

export type PetOption = SelectOption & {
  cliente_id: string
  cliente_nome: string
  animal_info: string
}

export type ServicoOption = SelectOption & {
  tempo_execucao: string
  valor: string
}

export type ProdutoOption = SelectOption & {
  valor_unitario: string
}

export type EsteticaLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  estados: Array<{ value: EsteticaDraft['estado']; label: string }>
  servicos: ServicoOption[]
  produtos: ProdutoOption[]
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

export async function listEstetica(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Estetica>> {
  return apiGet<PaginatedResponse<Estetica>>('/petshop/estetica/gerenciar', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function listAllEstetica(params?: { busca?: string }): Promise<Estetica[]> {
  const all: Estetica[] = []
  let page = 1
  let lastPage = 1

  do {
    const resp = await listEstetica({ busca: params?.busca ?? '', page })
    all.push(...(resp.data ?? []))
    lastPage = resp.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return all
}

export async function loadEsteticaOptions(): Promise<EsteticaLoadOptions> {
  return apiGet<EsteticaLoadOptions>('/petshop/estetica/gerenciar/options')
}

export async function getEsteticaById(id: string): Promise<Estetica | null> {
  try {
    return await apiGet<Estetica>(`/petshop/estetica/gerenciar/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createEstetica(payload: EsteticaUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/estetica/gerenciar', payload as any)
}

export async function updateEstetica(id: string, payload: EsteticaUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/estetica/gerenciar/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteEstetica(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/petshop/estetica/gerenciar/${encodeURIComponent(id)}`)
  return true
}
