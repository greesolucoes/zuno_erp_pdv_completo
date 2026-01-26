import type { ReservaCrecheDraft, ReservaCrecheUpsertPayload } from '../../../composables/createReservaCrecheDraft'
import { listPets, loadPetsOptions } from '../animais/pets.service'
import { loadMedicosOptions } from '../vet/cadastros/medicos.service'

export type ReservaCreche = ReservaCrecheDraft & {
  id: string
  created_at: string
  updated_at: string
  valor_total: string
}

export type SelectOption = { id: string; label: string }

export type PetOption = SelectOption & {
  cliente_id: string
  cliente_nome: string
  animal_info: string
}

export type TurmaOption = SelectOption & {
  unidade: string
}

export type ServicoOption = SelectOption & {
  categoria: string
  tempo_execucao: string
  valor: string
}

export type ProdutoOption = SelectOption & {
  valor_unitario: string
}

export type ReservasCrecheLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  turmas: TurmaOption[]
  estados: Array<{ value: ReservaCrecheDraft['estado']; label: string }>
  servicos: ServicoOption[]
  produtos: ProdutoOption[]
  servicoPrincipal: SelectOption[]
}

const estados: ReservasCrecheLoadOptions['estados'] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const turmas: TurmaOption[] = [
  { id: 'T1', label: 'Turma Filhotes', unidade: 'Matriz' },
  { id: 'T2', label: 'Turma Pequenos', unidade: 'Matriz' },
  { id: 'T3', label: 'Turma Socialização', unidade: 'Unidade 2' },
]

const servicoPrincipal: ReservasCrecheLoadOptions['servicoPrincipal'] = [
  { id: 'diaria', label: 'Diária' },
  { id: 'pacote', label: 'Pacote' },
]

const servicos: ServicoOption[] = [
  { id: 'banho', label: 'Banho', categoria: 'servico', tempo_execucao: '60', valor: '80,00' },
  { id: 'tosa', label: 'Tosa', categoria: 'servico', tempo_execucao: '90', valor: '120,00' },
  { id: 'frete', label: 'Frete', categoria: 'frete', tempo_execucao: '0', valor: '30,00' },
]

const produtos: ProdutoOption[] = [
  { id: 'racao', label: 'Ração', valor_unitario: '15,00' },
  { id: 'petisco', label: 'Petisco', valor_unitario: '8,50' },
]

let nextId = 1
const db = new Map<string, ReservaCreche>()

function nowIso() {
  return new Date().toISOString()
}

