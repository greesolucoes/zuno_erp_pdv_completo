import type { ModeloAtendimentoDraft, ModeloAtendimentoUpsertPayload } from '../../../../composables/createModeloAtendimentoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type ModeloAtendimento = ModeloAtendimentoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloAtendimentoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
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

export async function listModelosAtendimento(params?: { busca?: string; page?: number; category?: string; status?: string }): Promise<PaginatedResponse<ModeloAtendimento>> {
  return apiGet<PaginatedResponse<ModeloAtendimento>>('/petshop/vet/modelos-atendimento', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    category: params?.category ?? '',
    status: params?.status ?? '',
  })
}

export async function loadModeloAtendimentoOptions(): Promise<ModeloAtendimentoLoadOptions> {
  return apiGet<ModeloAtendimentoLoadOptions>('/petshop/vet/modelos-atendimento/options')
}

export async function getModeloAtendimentoById(id: string): Promise<ModeloAtendimento | null> {
  try {
    return await apiGet<ModeloAtendimento>(`/petshop/vet/modelos-atendimento/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createModeloAtendimento(payload: ModeloAtendimentoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/modelos-atendimento', payload as any)
}

export async function updateModeloAtendimento(id: string, payload: ModeloAtendimentoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/modelos-atendimento/${encodeURIComponent(id)}`, payload as any)
}

