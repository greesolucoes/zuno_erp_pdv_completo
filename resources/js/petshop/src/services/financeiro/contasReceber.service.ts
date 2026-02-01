import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type ContaReceber = {
  id: string
  local_id: string
  local_nome: string
  descricao: string
  cliente_id: string
  cliente_nome: string
  categoria_conta_id: string
  categoria_nome: string
  valor_integral: string
  valor_recebido: string
  data_vencimento: string
  data_recebimento: string
  status: '1' | '0'
  tipo_pagamento: string
  observacao: string
  observacao2: string
  observacao3: string
  created_at: string
  updated_at: string
}

export type ContasReceberOptions = {
  clientes: Array<{ id: string; label: string }>
  categorias: Array<{ id: string; label: string }>
  locais: Array<{ id: string; label: string }>
  multiLocal: 1 | 0
  status: Array<{ value: string; label: string }>
  filtroData: Array<{ value: string; label: string }>
  ordem: Array<{ value: string; label: string }>
  tiposPagamento: Array<{ value: string; label: string }>
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

export async function listContasReceber(params?: {
  cliente_id?: string
  filtro_data?: string
  start_date?: string
  end_date?: string
  local_id?: string
  status?: string
  ordem?: string
  categoria_conta_id?: string
  page?: number
}): Promise<PaginatedResponse<ContaReceber>> {
  return apiGet<PaginatedResponse<ContaReceber>>('/contas-receber', {
    cliente_id: params?.cliente_id ?? '',
    filtro_data: params?.filtro_data ?? '',
    start_date: params?.start_date ?? '',
    end_date: params?.end_date ?? '',
    local_id: params?.local_id ?? '',
    status: params?.status ?? '',
    ordem: params?.ordem ?? '',
    categoria_conta_id: params?.categoria_conta_id ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadContasReceberOptions(): Promise<ContasReceberOptions> {
  return apiGet<ContasReceberOptions>('/contas-receber/options')
}

export async function getContaReceberById(id: string): Promise<ContaReceber | null> {
  try {
    return await apiGet<ContaReceber>(`/contas-receber/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export type ContaReceberUpsertPayload = {
  local_id?: string
  descricao?: string
  cliente_id: string
  categoria_conta_id?: string
  valor_integral: string
  valor_recebido?: string
  data_vencimento: string
  data_recebimento?: string
  status: '1' | '0'
  tipo_pagamento: string
  observacao?: string
  observacao2?: string
  observacao3?: string
}

export async function createContaReceber(payload: ContaReceberUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/contas-receber', payload as any, { successMessage: 'Conta a receber cadastrada com sucesso.' })
}

export async function updateContaReceber(id: string, payload: ContaReceberUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/contas-receber/${encodeURIComponent(id)}`, payload as any, { successMessage: 'Conta a receber atualizada com sucesso.' })
}

export async function deleteContaReceber(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/contas-receber/${encodeURIComponent(id)}`, { successMessage: 'Conta removida com sucesso.' })
  return true
}

