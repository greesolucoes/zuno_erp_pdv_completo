import type { ModeloAvaliacaoDraft, ModeloAvaliacaoUpsertPayload } from '../../../../composables/createModeloAvaliacaoDraft'
import type { ApiError } from '../../../http'
import { apiGet, apiPost, apiPut } from '../../../http'

export type ModeloAvaliacao = ModeloAvaliacaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloAvaliacaoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
  fieldTypes: SelectOption<string>[]
  templates: SelectOption<'basico' | 'consulta' | 'internacao'>[]
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

export async function listModelosAvaliacao(params?: { busca?: string; page?: number; category?: string; status?: string }): Promise<PaginatedResponse<ModeloAvaliacao>> {
  return apiGet<PaginatedResponse<ModeloAvaliacao>>('/petshop/vet/modelos-avaliacao', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    category: params?.category ?? '',
    status: params?.status ?? '',
  })
}

export async function listAllModelosAvaliacao(params?: { category?: string; status?: string }): Promise<ModeloAvaliacao[]> {
  const all: ModeloAvaliacao[] = []
  let page = 1
  let lastPage = 1

  do {
    const resp = await listModelosAvaliacao({ busca: '', page, category: params?.category ?? '', status: params?.status ?? '' })
    all.push(...(resp.data ?? []))
    lastPage = resp.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return all
}

export async function loadModeloAvaliacaoOptions(): Promise<ModeloAvaliacaoLoadOptions> {
  return apiGet<ModeloAvaliacaoLoadOptions>('/petshop/vet/modelos-avaliacao/options')
}

export async function getModeloAvaliacaoById(id: string): Promise<ModeloAvaliacao | null> {
  try {
    return await apiGet<ModeloAvaliacao>(`/petshop/vet/modelos-avaliacao/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createModeloAvaliacao(payload: ModeloAvaliacaoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/vet/modelos-avaliacao', payload as any)
}

export async function updateModeloAvaliacao(id: string, payload: ModeloAvaliacaoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/vet/modelos-avaliacao/${encodeURIComponent(id)}`, payload as any)
}

