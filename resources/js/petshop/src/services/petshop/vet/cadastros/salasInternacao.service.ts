import type { SalaInternacaoDraft, SalaInternacaoUpsertPayload } from '../../../../composables/createSalaInternacaoDraft'

export type SalaInternacao = SalaInternacaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type SalasInternacaoLoadOptions = {
  tipos: SelectOption<'enfermaria' | 'isolamento' | 'uti'>[]
  status: SelectOption<'ativa' | 'inativa'>[]
}

const tipos: SalasInternacaoLoadOptions['tipos'] = [
  { value: 'enfermaria', label: 'Enfermaria' },
  { value: 'isolamento', label: 'Isolamento' },
  { value: 'uti', label: 'UTI' },
]

const statusOptions: SalasInternacaoLoadOptions['status'] = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
]

let nextId = 1
const db = new Map<string, SalaInternacao>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<SalaInternacao, 'id'>> = [
    {
      nome: 'Internação 01',
      identificador: 'I-01',
      tipo: 'enfermaria',
      status: 'ativa',
      capacidade: '6',
      equipamentos: 'Oxímetro; Bombas de infusão',
      observacoes: '',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      nome: 'Isolamento',
      identificador: 'ISO-01',
      tipo: 'isolamento',
      status: 'ativa',
      capacidade: '2',
      equipamentos: 'EPI; Autoclave',
      observacoes: 'Uso exclusivo para casos infecciosos.',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const sala: SalaInternacao = { id: String(nextId++), ...seed }
    db.set(sala.id, sala)
  }
}

export async function loadSalasInternacaoOptions(): Promise<SalasInternacaoLoadOptions> {
  ensureSeeded()
  return { tipos, status: statusOptions }
}

export function listSalasInternacao(search?: string): SalaInternacao[] {
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

export async function getSalaInternacaoById(id: string): Promise<SalaInternacao | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createSalaInternacao(payload: SalaInternacaoUpsertPayload): Promise<SalaInternacao> {
  ensureSeeded()
  const now = nowIso()
  const sala: SalaInternacao = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(sala.id, sala)
  return sala
}

export async function updateSalaInternacao(id: string, payload: SalaInternacaoUpsertPayload): Promise<SalaInternacao | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: SalaInternacao = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

