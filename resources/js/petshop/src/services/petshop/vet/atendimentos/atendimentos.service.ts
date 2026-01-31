import type { AtendimentoDraft, AtendimentoUpsertPayload } from '../../../../composables/createAtendimentoDraft'
import { listChecklistsSnapshot } from '../cadastros/checklist.service'
import { listMedicosSnapshot, loadMedicosOptions } from '../cadastros/medicos.service'
import { listSalasAtendimentoSnapshot, loadSalasAtendimentoOptions } from '../cadastros/salasAtendimento.service'
import { listModelosAtendimento } from '../cadastros/modeloAtendimento.service'

export type Atendimento = AtendimentoDraft & {
  id: string
  created_at: string
  updated_at: string
  inicio_atendimento: string
}

export type SelectOption = { id: string; label: string }

export type AtendimentoLoadOptions = {
  pacientes: Array<
    SelectOption & {
      tutor_id: string
      tutor_nome: string
      contato_tutor: string
      email_tutor: string
    }
  >
  veterinarios: SelectOption[]
  servicos: SelectOption[]
  salas: SelectOption[]
  horarios: string[]
  status: Array<{ value: AtendimentoDraft['status']; label: string }>
  modelosAtendimento: Array<{ id: string; title: string; content: string }>
  checklists: Array<{ id: string; titulo: string; itens: Array<{ texto: string }> }>
}

const servicos: SelectOption[] = [
  { id: 'consulta', label: 'Consulta' },
  { id: 'retorno', label: 'Retorno' },
  { id: 'vacina', label: 'Vacinação' },
  { id: 'procedimento', label: 'Procedimento' },
]

const pacientes: AtendimentoLoadOptions['pacientes'] = [
  {
    id: '1',
    label: 'Thor (Cachorro)',
    tutor_id: 't1',
    tutor_nome: 'Mariana Silva',
    contato_tutor: '(11) 98888-1001',
    email_tutor: 'mariana.silva@email.com',
  },
  {
    id: '2',
    label: 'Mingau (Gato)',
    tutor_id: 't2',
    tutor_nome: 'Carlos Pereira',
    contato_tutor: '(11) 97777-2002',
    email_tutor: 'carlos.pereira@email.com',
  },
  {
    id: '3',
    label: 'Luna (Coelho)',
    tutor_id: 't3',
    tutor_nome: 'Fernanda Almeida',
    contato_tutor: '(11) 96666-3003',
    email_tutor: 'fernanda.almeida@email.com',
  },
]

const statusOptions: AtendimentoLoadOptions['status'] = [
  { value: 'em_triagem', label: 'Em triagem' },
  { value: 'em_atendimento', label: 'Em atendimento' },
  { value: 'finalizado', label: 'Finalizado' },
]

let nextId = 1
const db = new Map<string, Atendimento>()

function nowIso() {
  return new Date().toISOString()
}

function todayBr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function ensureSeeded() {
  if (db.size) return

  const now = nowIso()
  const seeds: Array<Omit<Atendimento, 'id'>> = [
    {
      paciente_id: '1',
      veterinario_id: '1',
      servico_id: 'consulta',
      sala_id: '1',
      tutor_id: 't1',
      tutor_nome: 'Mariana Silva',
      contato_tutor: '(11) 98888-1001',
      email_tutor: 'mariana.silva@email.com',
      data_atendimento: todayBr(),
      horario: '09:30',
      motivo_visita: 'Vômito e apatia.',
      quick_attachments: [],
      triagem: {
        peso: '18.2',
        temperatura: '38.9',
        frequencia_cardiaca: '92',
        frequencia_respiratoria: '24',
        observacoes_triagem: '',
        checklists: {},
      },
      status: 'em_triagem',
      created_at: now,
      updated_at: now,
      inicio_atendimento: now,
    },
  ]

  for (const seed of seeds) {
    const atendimento: Atendimento = { id: String(nextId++), ...seed }
    db.set(atendimento.id, atendimento)
  }
}

export async function loadAtendimentosOptions(): Promise<AtendimentoLoadOptions> {
  ensureSeeded()

  const [medicosOptions] = await Promise.all([loadMedicosOptions(), loadSalasAtendimentoOptions()])

  const veterinarios: SelectOption[] = listMedicosSnapshot().map((m) => ({
    id: m.id,
    label: medicosOptions.funcionarios.find((f) => f.id === m.funcionario_id)?.label ?? `Médico ${m.id}`,
  }))

  const salas = listSalasAtendimentoSnapshot()
    .filter((s) => s.status === 'disponivel')
    .map((s) => ({ id: s.id, label: s.nome }))

  const modelosAtendimento = listModelosAtendimento()
    .filter((m) => m.status !== 'inativo')
    .map((m) => ({ id: m.id, title: m.title, content: m.content }))

  const checklists = listChecklistsSnapshot()
    .filter((c) => c.status === 'ativo')
    .map((c) => ({ id: c.id, titulo: c.titulo, itens: c.itens }))

  const horarios = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
  ]

  return {
    pacientes,
    veterinarios,
    servicos,
    salas,
    horarios,
    status: statusOptions,
    modelosAtendimento,
    checklists,
  }
}

export function listAtendimentos(search?: string): Atendimento[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((a) => {
    return (
      a.paciente_id.toLowerCase().includes(normalized) ||
      a.veterinario_id.toLowerCase().includes(normalized) ||
      a.servico_id.toLowerCase().includes(normalized) ||
      a.status.toLowerCase().includes(normalized)
    )
  })
}

export async function getAtendimentoById(id: string): Promise<Atendimento | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createAtendimento(payload: AtendimentoUpsertPayload): Promise<Atendimento> {
  ensureSeeded()
  const now = nowIso()
  const atendimento: Atendimento = { id: String(nextId++), ...payload, created_at: now, updated_at: now, inicio_atendimento: now }
  db.set(atendimento.id, atendimento)
  return atendimento
}

export async function updateAtendimento(id: string, payload: AtendimentoUpsertPayload): Promise<Atendimento | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: Atendimento = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

export async function deleteAtendimento(id: string): Promise<boolean> {
  ensureSeeded()
  return db.delete(id)
}
