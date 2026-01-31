import type { ReservaHotelDraft, ReservaHotelUpsertPayload } from '../../../composables/createReservaHotelDraft'
import type { ApiError } from '../../http'
import { apiDelete, apiGet, apiPost, apiPut } from '../../http'

export type ReservaHotel = ReservaHotelDraft & {
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

export type QuartoOption = SelectOption & {
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

export type ReservasHotelLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  quartos: QuartoOption[]
  estados: Array<{ value: ReservaHotelDraft['estado']; label: string }>
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

export async function listReservasHotel(params?: { busca?: string; page?: number; quarto_id?: string; estado?: string }): Promise<PaginatedResponse<ReservaHotel>> {
  return apiGet<PaginatedResponse<ReservaHotel>>('/petshop/hotel/reservas', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
    quarto_id: params?.quarto_id ?? '',
    estado: params?.estado ?? '',
  })
}

export async function listAllReservasHotel(): Promise<ReservaHotel[]> {
  const all: ReservaHotel[] = []
  let page = 1
  let lastPage = 1

  do {
    const resp = await listReservasHotel({ busca: '', page })
    all.push(...(resp.data ?? []))
    lastPage = resp.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return all
}

export async function loadReservasHotelOptions(): Promise<ReservasHotelLoadOptions> {
  return apiGet<ReservasHotelLoadOptions>('/petshop/hotel/reservas/options')
}

export async function getReservaHotelById(id: string): Promise<ReservaHotel | null> {
  try {
    return await apiGet<ReservaHotel>(`/petshop/hotel/reservas/${encodeURIComponent(id)}`)
  } catch (e) {
    const err = e as Partial<ApiError> | null
    if (err?.status === 404) return null
    throw e
  }
}

export async function createReservaHotel(payload: ReservaHotelUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/hotel/reservas', payload as any)
}

export async function updateReservaHotel(id: string, payload: ReservaHotelUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/hotel/reservas/${encodeURIComponent(id)}`, payload as any)
}

export async function deleteReservaHotel(id: string): Promise<boolean> {
  await apiDelete<{ ok: true }>(`/petshop/hotel/reservas/${encodeURIComponent(id)}`)
  return true
}

