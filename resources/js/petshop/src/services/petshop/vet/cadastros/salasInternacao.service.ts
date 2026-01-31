import type { SalaInternacaoDraft, SalaInternacaoUpsertPayload } from '../../../../composables/createSalaInternacaoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type SalaInternacao = SalaInternacaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string = string> = { value: T; label: string }

export type SalasInternacaoLoadOptions = {
  tipos: SelectOption[]
  status: SelectOption[]
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

const fallbackSnapshot: SalaInternacao[] = []
let salasSnapshot: SalaInternacao[] = fallbackSnapshot

export function listSalasInternacaoSnapshot(): SalaInternacao[] {
  return salasSnapshot
}

export async function listSalasInternacao(params?: { busca?: string; page?: number; status?: string; tipo?: string }): Promise<PaginatedResponse<SalaInternacao>> {
  return apiGet<PaginatedResponse<SalaInternacao>>('/petshop/vet/salas-internacao', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    status: params?.status ?? '',
    tipo: params?.tipo ?? '',
  })
}

export async function loadSalasInternacaoOptions(): Promise<SalasInternacaoLoadOptions> {
  try {
    const [options, firstPage] = await Promise.all([
      apiGet<SalasInternacaoLoadOptions>('/petshop/vet/salas-internacao/options'),
      listSalasInternacao({ page: 1 }),
    ])
    salasSnapshot = firstPage.data.length ? firstPage.data : salasSnapshot
    return options
  } catch {
    return { tipos: [], status: [] }
  }
}

export async function getSalaInternacaoById(id: string): Promise<SalaInternacao | null> {
  try {
    return await apiGet<SalaInternacao>(`/petshop/vet/salas-internacao/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createSalaInternacao(payload: SalaInternacaoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/salas-internacao', payload as any)
}

export async function updateSalaInternacao(id: string, payload: SalaInternacaoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/salas-internacao/${encodeURIComponent(id)}`, payload as any)
}

