import type { ChecklistDraft, ChecklistUpsertPayload } from '../../../../composables/createChecklistDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type Checklist = ChecklistDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string = string> = { value: T; label: string }

export type ChecklistsLoadOptions = {
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

const fallbackSnapshot: Checklist[] = []
let checklistsSnapshot: Checklist[] = fallbackSnapshot

export function listChecklistsSnapshot(): Checklist[] {
  return checklistsSnapshot
}

export async function listChecklists(params?: { busca?: string; page?: number; status?: string; tipo?: string }): Promise<PaginatedResponse<Checklist>> {
  return apiGet<PaginatedResponse<Checklist>>('/petshop/vet/checklists', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    status: params?.status ?? '',
    tipo: params?.tipo ?? '',
  })
}

export async function loadChecklistsOptions(): Promise<ChecklistsLoadOptions> {
  try {
    const [options, firstPage] = await Promise.all([
      apiGet<ChecklistsLoadOptions>('/petshop/vet/checklists/options'),
      listChecklists({ page: 1 }),
    ])
    checklistsSnapshot = firstPage.data.length ? firstPage.data : checklistsSnapshot
    return options
  } catch {
    return { tipos: [], status: [] }
  }
}

export async function getChecklistById(id: string): Promise<Checklist | null> {
  try {
    return await apiGet<Checklist>(`/petshop/vet/checklists/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createChecklist(payload: ChecklistUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/checklists', payload as any)
}

export async function updateChecklist(id: string, payload: ChecklistUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/checklists/${encodeURIComponent(id)}`, payload as any)
}

