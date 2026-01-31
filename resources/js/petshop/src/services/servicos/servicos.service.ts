import type { ApiError } from '../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../http'

export type Servico = {
  id: string
  numero_sequencial: string
  nome: string
  categoria_id: string
  categoria_nome: string
  unidade_cobranca: string
  valor: string
  tempo_servico: string
  comissao: string
  tempo_adicional: string
  valor_adicional: string
  tempo_tolerancia: string
  codigo_servico: string
  codigo_tributacao_municipio: string
  status: '1' | '0'
  reserva: '1' | '0'
  padrao_reserva_nfse: '1' | '0'
  marketplace: '1' | '0'
  destaque_marketplace: '1' | '0'
  descricao: string
  aliquota_iss: string
  aliquota_pis: string
  aliquota_cofins: string
  aliquota_inss: string
  aliquota_ir: string
  aliquota_csll: string
  valor_deducoes: string
  desconto_incondicional: string
  desconto_condicional: string
  outras_retencoes: string
  codigo_cnae: string
  estado_local_prestacao_servico: string
  natureza_operacao: string
  created_at: string
  updated_at: string
}

export type ServicosLoadOptions = {
  categorias: Array<{ id: string; label: string }>
  status: Array<{ value: string; label: string }>
  simNao: Array<{ value: string; label: string }>
  unidadesCobranca: Array<{ value: string; label: string }>
  ufs: Array<{ value: string; label: string }>
  plans: { reservas: 1 | 0; delivery: 1 | 0 }
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

export type ServicoUpsertPayload = {
  nome: string
  valor: string
  tempo_servico: string
  comissao: string
  unidade_cobranca: string
  categoria_id: string
  tempo_adicional: string
  valor_adicional: string
  tempo_tolerancia: string
  codigo_servico: string
  codigo_tributacao_municipio: string
  status: '1' | '0'
  reserva: '1' | '0'
  padrao_reserva_nfse: '1' | '0'
  marketplace: '1' | '0'
  destaque_marketplace: '1' | '0'
  descricao: string
  aliquota_iss: string
  aliquota_pis: string
  aliquota_cofins: string
  aliquota_inss: string
  aliquota_ir: string
  aliquota_csll: string
  valor_deducoes: string
  desconto_incondicional: string
  desconto_condicional: string
  outras_retencoes: string
  codigo_cnae: string
  estado_local_prestacao_servico: string
  natureza_operacao: string
}

export async function listServicos(params?: { busca?: string; status?: string; page?: number }): Promise<PaginatedResponse<Servico>> {
  return apiGet<PaginatedResponse<Servico>>('/servicos', {
    busca: params?.busca ?? '',
    status: params?.status ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadServicosOptions(): Promise<ServicosLoadOptions> {
  return apiGet<ServicosLoadOptions>('/servicos/options')
}

export async function getServicoById(id: string): Promise<Servico | null> {
  try {
    return await apiGet<Servico>(`/servicos/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createServico(payload: ServicoUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/servicos', payload as any, { successMessage: 'Serviço cadastrado com sucesso.' })
}

export async function updateServico(id: string, payload: ServicoUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/servicos/${encodeURIComponent(id)}`, payload as any, { successMessage: 'Serviço atualizado com sucesso.' })
}

export async function deleteServico(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/servicos/${encodeURIComponent(id)}`, { successMessage: 'Serviço removido com sucesso.' })
  return true
}
