import type { RacaDraft, RacaUpsertPayload } from '../../../composables/createRacaDraft'
import { loadEspeciesOptions, listEspecies } from './especies.service'

export type Raca = RacaDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type RacasLoadOptions = {
  especies: SelectOption[]
}

let nextId = 1
const db = new Map<string, Raca>()

function nowIso() {
  return new Date().toISOString()
}

async function ensureSeeded() {
  if (db.size) return

  await loadEspeciesOptions()
  const especies = listEspecies()
  const cachorroId = especies.find((e) => e.nome.toLowerCase() === 'cachorro')?.id ?? especies[0]?.id ?? '1'
  const gatoId = especies.find((e) => e.nome.toLowerCase() === 'gato')?.id ?? especies[1]?.id ?? cachorroId

  const seeds: Array<Pick<Raca, 'nome' | 'especie_id'>> = [
    { nome: 'SRD', especie_id: cachorroId },
    { nome: 'Poodle', especie_id: cachorroId },
    { nome: 'Labrador', especie_id: cachorroId },
    { nome: 'Siamês', especie_id: gatoId },
    { nome: 'Persa', especie_id: gatoId },
  ]

  for (const seed of seeds) {
    const raca: Raca = { id: String(nextId++), created_at: nowIso(), ...seed }
    db.set(raca.id, raca)
  }
}

export async function loadRacasOptions(): Promise<RacasLoadOptions> {
  await ensureSeeded()
  const especies = listEspecies().map((e) => ({ id: e.id, label: e.nome }))
  return { especies }
}

export function listRacas(search?: string): Raca[] {
  void ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((r) => r.nome.toLowerCase().includes(normalized) || r.especie_id.toLowerCase().includes(normalized))
}

export async function getRacaById(id: string): Promise<Raca | null> {
  await ensureSeeded()
  return db.get(id) ?? null
}

export async function createRaca(payload: RacaUpsertPayload): Promise<Raca> {
  await ensureSeeded()

  const raca: Raca = {
    id: String(nextId++),
    nome: payload.nome.trim(),
    especie_id: payload.especie_id,
    created_at: nowIso(),
  }

  db.set(raca.id, raca)
  return raca
}

export async function updateRaca(id: string, payload: RacaUpsertPayload): Promise<Raca | null> {
  await ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: Raca = {
    ...existing,
    nome: payload.nome.trim(),
    especie_id: payload.especie_id,
  }

  db.set(id, updated)
  return updated
}

