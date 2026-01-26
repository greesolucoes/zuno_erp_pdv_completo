import type { ReservaHotelDraft, ReservaHotelUpsertPayload } from '../../../composables/createReservaHotelDraft'
import { listPets, loadPetsOptions } from '../animais/pets.service'
import { loadMedicosOptions } from '../vet/cadastros/medicos.service'

export type ReservaHotel = ReservaHotelDraft & {
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

export type QuartoOption = SelectOption & {
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

export type ReservasHotelLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  quartos: QuartoOption[]
  estados: Array<{ value: ReservaHotelDraft['estado']; label: string }>
  servicos: ServicoOption[]
  produtos: ProdutoOption[]
  servicoPrincipal: SelectOption[]
}

const estados: ReservasHotelLoadOptions['estados'] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'hospedado', label: 'Hospedado' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const quartos: QuartoOption[] = [
  { id: 'Q1', label: 'Quarto 01', unidade: 'Matriz' },
  { id: 'Q2', label: 'Quarto 02', unidade: 'Matriz' },
  { id: 'Q3', label: 'Quarto Premium', unidade: 'Unidade 2' },
]

const servicoPrincipal: ReservasHotelLoadOptions['servicoPrincipal'] = [
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
const db = new Map<string, ReservaHotel>()

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

function computeTotal(payload: ReservaHotelDraft) {
  const principal = parseMoneyBr(payload.servico_principal_valor)
  const extras = (payload.servicos_extras ?? []).reduce((sum, s) => sum + parseMoneyBr(s.servico_valor), 0)
  const produtosTotal = (payload.produtos ?? []).reduce((sum, p) => sum + parseMoneyBr(p.subtotal_produto), 0)
  const frete = parseMoneyBr(payload.frete?.subtotal_servico ?? '')
  return formatMoneyBr(principal + extras + produtosTotal + frete)
}

function ensureSeeded() {
  if (db.size) return

  const now = nowIso()
  const seed: Array<Omit<ReservaHotel, 'id'>> = [
    {
      ordem_servico: 'OS-0001',
      animal_id: '100',
      colaborador_id: '1',
      estado: 'agendado',
      descricao: 'Reserva de teste.',
      animal_info: '{"porte":"","observacao":""}',
      id_animal: '100',
      cliente_id: '1',
      nome_colaborador: 'Dra. Ana Souza',
      id_colaborador: '1',
      checkin: addDaysBr(0),
      timecheckin: '09:00',
      checkout: '',
      timecheckout: '',
      quarto_id: 'Q1',
      nome_quarto: 'Quarto 01',
      id_quarto: 'Q1',
      servico_principal_id: 'diaria',
      servico_principal_valor: '200,00',
      servicos_extras: [
        { servico_id: 'banho', servico_categoria: 'servico', tempo_execucao: '60', servico_data: addDaysBr(0), servico_hora: '10:00', servico_valor: '80,00' },
      ],
      produtos: [{ produto_id: 'petisco', qtd_produto: '2', valor_unitario_produto: '8,50', subtotal_produto: '17,00' }],
      frete: { servico_id: '', servico_categoria: 'frete', tempo_execucao: '', subtotal_servico: '', endereco_cliente: '' },
      created_at: now,
      updated_at: now,
      valor_total: '297,00',
    },
  ]

  for (const s of seed) {
    const item: ReservaHotel = { id: String(nextId++), ...s }
    db.set(item.id, item)
  }
}

export async function loadReservasHotelOptions(): Promise<ReservasHotelLoadOptions> {
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
    quartos,
    estados,
    servicos,
    produtos,
    servicoPrincipal,
  }
}

export function listReservasHotel(search?: string): ReservaHotel[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((r) => {
    return (
      r.ordem_servico.toLowerCase().includes(normalized) ||
      r.animal_id.toLowerCase().includes(normalized) ||
      r.cliente_id.toLowerCase().includes(normalized) ||
      r.quarto_id.toLowerCase().includes(normalized) ||
      r.estado.toLowerCase().includes(normalized)
    )
  })
}

export async function getReservaHotelById(id: string): Promise<ReservaHotel | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createReservaHotel(payload: ReservaHotelUpsertPayload): Promise<ReservaHotel> {
  ensureSeeded()
  const now = nowIso()
  const id = String(nextId++)
  const ordem = String(payload.ordem_servico ?? '').trim() || `OS-${id.padStart(4, '0')}`
  const item: ReservaHotel = { id, ...payload, ordem_servico: ordem, created_at: now, updated_at: now, valor_total: computeTotal(payload) }
  db.set(item.id, item)
  return item
}

export async function updateReservaHotel(id: string, payload: ReservaHotelUpsertPayload): Promise<ReservaHotel | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const ordem = String(payload.ordem_servico ?? '').trim() || existing.ordem_servico
  const updated: ReservaHotel = { ...existing, ...payload, ordem_servico: ordem, id, updated_at: nowIso(), valor_total: computeTotal(payload) }
  db.set(id, updated)
  return updated
}

export async function deleteReservaHotel(id: string): Promise<boolean> {
  ensureSeeded()
  return db.delete(id)
}
