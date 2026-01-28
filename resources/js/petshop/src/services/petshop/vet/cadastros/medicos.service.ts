import type { MedicoDraft, MedicoUpsertPayload } from '../../../../composables/createMedicoDraft'

export type Medico = MedicoDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type MedicosLoadOptions = {
  funcionarios: SelectOption[]
}

let nextId = 1
const db = new Map<string, Medico>()

const funcionarios: SelectOption[] = [
  { id: '1', label: 'Dra. Ana Souza' },
  { id: '2', label: 'Dr. Bruno Lima' },
  { id: '3', label: 'Dra. Carla Oliveira' },
]

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<Medico, 'id'>> = [
    {
      funcionario_id: '1',
      status: 'ativo',
      crmv: 'SP-12345',
      especialidade: 'Clínica geral',
      email: 'ana.souza@petshop.com',
      telefone: '(11) 99999-0001',
      observacoes: '',
      created_at: nowIso(),
    },
    {
      funcionario_id: '2',
      status: 'inativo',
      crmv: 'RJ-54321',
      especialidade: 'Dermatologia',
      email: '',
      telefone: '',
      observacoes: 'Retornará no próximo semestre.',
      created_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const medico: Medico = { id: String(nextId++), ...seed }
    db.set(medico.id, medico)
  }
}

export async function loadMedicosOptions(): Promise<MedicosLoadOptions> {
  ensureSeeded()
  return { funcionarios }
}

export function listMedicos(search?: string): Medico[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((m) => {
    const funcionarioLabel = funcionarios.find((f) => f.id === m.funcionario_id)?.label ?? m.funcionario_id
    return (
      funcionarioLabel.toLowerCase().includes(normalized) ||
      m.funcionario_id.toLowerCase().includes(normalized) ||
      m.crmv.toLowerCase().includes(normalized) ||
      m.especialidade.toLowerCase().includes(normalized) ||
      m.status.toLowerCase().includes(normalized)
    )
  })
}

export async function getMedicoById(id: string): Promise<Medico | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createMedico(payload: MedicoUpsertPayload): Promise<Medico> {
  ensureSeeded()

  const medico: Medico = {
    id: String(nextId++),
    ...payload,
    created_at: nowIso(),
  }

  db.set(medico.id, medico)
  return medico
}

export async function updateMedico(id: string, payload: MedicoUpsertPayload): Promise<Medico | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: Medico = { ...existing, ...payload, id }
  db.set(id, updated)
  return updated
}

