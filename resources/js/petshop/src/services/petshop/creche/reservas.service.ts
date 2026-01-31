import type { ReservaCrecheDraft, ReservaCrecheUpsertPayload } from '../../../composables/createReservaCrecheDraft'
import type { ApiError } from '../../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../../http'

export type ReservaCreche = ReservaCrecheDraft & {
  id: string
  created_at: string
  updated_at: string
  valor_total: string
}

export type SelectOption = { id: string; label: string }

export type PetOption = SelectOption & {
  cliente_id: string
  cliente_nome: string
  animal_info: string
}

export type TurmaOption = SelectOption & {
  unidade: string
}

export type ServicoOption = SelectOption & {
  categoria: string
  tempo_execucao: string
  valor: string
}

export type ProdutoOption = SelectOption & {
  valor_unitario: string
}

export type ReservasCrecheLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  turmas: TurmaOption[]
  estados: Array<{ value: ReservaCrecheDraft['estado']; label: string }>
  servicos: ServicoOption[]
  produtos: ProdutoOption[]
  servicoPrincipal: SelectOption[]
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

export async function listReservasCreche(params?: { busca?: string; page?: number; turma_id?: string; estado?: string }): Promise<PaginatedResponse<ReservaCreche>> {
  return apiGet<PaginatedResponse<ReservaCreche>>('/petshop/creche/reservas', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    turma_id: params?.turma_id ?? '',
    estado: params?.estado ?? '',
  })
}

export async function listAllReservasCreche(): Promise<ReservaCreche[]> {
  const all: ReservaCreche[] = []
  let page = 1
  let lastPage = 1

  do {
    const resp = await listReservasCreche({ busca: '', page })
    all.push(...(resp.data ?? []))
    lastPage = resp.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return all
}

export async function loadReservasCrecheOptions(): Promise<ReservasCrecheLoadOptions> {
  return apiGet<ReservasCrecheLoadOptions>('/petshop/creche/reservas/options')
}

export async function getReservaCrecheById(id: string): Promise<ReservaCreche | null> {
  try {
    return await apiGet<ReservaCreche>(`/petshop/creche/reservas/${encodeURIComponent(id)}`, undefined, { suppressErrorFeedback: true })
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createReservaCreche(payload: ReservaCrecheUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/creche/reservas', payload as any)
}

export async function updateReservaCreche(id: string, payload: ReservaCrecheUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/creche/reservas/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteReservaCreche(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/petshop/creche/reservas/${encodeURIComponent(id)}`)
  return true
}
