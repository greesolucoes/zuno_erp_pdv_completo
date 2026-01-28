import type { SalaAtendimentoDraft, SalaAtendimentoUpsertPayload } from '../../../../composables/createSalaAtendimentoDraft'

export type SalaAtendimento = SalaAtendimentoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type SalasAtendimentoLoadOptions = {
  tipos: SelectOption<'consultorio' | 'cirurgia' | 'banho_tosa'>[]
  status: SelectOption<'ativa' | 'inativa'>[]
}

const tipos: SalasAtendimentoLoadOptions['tipos'] = [
  { value: 'consultorio', label: 'Consultório' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'banho_tosa', label: 'Banho e tosa' },
]

const statusOptions: SalasAtendimentoLoadOptions['status'] = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
]

let nextId = 1
const db = new Map<string, SalaAtendimento>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<SalaAtendimento, 'id'>> = [
    {
      nome: 'Sala 01',
      identificador: 'S-01',
      tipo: 'consultorio',
      status: 'ativa',
      capacidade: '2',
      equipamentos: 'Balança; Mesa de exame',
      observacoes: '',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      nome: 'Centro cirúrgico',
      identificador: 'CC-01',
      tipo: 'cirurgia',
      status: 'inativa',
      capacidade: '1',
      equipamentos: 'Mesa cirúrgica; Monitor; Autoclave',
      observacoes: 'Em manutenção.',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const sala: SalaAtendimento = { id: String(nextId++), ...seed }
    db.set(sala.id, sala)
  }
}

export async function loadSalasAtendimentoOptions(): Promise<SalasAtendimentoLoadOptions> {
  ensureSeeded()
  return { tipos, status: statusOptions }
}

export function listSalasAtendimento(search?: string): SalaAtendimento[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((s) => {
    return (
      s.nome.toLowerCase().includes(normalized) ||
      s.identificador.toLowerCase().includes(normalized) ||
      s.tipo.toLowerCase().includes(normalized) ||
      s.status.toLowerCase().includes(normalized)
    )
  })
}

export async function getSalaAtendimentoById(id: string): Promise<SalaAtendimento | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createSalaAtendimento(payload: SalaAtendimentoUpsertPayload): Promise<SalaAtendimento> {
  ensureSeeded()
  const now = nowIso()
  const sala: SalaAtendimento = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(sala.id, sala)
  return sala
}

export async function updateSalaAtendimento(id: string, payload: SalaAtendimentoUpsertPayload): Promise<SalaAtendimento | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: SalaAtendimento = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

