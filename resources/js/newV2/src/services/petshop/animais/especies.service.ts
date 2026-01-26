import type { EspecieDraft, EspecieUpsertPayload } from '../../../composables/createEspecieDraft'

export type Especie = EspecieDraft & {
  id: string
  created_at: string
}

let nextId = 1
const db = new Map<string, Especie>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const nomes = ['Cachorro', 'Gato', 'Coelho', 'Pássaro', 'Hamster']
  for (const nome of nomes) {
    const especie: Especie = { id: String(nextId++), nome, created_at: nowIso() }
    db.set(especie.id, especie)
  }
}

export async function loadEspeciesOptions(): Promise<Record<string, never>> {
  ensureSeeded()
  return {}
}

export function listEspecies(search?: string): Especie[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((e) => e.nome.toLowerCase().includes(normalized))
}

export async function getEspecieById(id: string): Promise<Especie | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createEspecie(payload: EspecieUpsertPayload): Promise<Especie> {
  ensureSeeded()

  const especie: Especie = {
    id: String(nextId++),
    nome: payload.nome.trim(),
    created_at: nowIso(),
  }

  db.set(especie.id, especie)
  return especie
}

export async function updateEspecie(id: string, payload: EspecieUpsertPayload): Promise<Especie | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: Especie = {
    ...existing,
    nome: payload.nome.trim(),
  }

  db.set(id, updated)
  return updated
}

