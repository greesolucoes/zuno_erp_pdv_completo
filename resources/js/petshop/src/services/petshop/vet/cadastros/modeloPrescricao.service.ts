import type { ModeloPrescricaoDraft, ModeloPrescricaoUpsertPayload } from '../../../../composables/createModeloPrescricaoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type ModeloPrescricao = ModeloPrescricaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloPrescricaoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
  fieldTypes: SelectOption<string>[]
  templates: SelectOption<'prescricao_basica' | 'antibiotico' | 'pos_operatorio'>[]
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

export async function listModelosPrescricao(params?: { busca?: string; page?: number; category?: string; status?: string }): Promise<PaginatedResponse<ModeloPrescricao>> {
  return apiGet<PaginatedResponse<ModeloPrescricao>>('/petshop/vet/modelos-prescricao', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    category: params?.category ?? '',
    status: params?.status ?? '',
  })
}

export async function loadModeloPrescricaoOptions(): Promise<ModeloPrescricaoLoadOptions> {
  return apiGet<ModeloPrescricaoLoadOptions>('/petshop/vet/modelos-prescricao/options')
}

export async function getModeloPrescricaoById(id: string): Promise<ModeloPrescricao | null> {
  try {
    return await apiGet<ModeloPrescricao>(`/petshop/vet/modelos-prescricao/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createModeloPrescricao(payload: ModeloPrescricaoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/modelos-prescricao', payload as any)
}

export async function updateModeloPrescricao(id: string, payload: ModeloPrescricaoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/modelos-prescricao/${encodeURIComponent(id)}`, payload as any)
}
