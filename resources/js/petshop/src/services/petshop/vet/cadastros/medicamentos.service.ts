import type { MedicamentoDraft, MedicamentoUpsertPayload } from '../../../../composables/createMedicamentoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type Medicamento = MedicamentoDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type ProdutoOption = SelectOption & {
  current_stock: number
  minimum_stock: number
}

export type MedicamentosLoadOptions = {
  produtos: ProdutoOption[]
  especies: SelectOption[]
  classeTerapeuticaOptions: string[]
  classificacaoControleQuickOptions: string[]
  viaAdministracaoOptions: string[]
  apresentacaoOptions: string[]
  formaDispensacaoOptions: string[]
  restricaoIdadeOptions: string[]
  condicaoArmazenamentoOptions: string[]
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

export async function listMedicamentos(params?: { busca?: string; page?: number; classe_terapeutica?: string; via_administracao?: string }): Promise<PaginatedResponse<Medicamento>> {
  return apiGet<PaginatedResponse<Medicamento>>('/petshop/vet/medicamentos', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    classe_terapeutica: params?.classe_terapeutica ?? '',
    via_administracao: params?.via_administracao ?? '',
  })
}

export async function loadMedicamentosOptions(): Promise<MedicamentosLoadOptions> {
  return apiGet<MedicamentosLoadOptions>('/petshop/vet/medicamentos/options')
}

export async function getMedicamentoById(id: string): Promise<Medicamento | null> {
  try {
    return await apiGet<Medicamento>(`/petshop/vet/medicamentos/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createMedicamento(payload: MedicamentoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/medicamentos', payload as any)
}

export async function updateMedicamento(id: string, payload: MedicamentoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/medicamentos/${encodeURIComponent(id)}`, payload as any)
}