function addDaysBr(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function parseMoneyBr(input: string) {
  const normalized = String(input ?? '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
  const parsed = Number.parseFloat(normalized || '0')
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoneyBr(value: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function computeTotal(payload: ReservaCrecheDraft) {
  const principal = parseMoneyBr(payload.servico_principal_valor)
  const extras = (payload.servicos_extras ?? []).reduce((sum, s) => sum + parseMoneyBr(s.servico_valor), 0)
  const produtosTotal = (payload.produtos ?? []).reduce((sum, p) => sum + parseMoneyBr(p.subtotal_produto), 0)
  const frete = parseMoneyBr(payload.frete?.subtotal_servico ?? '')
  return formatMoneyBr(principal + extras + produtosTotal + frete)
}

function ensureSeeded() {
  if (db.size) return

  const now = nowIso()
  const seed: Array<Omit<ReservaCreche, 'id'>> = [
    {
      ordem_servico: 'OS-2001',
      animal_id: '100',
      colaborador_id: '1',
      estado: 'agendado',
      descricao: 'Reserva de teste creche.',
      animal_info: '{"porte":"","observacao":""}',
      id_animal: '100',
      cliente_id: '1',
      nome_colaborador: 'Dra. Ana Souza',
      id_colaborador: '1',
      data_entrada: addDaysBr(0),
      horario_entrada: '08:00',
      data_saida: '',
      horario_saida: '',
      turma_id: 'T2',
      nome_turma: 'Turma Pequenos',
      id_turma: 'T2',
      servico_principal_id: 'diaria',
      servico_principal_valor: '120,00',
      servicos_extras: [{ servico_id: 'banho', servico_categoria: 'servico', tempo_execucao: '60', servico_data: addDaysBr(0), servico_hora: '10:00', servico_valor: '80,00' }],
      produtos: [],
      frete: { servico_id: '', servico_categoria: 'frete', tempo_execucao: '', subtotal_servico: '', endereco_cliente: '' },
      created_at: now,
      updated_at: now,
      valor_total: '200,00',
    },
    {
      ordem_servico: 'OS-2002',
      animal_id: '101',
      colaborador_id: '2',
      estado: 'finalizado',
      descricao: 'Reserva finalizada (com saída).',
      animal_info: '{"porte":"","observacao":""}',
      id_animal: '101',
      cliente_id: '2',
      nome_colaborador: 'Dr. Bruno Lima',
      id_colaborador: '2',
      data_entrada: addDaysBr(-1),
      horario_entrada: '09:00',
      data_saida: addDaysBr(0),
      horario_saida: '18:00',
      turma_id: 'T1',
      nome_turma: 'Turma Filhotes',
      id_turma: 'T1',
      servico_principal_id: 'diaria',
      servico_principal_valor: '120,00',
      servicos_extras: [],
      produtos: [{ produto_id: 'petisco', qtd_produto: '1', valor_unitario_produto: '8,50', subtotal_produto: '8,50' }],
      frete: { servico_id: 'frete', servico_categoria: 'frete', tempo_execucao: '0', subtotal_servico: '30,00', endereco_cliente: '{"endereco":"Rua X"}' },
      created_at: now,
      updated_at: now,
      valor_total: '158,50',
    },
  ]

  for (const s of seed) {
    const item: ReservaCreche = { id: String(nextId++), ...s }
    db.set(item.id, item)
  }
}

export async function loadReservasCrecheOptions(): Promise<ReservasCrecheLoadOptions> {
  ensureSeeded()

  const petsOptions = await loadPetsOptions()
  const clientesById = new Map(petsOptions.clientes.map((c) => [c.id, c.label] as const))
  const pets: PetOption[] = listPets().map((p) => ({
    id: p.id,
    label: p.nome,
    cliente_id: p.cliente_id,
    cliente_nome: clientesById.get(p.cliente_id) ?? p.tutor,
    animal_info: JSON.stringify({ especie_id: p.especie_id, raca_id: p.raca_id, pelagem_id: p.pelagem_id, porte: p.porte, observacao: p.observacao }),
  }))

  const colaboradores = (await loadMedicosOptions()).funcionarios

  return {
    pets,
    colaboradores,
    turmas,
    estados,
    servicos,
    produtos,
    servicoPrincipal,
  }
}

export function listReservasCreche(search?: string): ReservaCreche[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((r) => {
    return (
      r.ordem_servico.toLowerCase().includes(normalized) ||
      r.animal_id.toLowerCase().includes(normalized) ||
      r.cliente_id.toLowerCase().includes(normalized) ||
      r.turma_id.toLowerCase().includes(normalized) ||
      r.estado.toLowerCase().includes(normalized)
    )
  })
}

export async function getReservaCrecheById(id: string): Promise<ReservaCreche | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createReservaCreche(payload: ReservaCrecheUpsertPayload): Promise<ReservaCreche> {
  ensureSeeded()
  const now = nowIso()
  const id = String(nextId++)
  const ordem = String(payload.ordem_servico ?? '').trim() || `OS-${id.padStart(4, '0')}`
  const item: ReservaCreche = { id, ...payload, ordem_servico: ordem, created_at: now, updated_at: now, valor_total: computeTotal(payload) }
  db.set(item.id, item)
  return item
}

export async function updateReservaCreche(id: string, payload: ReservaCrecheUpsertPayload): Promise<ReservaCreche | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const ordem = String(payload.ordem_servico ?? '').trim() || existing.ordem_servico
  const updated: ReservaCreche = { ...existing, ...payload, ordem_servico: ordem, id, updated_at: nowIso(), valor_total: computeTotal(payload) }
  db.set(id, updated)
  return updated
}

export async function deleteReservaCreche(id: string): Promise<boolean> {
  ensureSeeded()
  return db.delete(id)
}
