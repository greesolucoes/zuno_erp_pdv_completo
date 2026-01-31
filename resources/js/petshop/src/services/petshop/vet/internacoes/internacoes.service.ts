import type { InternacaoDraft, InternacaoUpsertPayload } from '../../../../composables/createInternacaoDraft'
import { loadAtendimentosOptions } from '../atendimentos/atendimentos.service'
import { listMedicosSnapshot, loadMedicosOptions } from '../cadastros/medicos.service'
import { listSalasInternacaoSnapshot } from '../cadastros/salasInternacao.service'

export type Internacao = InternacaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption = { id: string; label: string }

export type InternacoesLoadOptions = {
  patients: Array<
    SelectOption & {
      tutor_nome: string
    }
  >
  rooms: SelectOption[]
  veterinarios: SelectOption[]
  riskLevels: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: InternacaoDraft['status']; label: string }>
}

const riskLevels: InternacoesLoadOptions['riskLevels'] = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
]

const statusOptions: InternacoesLoadOptions['statusOptions'] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Internado' },
  { value: 'discharged', label: 'Alta' },
]

let nextId = 1
const db = new Map<string, Internacao>()

function nowIso() {
  return new Date().toISOString()
}

function todayBr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function ensureSeeded() {
  if (db.size) return
  const now = nowIso()

  const seeds: Array<Omit<Internacao, 'id'>> = [
    {
      atendimento_id: '1',
      status: 'active',
      patient_id: '1',
      sala_internacao_id: '1',
      veterinario_id: '1',
      admission_date: todayBr(0),
      admission_time: '10:30',
      expected_discharge_date: todayBr(2),
      nivel_risco: 'medio',
      reason: 'Observação pós procedimento.',
      notes: '',
      created_at: now,
      updated_at: now,
    },
    {
      atendimento_id: '',
      status: 'draft',
      patient_id: '2',
      sala_internacao_id: '2',
      veterinario_id: '1',
      admission_date: todayBr(0),
      admission_time: '14:00',
      expected_discharge_date: '',
      nivel_risco: 'alto',
      reason: 'Paciente em avaliação para internação.',
      notes: 'Aguardar retorno de exames.',
      created_at: now,
      updated_at: now,
    },
    {
      atendimento_id: '3',
      status: 'discharged',
      patient_id: '3',
      sala_internacao_id: '1',
      veterinario_id: '1',
      admission_date: todayBr(-3),
      admission_time: '09:00',
      expected_discharge_date: todayBr(-1),
      nivel_risco: 'baixo',
      reason: 'Internação para hidratação e observação.',
      notes: 'Alta sem intercorrências.',
      created_at: now,
      updated_at: now,
    },
  ]

  for (const seed of seeds) {
    const item: Internacao = { id: String(nextId++), ...seed }
    db.set(item.id, item)
  }
}

export async function loadInternacoesOptions(): Promise<InternacoesLoadOptions> {
  ensureSeeded()

  const atendimentosOptions = await loadAtendimentosOptions()
  const medicosOptions = await loadMedicosOptions()

  const patients = atendimentosOptions.pacientes.map((p) => ({ id: p.id, label: p.label, tutor_nome: p.tutor_nome }))

  const rooms = listSalasInternacaoSnapshot()
    .filter((s) => s.status === 'disponivel')
    .map((s) => ({ id: s.id, label: s.nome }))

  const veterinarios = listMedicosSnapshot().map((m) => ({
    id: m.id,
    label: medicosOptions.funcionarios.find((f) => f.id === m.funcionario_id)?.label ?? `Médico ${m.id}`,
  }))

  return { patients, rooms, veterinarios, riskLevels, statusOptions }
}

export function listInternacoes(search?: string): Internacao[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((i) => {
    return (
      i.patient_id.toLowerCase().includes(normalized) ||
      i.veterinario_id.toLowerCase().includes(normalized) ||
      i.sala_internacao_id.toLowerCase().includes(normalized) ||
      i.status.toLowerCase().includes(normalized) ||
      i.nivel_risco.toLowerCase().includes(normalized)
    )
  })
}

export async function getInternacaoById(id: string): Promise<Internacao | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createInternacao(payload: InternacaoUpsertPayload): Promise<Internacao> {
  ensureSeeded()
  const now = nowIso()
  const item: Internacao = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(item.id, item)
  return item
}

export async function updateInternacao(id: string, payload: InternacaoUpsertPayload): Promise<Internacao | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: Internacao = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}
