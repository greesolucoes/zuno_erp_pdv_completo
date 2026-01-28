import type { PelagemDraft, PelagemUpsertPayload } from '../../../composables/createPelagemDraft'

export type Pelagem = PelagemDraft & {
  id: string
  created_at: string
}

let nextId = 1
const db = new Map<string, Pelagem>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const nomes = ['Curta', 'Média', 'Longa']
  for (const nome of nomes) {
    const pelagem: Pelagem = { id: String(nextId++), nome, created_at: nowIso() }
    db.set(pelagem.id, pelagem)
  }
}

export async function loadPelagensOptions(): Promise<Record<string, never>> {
  ensureSeeded()
  return {}
}

export function listPelagens(search?: string): Pelagem[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((p) => p.nome.toLowerCase().includes(normalized))
}

export async function getPelagemById(id: string): Promise<Pelagem | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createPelagem(payload: PelagemUpsertPayload): Promise<Pelagem> {
  ensureSeeded()

  const pelagem: Pelagem = {
    id: String(nextId++),
    nome: payload.nome.trim(),
    created_at: nowIso(),
  }

  db.set(pelagem.id, pelagem)
  return pelagem
}

export async function updatePelagem(id: string, payload: PelagemUpsertPayload): Promise<Pelagem | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: Pelagem = { ...existing, nome: payload.nome.trim() }
  db.set(id, updated)
  return updated
}

