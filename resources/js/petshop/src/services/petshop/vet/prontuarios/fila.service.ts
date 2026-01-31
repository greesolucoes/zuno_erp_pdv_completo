import type { FilaProntuarioDraft, FilaProntuarioUpsertPayload, TipoAtendimento } from '../../../../composables/createFilaProntuarioDraft'
import { loadAtendimentosOptions } from '../atendimentos/atendimentos.service'
import { listChecklistsSnapshot } from '../cadastros/checklist.service'
import { listAllModelosAvaliacao } from '../cadastros/modeloAvaliacao.service'

export type FilaProntuario = FilaProntuarioDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption = { id: string; label: string }

export type SlotOption = { value: string; label: string }

export type FilaProntuarioLoadOptions = {
  pacientes: Array<
    SelectOption & {
      tutor_id: string
      tutor_nome: string
      contato_tutor: string
      email_tutor: string
    }
  >
  veterinarios: SelectOption[]
  status: Array<{ value: string; label: string }>
  tiposAtendimento: Array<{ value: TipoAtendimento; label: string }>
  slots: SlotOption[]
  modelosAvaliacao: Array<{ id: string; title: string; fields: any[] }>
  checklists: Array<{ id: string; titulo: string; itens: Array<{ texto: string }> }>
}

const statusOptions: FilaProntuarioLoadOptions['status'] = [
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'em_atendimento', label: 'Em atendimento' },
  { value: 'finalizado', label: 'Finalizado' },
]

const tiposAtendimento: FilaProntuarioLoadOptions['tiposAtendimento'] = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'pos-operatorio', label: 'Pós-operatório' },
  { value: 'emergencia', label: 'Emergência' },
]

let nextId = 1
const db = new Map<string, FilaProntuario>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const now = nowIso()
  const seeds: Array<Omit<FilaProntuario, 'id'>> = [
    {
      prontuario_id: 'P-0001',
      atendimento_id: '1',
      status: 'aguardando',
      paciente_id: '1',
      veterinario_id: '1',
      tipo_atendimento: 'consulta',
      slot: '09:30',
      resumo_rapido: '<p>Paciente com apatia e vômito.</p>',
      modelo_avaliacao_id: '1',
      avaliacao_campos: {},
      checklists: {},
      anexos: [],
      created_at: now,
      updated_at: now,
    },
    {
      prontuario_id: 'P-0002',
      atendimento_id: '2',
      status: 'em_atendimento',
      paciente_id: '2',
      veterinario_id: '1',
      tipo_atendimento: 'retorno',
      slot: '10:00',
      resumo_rapido: '<p>Retorno para reavaliação.</p>',
      modelo_avaliacao_id: '1',
      avaliacao_campos: {},
      checklists: {},
      anexos: [],
      created_at: now,
      updated_at: now,
    },
    {
      prontuario_id: 'P-0003',
      atendimento_id: '3',
      status: 'finalizado',
      paciente_id: '3',
      veterinario_id: '1',
      tipo_atendimento: 'emergencia',
      slot: '08:30',
      resumo_rapido: '<p>Atendimento de emergência finalizado.</p>',
      modelo_avaliacao_id: '1',
      avaliacao_campos: {},
      checklists: {},
      anexos: [],
      created_at: now,
      updated_at: now,
    },
  ]

  for (const seed of seeds) {
    const item: FilaProntuario = { id: String(nextId++), ...seed }
    db.set(item.id, item)
  }
}

export async function loadFilaProntuariosOptions(): Promise<FilaProntuarioLoadOptions> {
  ensureSeeded()

  const atendimentosOptions = await loadAtendimentosOptions()

  const modelosAvaliacao = (await listAllModelosAvaliacao({ status: 'ativo' })).map((m) => ({ id: m.id, title: m.title, fields: m.fields }))

  const checklists = listChecklistsSnapshot()
    .filter((c) => c.status === 'ativo')
    .map((c) => ({ id: c.id, titulo: c.titulo, itens: c.itens }))

  const slots: SlotOption[] = [
    { value: '08:00', label: '08:00' },
    { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' },
    { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' },
    { value: '11:30', label: '11:30' },
    { value: '13:00', label: '13:00' },
    { value: '13:30', label: '13:30' },
    { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' },
    { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' },
  ]

  return {
    pacientes: atendimentosOptions.pacientes,
    veterinarios: atendimentosOptions.veterinarios,
    status: statusOptions,
    tiposAtendimento,
    slots,
    modelosAvaliacao,
    checklists,
  }
}

export function listFilaProntuarios(search?: string): FilaProntuario[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((r) => {
    return (
      r.prontuario_id.toLowerCase().includes(normalized) ||
      r.paciente_id.toLowerCase().includes(normalized) ||
      r.veterinario_id.toLowerCase().includes(normalized) ||
      r.status.toLowerCase().includes(normalized) ||
      r.tipo_atendimento.toLowerCase().includes(normalized)
    )
  })
}

export async function getFilaProntuarioById(id: string): Promise<FilaProntuario | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createFilaProntuario(payload: FilaProntuarioUpsertPayload): Promise<FilaProntuario> {
  ensureSeeded()
  const now = nowIso()
  const item: FilaProntuario = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(item.id, item)
  return item
}

export async function updateFilaProntuario(id: string, payload: FilaProntuarioUpsertPayload): Promise<FilaProntuario | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: FilaProntuario = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}
