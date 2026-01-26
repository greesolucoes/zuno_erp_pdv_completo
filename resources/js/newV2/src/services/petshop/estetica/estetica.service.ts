import type { EsteticaDraft, EsteticaUpsertPayload } from '../../../composables/createEsteticaDraft'
import { listPets, loadPetsOptions } from '../animais/pets.service'
import { loadMedicosOptions } from '../vet/cadastros/medicos.service'

export type Estetica = EsteticaDraft & {
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

export type ServicoOption = SelectOption & {
  tempo_execucao: string
  valor: string
}

export type ProdutoOption = SelectOption & {
  valor_unitario: string
}

export type EsteticaLoadOptions = {
  pets: PetOption[]
  colaboradores: SelectOption[]
  estados: Array<{ value: EsteticaDraft['estado']; label: string }>
  servicos: ServicoOption[]
  produtos: ProdutoOption[]
}

const estados: EsteticaLoadOptions['estados'] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

const servicos: ServicoOption[] = [
  { id: 'banho', label: 'Banho', tempo_execucao: '60', valor: '80,00' },
  { id: 'tosa', label: 'Tosa', tempo_execucao: '90', valor: '120,00' },
  { id: 'hidratação', label: 'Hidratação', tempo_execucao: '45', valor: '60,00' },
]

const produtos: ProdutoOption[] = [
  { id: 'shampoo', label: 'Shampoo', valor_unitario: '25,00' },
  { id: 'perfume', label: 'Perfume', valor_unitario: '18,50' },
]

let nextId = 1
const db = new Map<string, Estetica>()

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

function computeTotal(payload: EsteticaDraft) {
  const servicosTotal = (payload.servicos ?? []).reduce((sum, s) => sum + parseMoneyBr(s.subtotal_servico), 0)
  const produtosTotal = (payload.produtos ?? []).reduce((sum, p) => sum + parseMoneyBr(p.subtotal_produto), 0)
  const frete = parseMoneyBr(payload.frete?.subtotal_servico ?? '')
  return formatMoneyBr(servicosTotal + produtosTotal + frete)
}

function ensureSeeded() {
  if (db.size) return

  const now = nowIso()
  const seed: Array<Omit<Estetica, 'id'>> = [
    {
      ordem_servico: 'OS-1001',
      animal_id: '100',
      colaborador_id: '1',
      estado: 'agendado',
      descricao: 'Atendimento de teste (banho).',
      animal_info: '{"porte":"","observacao":""}',
      id_animal: '100',
      cliente_id: '1',
      nome_colaborador: 'Dra. Ana Souza',
      id_colaborador: '1',
      servicos: [{ servico_id: 'banho', subtotal_servico: '80,00', tempo_execucao: '60' }],
      produtos: [{ produto_id: 'perfume', qtd_produto: '1', valor_unitario_produto: '18,50', subtotal_produto: '18,50' }],
      frete: { subtotal_servico: '', tempo_execucao: '', endereco_cliente: '' },
      data_agendamento: addDaysBr(0),
      horario_agendamento: '10:00',
      horario_saida: '11:30',
      created_at: now,
      updated_at: now,
      valor_total: '98,50',
    },
    {
      ordem_servico: 'OS-1002',
      animal_id: '101',
      colaborador_id: '2',
      estado: 'em_andamento',
      descricao: 'Tosa programada.',
      animal_info: '{"porte":"","observacao":""}',
      id_animal: '101',
      cliente_id: '2',
      nome_colaborador: 'Dr. Bruno Lima',
      id_colaborador: '2',
      servicos: [{ servico_id: 'tosa', subtotal_servico: '120,00', tempo_execucao: '90' }],
      produtos: [],
      frete: { subtotal_servico: '', tempo_execucao: '', endereco_cliente: '' },
      data_agendamento: addDaysBr(0),
      horario_agendamento: '14:00',
      horario_saida: '15:30',
      created_at: now,
      updated_at: now,
      valor_total: '120,00',
    },
  ]

  for (const s of seed) {
    const item: Estetica = { id: String(nextId++), ...s }
    db.set(item.id, item)
  }
}

export async function loadEsteticaOptions(): Promise<EsteticaLoadOptions> {
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
    estados,
    servicos,
    produtos,
  }
}

export function listEstetica(search?: string): Estetica[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((r) => {
    return (
      r.ordem_servico.toLowerCase().includes(normalized) ||
      r.animal_id.toLowerCase().includes(normalized) ||
      r.cliente_id.toLowerCase().includes(normalized) ||
      r.colaborador_id.toLowerCase().includes(normalized) ||
      r.estado.toLowerCase().includes(normalized)
    )
  })
}

export async function getEsteticaById(id: string): Promise<Estetica | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createEstetica(payload: EsteticaUpsertPayload): Promise<Estetica> {
  ensureSeeded()
  const now = nowIso()
  const id = String(nextId++)
  const ordem = String(payload.ordem_servico ?? '').trim() || `OS-${id.padStart(4, '0')}`
  const item: Estetica = { id, ...payload, ordem_servico: ordem, created_at: now, updated_at: now, valor_total: computeTotal(payload) }
  db.set(item.id, item)
  return item
}

export async function updateEstetica(id: string, payload: EsteticaUpsertPayload): Promise<Estetica | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const ordem = String(payload.ordem_servico ?? '').trim() || existing.ordem_servico
  const updated: Estetica = { ...existing, ...payload, ordem_servico: ordem, id, updated_at: nowIso(), valor_total: computeTotal(payload) }
  db.set(id, updated)
  return updated
}

export async function deleteEstetica(id: string): Promise<boolean> {
  ensureSeeded()
  return db.delete(id)
}
