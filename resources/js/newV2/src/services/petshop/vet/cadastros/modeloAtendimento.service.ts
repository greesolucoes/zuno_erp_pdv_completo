import type { ModeloAtendimentoDraft, ModeloAtendimentoUpsertPayload } from '../../../../composables/createModeloAtendimentoDraft'

export type ModeloAtendimento = ModeloAtendimentoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloAtendimentoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
}

const statusOptions: ModeloAtendimentoLoadOptions['status'] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

const categories = ['Consulta', 'Internação', 'Cirurgia', 'Emergência']

let nextId = 1
const db = new Map<string, ModeloAtendimento>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seed: Array<Omit<ModeloAtendimento, 'id'>> = [
    {
      title: 'Atendimento padrão (rascunho)',
      category: 'Consulta',
      notes: 'Modelo inicial. Complete o conteúdo depois.',
      content: '',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      title: 'Atendimento clínico (publicado)',
      category: 'Consulta',
      status: 'ativo',
      notes: 'Script padrão para consultas clínicas.',
      content: '<p><b>Anamnese:</b> ...</p><p><b>Exame físico:</b> ...</p>',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const item of seed) {
    const model: ModeloAtendimento = { id: String(nextId++), ...item }
    db.set(model.id, model)
  }
}

export async function loadModeloAtendimentoOptions(): Promise<ModeloAtendimentoLoadOptions> {
  ensureSeeded()
  return { categories, status: statusOptions }
}

export function listModelosAtendimento(search?: string): ModeloAtendimento[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((m) => {
    const status = (m.status ?? '').toLowerCase()
    return (
      m.title.toLowerCase().includes(normalized) ||
      (m.category ?? '').toLowerCase().includes(normalized) ||
      status.includes(normalized)
    )
  })
}

export async function getModeloAtendimentoById(id: string): Promise<ModeloAtendimento | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createModeloAtendimento(payload: ModeloAtendimentoUpsertPayload): Promise<ModeloAtendimento> {
  ensureSeeded()
  const now = nowIso()
  const model: ModeloAtendimento = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(model.id, model)
  return model
}

export async function updateModeloAtendimento(id: string, payload: ModeloAtendimentoUpsertPayload): Promise<ModeloAtendimento | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: ModeloAtendimento = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

