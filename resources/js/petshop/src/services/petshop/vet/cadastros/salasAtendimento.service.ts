import type { SalaAtendimentoDraft, SalaAtendimentoUpsertPayload } from '../../../../composables/createSalaAtendimentoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type SalaAtendimento = SalaAtendimentoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string = string> = { value: T; label: string }

export type SalasAtendimentoLoadOptions = {
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

const fallbackSnapshot: SalaAtendimento[] = []
let salasSnapshot: SalaAtendimento[] = fallbackSnapshot

export function listSalasAtendimentoSnapshot(): SalaAtendimento[] {
  return salasSnapshot
}

export async function listSalasAtendimento(params?: { busca?: string; page?: number; status?: string; tipo?: string }): Promise<PaginatedResponse<SalaAtendimento>> {
  return apiGet<PaginatedResponse<SalaAtendimento>>('/petshop/vet/salas-atendimento', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    status: params?.status ?? '',
    tipo: params?.tipo ?? '',
  })
}

export async function loadSalasAtendimentoOptions(): Promise<SalasAtendimentoLoadOptions> {
  try {
    const [options, firstPage] = await Promise.all([
      apiGet<SalasAtendimentoLoadOptions>('/petshop/vet/salas-atendimento/options'),
      listSalasAtendimento({ page: 1 }),
    ])
    salasSnapshot = firstPage.data.length ? firstPage.data : salasSnapshot
    return options
  } catch {
    return { tipos: [], status: [] }
  }
}

export async function getSalaAtendimentoById(id: string): Promise<SalaAtendimento | null> {
  try {
    return await apiGet<SalaAtendimento>(`/petshop/vet/salas-atendimento/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createSalaAtendimento(payload: SalaAtendimentoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/salas-atendimento', payload as any)
}

export async function updateSalaAtendimento(id: string, payload: SalaAtendimentoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/salas-atendimento/${encodeURIComponent(id)}`, payload as any)
}
