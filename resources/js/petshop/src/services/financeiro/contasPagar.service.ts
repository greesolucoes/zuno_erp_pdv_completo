import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type ContaPagar = {
  id: string
  local_id: string
  local_nome: string
  descricao: string
  fornecedor_id: string
  fornecedor_nome: string
  categoria_conta_id: string
  categoria_nome: string
  valor_integral: string
  valor_pago: string
  data_vencimento: string
  data_pagamento: string
  status: '1' | '0'
  tipo_pagamento: string
  observacao: string
  observacao2: string
  observacao3: string
  created_at: string
  updated_at: string
}

export type ContasPagarOptions = {
  fornecedores: Array<{ id: string; label: string }>
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

export async function listContasPagar(params?: {
  fornecedor_id?: string
  filtro_data?: string
  start_date?: string
  end_date?: string
  local_id?: string
  status?: string
  ordem?: string
  categoria_conta_id?: string
  page?: number
}): Promise<PaginatedResponse<ContaPagar>> {
  return apiGet<PaginatedResponse<ContaPagar>>('/contas-pagar', {
    fornecedor_id: params?.fornecedor_id ?? '',
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

export async function loadContasPagarOptions(): Promise<ContasPagarOptions> {
  return apiGet<ContasPagarOptions>('/contas-pagar/options')
}

export async function getContaPagarById(id: string): Promise<ContaPagar | null> {
  try {
    return await apiGet<ContaPagar>(`/contas-pagar/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export type ContaPagarUpsertPayload = {
  local_id?: string
  descricao?: string
  fornecedor_id: string
  categoria_conta_id?: string
  valor_integral: string
  valor_pago?: string
  data_vencimento: string
  data_pagamento?: string
  status: '1' | '0'
  tipo_pagamento: string
  observacao?: string
  observacao2?: string
  observacao3?: string
}

export async function createContaPagar(payload: ContaPagarUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/contas-pagar', payload as any, { successMessage: 'Conta a pagar cadastrada com sucesso.' })
}

export async function updateContaPagar(id: string, payload: ContaPagarUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/contas-pagar/${encodeURIComponent(id)}`, payload as any, { successMessage: 'Conta a pagar atualizada com sucesso.' })
}

export async function deleteContaPagar(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/contas-pagar/${encodeURIComponent(id)}`, { successMessage: 'Conta removida com sucesso.' })
  return true
}

