import type { MedicoDraft, MedicoUpsertPayload } from '../../../../composables/createMedicoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type Medico = MedicoDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type MedicosLoadOptions = {
  funcionarios: SelectOption[]
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

const fallbackSnapshot: Medico[] = []
let medicosSnapshot: Medico[] = fallbackSnapshot

export function listMedicosSnapshot(): Medico[] {
  return medicosSnapshot
}

export async function listMedicos(params?: { busca?: string; page?: number; status?: string }): Promise<PaginatedResponse<Medico>> {
  return apiGet<PaginatedResponse<Medico>>('/petshop/vet/medicos', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    status: params?.status ?? '',
  })
}

export async function loadMedicosOptions(params?: { available_only?: boolean; medico_id?: string }): Promise<MedicosLoadOptions> {
  try {
    const [options, firstPage] = await Promise.all([
      apiGet<MedicosLoadOptions>('/petshop/vet/medicos/options', {
        available_only: params?.available_only ? 1 : 0,
        medico_id: params?.medico_id ?? '',
      }),
      listMedicos({ page: 1 }),
    ])

    medicosSnapshot = firstPage.data.length ? firstPage.data : medicosSnapshot
    return options
  } catch {
    return { funcionarios: [] }
  }
}

export async function getMedicoById(id: string): Promise<Medico | null> {
  try {
    return await apiGet<Medico>(`/petshop/vet/medicos/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createMedico(payload: MedicoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/medicos', payload as any)
}

export async function updateMedico(id: string, payload: MedicoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/medicos/${encodeURIComponent(id)}`, payload as any)
}
