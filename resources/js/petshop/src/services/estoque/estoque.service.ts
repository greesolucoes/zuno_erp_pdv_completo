import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type EstoqueItem = {
  id: string
  produto_id: string
  produto_numero: string
  produto_nome: string
  categoria_nome: string
  quantidade: string
  valor_venda: string
  unidade: string
  local_id: string
  local_nome: string
}

export type EstoqueOptions = {
  produtos: Array<{ id: string; label: string }>
  categorias: Array<{ id: string; label: string }>
  locais: Array<{ id: string; label: string }>
  multiLocal: 1 | 0
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

export async function listEstoque(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<EstoqueItem>> {
  return apiGet<PaginatedResponse<EstoqueItem>>('/estoque', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadEstoqueOptions(): Promise<EstoqueOptions> {
  return apiGet<EstoqueOptions>('/estoque/options')
}

export async function getEstoqueById(id: string): Promise<EstoqueItem> {
  return apiGet<EstoqueItem>(`/estoque/${encodeURIComponent(id)}`)
}

export async function addEstoque(payload: { produto_id: string; quantidade: string; local_id?: string }): Promise<{ ok: true }> {
  return apiPost<{ ok: true }>('/estoque', payload as any, { successMessage: 'Estoque adicionado com sucesso.' })
}

export async function updateEstoqueQuantidade(id: string, payload: { quantidade: string }): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/estoque/${encodeURIComponent(id)}`, payload as any, { successMessage: 'Estoque atualizado com sucesso.' })
}

export async function deleteEstoque(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/estoque/${encodeURIComponent(id)}`, { successMessage: 'Estoque removido com sucesso.' })
  return true
}
