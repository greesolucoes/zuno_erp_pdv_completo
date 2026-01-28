import type { PetDraft, PetUpsertPayload } from '../../../composables/createNovoPetDraft'
import { apiGet, apiPost, apiPut } from '../../http'

export type Pet = PetDraft & {
  id: string
  tutor: string
}

export type SelectOption = { id: string; label: string }

export type PetsLoadOptions = {
  clientes: SelectOption[]
  especies: SelectOption[]
  racasByEspecie: Record<string, SelectOption[]>
  pelagens: SelectOption[]
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

export async function listPets(params?: { busca?: string; page?: number }): Promise<PaginatedResponse<Pet>> {
  return apiGet<PaginatedResponse<Pet>>('/petshop/pets', {
    busca: params?.busca ?? '',
    page: params?.page ?? 1,
  })
}

export async function loadPetsOptions(): Promise<PetsLoadOptions> {
  return apiGet<PetsLoadOptions>('/petshop/pets/options')
}

export async function getPetById(id: string): Promise<Pet> {
  return apiGet<Pet>(`/petshop/pets/${encodeURIComponent(id)}`)
}

export async function createPet(payload: PetUpsertPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/petshop/pets', payload as any)
}

export async function updatePet(id: string, payload: PetUpsertPayload): Promise<{ ok: true }> {
  return apiPut<{ ok: true }>(`/petshop/pets/${encodeURIComponent(id)}`, payload as any)
}
