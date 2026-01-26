import type { ChecklistDraft, ChecklistUpsertPayload } from '../../../../composables/createChecklistDraft'

export type Checklist = ChecklistDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ChecklistsLoadOptions = {
  tipos: SelectOption<'pre_atendimento' | 'internacao' | 'cirurgia' | 'banho_tosa'>[]
  status: SelectOption<'ativo' | 'inativo'>[]
}

const tipos: ChecklistsLoadOptions['tipos'] = [
  { value: 'pre_atendimento', label: 'Pré-atendimento' },
  { value: 'internacao', label: 'Internação' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'banho_tosa', label: 'Banho e tosa' },
]

const statusOptions: ChecklistsLoadOptions['status'] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

let nextId = 1
const db = new Map<string, Checklist>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<Checklist, 'id'>> = [
    {
      titulo: 'Checklist de pré-atendimento',
      tipo: 'pre_atendimento',
      status: 'ativo',
      descricao: 'Itens básicos antes do atendimento.',
      itens: [{ texto: 'Confirmar dados do tutor' }, { texto: 'Checar sinais vitais' }, { texto: 'Registrar queixa principal' }],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      titulo: 'Checklist de internação',
      tipo: 'internacao',
      status: 'ativo',
      descricao: '',
      itens: [{ texto: 'Identificação da baia/leito' }, { texto: 'Plano de medicação' }],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const checklist: Checklist = { id: String(nextId++), ...seed }
    db.set(checklist.id, checklist)
  }
}

export async function loadChecklistsOptions(): Promise<ChecklistsLoadOptions> {
  ensureSeeded()
  return { tipos, status: statusOptions }
}

export function listChecklists(search?: string): Checklist[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((c) => {
    const itensText = (c.itens ?? []).map((i) => i.texto).join(' ').toLowerCase()
    return (
      c.titulo.toLowerCase().includes(normalized) ||
      c.tipo.toLowerCase().includes(normalized) ||
      c.status.toLowerCase().includes(normalized) ||
      c.descricao.toLowerCase().includes(normalized) ||
      itensText.includes(normalized)
    )
  })
}

export async function getChecklistById(id: string): Promise<Checklist | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createChecklist(payload: ChecklistUpsertPayload): Promise<Checklist> {
  ensureSeeded()
  const now = nowIso()
  const checklist: Checklist = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(checklist.id, checklist)
  return checklist
}

export async function updateChecklist(id: string, payload: ChecklistUpsertPayload): Promise<Checklist | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: Checklist = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

