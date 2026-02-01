import { apiGet, apiPost } from '../http'

export type ApontamentoItem = {
  id: string
  produto_id: string
  produto_nome: string
  quantidade: string
  created_at: string
}

export type ApontamentosOptions = {
  produtosCompostos: Array<{ id: string; label: string }>
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

export async function listApontamentos(params?: { page?: number }): Promise<PaginatedResponse<ApontamentoItem>> {
  return apiGet<PaginatedResponse<ApontamentoItem>>('/estoque/apontamentos', { page: params?.page ?? 1 })
}

export async function loadApontamentosOptions(): Promise<ApontamentosOptions> {
  return apiGet<ApontamentosOptions>('/estoque/apontamentos/options')
}

export async function createApontamento(payload: { produto_composto_id: string; quantidade: string }): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/estoque/apontamentos', payload as any, { successMessage: 'Apontamento realizado com sucesso.' })
}

export async function getApontamentoPrintUrl(id: string): Promise<{ url: string }> {
  return apiGet<{ url: string }>(`/estoque/apontamentos/${encodeURIComponent(id)}/imprimir`)
}
