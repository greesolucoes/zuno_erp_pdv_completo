import { apiDelete, apiGet, apiPost } from '../http'

export type RetiradaEstoqueItem = {
  id: string
  produto_id: string
  produto_nome: string
  quantidade: string
  motivo: string
  observacao: string
  local_id: string
  created_at: string
}

export type RetiradasOptions = {
  produtos: Array<{ id: string; label: string }>
  locais: Array<{ id: string; label: string }>
  multiLocal: 1 | 0
  motivos: Array<{ value: string; label: string }>
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

export async function listRetiradas(params?: { produto?: string; local_id?: string; page?: number }): Promise<PaginatedResponse<RetiradaEstoqueItem>> {
  return apiGet<PaginatedResponse<RetiradaEstoqueItem>>('/estoque/retiradas', {
    produto: params?.produto ?? '',
    local_id: params?.local_id ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadRetiradasOptions(): Promise<RetiradasOptions> {
  return apiGet<RetiradasOptions>('/estoque/retiradas/options')
}

export async function createRetirada(payload: {
  produto_id: string
  quantidade: string
  motivo: string
  observacao?: string
  local_id?: string
}): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/estoque/retiradas', payload as any, { successMessage: 'Retirada registrada com sucesso.' })
}

export async function deleteRetirada(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/estoque/retiradas/${encodeURIComponent(id)}`, { successMessage: 'Retirada removida com sucesso.' })
  return true
}
