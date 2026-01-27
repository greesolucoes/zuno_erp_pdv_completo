import type { PetDraft, PetUpsertPayload } from '../../../composables/createNovoPetDraft'
import { httpJson } from '../../http'

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

export type PetsListResponse = {
  data: Pet[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function listPets(params?: { busca?: string; page?: number }): Promise<PetsListResponse> {
  const search = (params?.busca ?? '').trim()
  const page = params?.page && params.page > 0 ? params.page : 1

  const url = new URL('/v2/api/petshop/pets', window.location.origin)
  if (search) url.searchParams.set('busca', search)
  if (page && page !== 1) url.searchParams.set('page', String(page))

  return httpJson<PetsListResponse>(url)
}

export async function loadPetsOptions(): Promise<PetsLoadOptions> {
  return httpJson<PetsLoadOptions>('/v2/api/petshop/pets/options')
}

export async function getPetById(id: string): Promise<Pet> {
  return httpJson<Pet>(`/v2/api/petshop/pets/${encodeURIComponent(id)}`)
}

export async function createPet(payload: PetUpsertPayload): Promise<{ id: string }> {
  return httpJson<{ id: string }>('/v2/api/petshop/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updatePet(id: string, payload: PetUpsertPayload): Promise<{ ok: true }> {
  return httpJson<{ ok: true }>(`/v2/api/petshop/pets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
