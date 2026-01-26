import type { MedicamentoDraft, MedicamentoUpsertPayload } from '../../../../composables/createMedicamentoDraft'
import { listEspecies, loadEspeciesOptions } from '../../animais/especies.service'

export type Medicamento = MedicamentoDraft & {
  id: string
  created_at: string
}

export type SelectOption = { id: string; label: string }

export type ProdutoOption = SelectOption & {
  current_stock: number
  minimum_stock: number
}

export type MedicamentosLoadOptions = {
  produtos: ProdutoOption[]
  especies: SelectOption[]
  classeTerapeuticaOptions: string[]
  classificacaoControleQuickOptions: string[]
  viaAdministracaoOptions: string[]
  apresentacaoOptions: string[]
  formaDispensacaoOptions: string[]
  restricaoIdadeOptions: string[]
  condicaoArmazenamentoOptions: string[]
}

let nextId = 1
const db = new Map<string, Medicamento>()

const produtos: ProdutoOption[] = [
  { id: 'P1', label: 'Amoxicilina 250mg (cx 20)', current_stock: 34, minimum_stock: 10 },
  { id: 'P2', label: 'Prednisolona 5mg (cx 10)', current_stock: 7, minimum_stock: 15 },
  { id: 'P3', label: 'Ivermectina 1% (frasco)', current_stock: 12, minimum_stock: 5 },
]

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  void loadEspeciesOptions()
  const especies = listEspecies()
  const cachorroId = especies.find((e) => e.nome.toLowerCase() === 'cachorro')?.id ?? especies[0]?.id ?? '1'
  const gatoId = especies.find((e) => e.nome.toLowerCase() === 'gato')?.id ?? especies[1]?.id ?? cachorroId

  const seeds: Array<Omit<Medicamento, 'id'>> = [
    {
      produto_id: 'P1',
      nome_comercial: 'Amoxivet',
      nome_generico: 'Amoxicilina',
      classe_terapeutica: 'Antibiótico',
      classe_farmacologica: 'Penicilinas',
      classificacao_controle: 'Não controlado',
      via_administracao: 'Oral',
      apresentacao: 'Comprimido',
      concentracao: '250mg',
      forma_dispensacao: 'Comprimidos',
      dosagem: '10mg/kg',
      frequencia: '12/12h',
      duracao: '7 dias',
      restricao_idade: '',
      condicao_armazenamento: 'Temperatura ambiente',
      validade: '',
      fornecedor: 'Fornecedor A',
      sku: 'AMOX-250-20',
      especies: [cachorroId, gatoId],
      indicacoes: 'Infecções bacterianas.',
      contraindicacoes: '',
      efeitos_adversos: '',
      interacoes: '',
      monitoramento: '',
      orientacoes_tutor: '',
      observacoes: '',
      status: 'ativo',
      created_at: nowIso(),
    },
    {
      produto_id: '',
      nome_comercial: 'Predvet',
      nome_generico: 'Prednisolona',
      classe_terapeutica: 'Anti-inflamatório',
      classe_farmacologica: 'Corticosteroides',
      classificacao_controle: '',
      via_administracao: 'Oral',
      apresentacao: 'Comprimido',
      concentracao: '5mg',
      forma_dispensacao: 'Comprimidos',
      dosagem: '0,5mg/kg',
      frequencia: '24/24h',
      duracao: '',
      restricao_idade: 'Filhotes - avaliar',
      condicao_armazenamento: 'Temperatura ambiente',
      validade: '',
      fornecedor: '',
      sku: '',
      especies: [cachorroId],
      indicacoes: 'Processos inflamatórios e alérgicos.',
      contraindicacoes: '',
      efeitos_adversos: '',
      interacoes: '',
      monitoramento: '',
      orientacoes_tutor: '',
      observacoes: '',
      status: 'inativo',
      created_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const medicamento: Medicamento = { id: String(nextId++), ...seed }
    db.set(medicamento.id, medicamento)
  }
}

export async function loadMedicamentosOptions(): Promise<MedicamentosLoadOptions> {
  ensureSeeded()
  const especies = listEspecies().map((e) => ({ id: e.id, label: e.nome }))

  return {
    produtos,
    especies,
    classeTerapeuticaOptions: ['Antibiótico', 'Anti-inflamatório', 'Antiparasitário', 'Analgésico'],
    classificacaoControleQuickOptions: ['Não controlado', 'Tarja vermelha', 'Tarja preta'],
    viaAdministracaoOptions: ['Oral', 'Tópica', 'Injetável', 'Ocular', 'Otológica'],
    apresentacaoOptions: ['Comprimido', 'Cápsula', 'Suspensão', 'Pomada', 'Solução', 'Spray'],
    formaDispensacaoOptions: ['Comprimidos', 'Cápsulas', 'mL', 'Gotas', 'Saches'],
    restricaoIdadeOptions: ['Sem restrição', 'Filhotes - avaliar', 'Idosos - avaliar'],
    condicaoArmazenamentoOptions: ['Temperatura ambiente', 'Refrigerado', 'Proteger da luz'],
  }
}

export function listMedicamentos(search?: string): Medicamento[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((m) => {
    return (
      m.nome_comercial.toLowerCase().includes(normalized) ||
      m.nome_generico.toLowerCase().includes(normalized) ||
      m.classe_terapeutica.toLowerCase().includes(normalized) ||
      m.via_administracao.toLowerCase().includes(normalized) ||
      m.status.toLowerCase().includes(normalized)
    )
  })
}

export async function getMedicamentoById(id: string): Promise<Medicamento | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createMedicamento(payload: MedicamentoUpsertPayload): Promise<Medicamento> {
  ensureSeeded()
  const medicamento: Medicamento = { id: String(nextId++), ...payload, created_at: nowIso() }
  db.set(medicamento.id, medicamento)
  return medicamento
}

export async function updateMedicamento(id: string, payload: MedicamentoUpsertPayload): Promise<Medicamento | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: Medicamento = { ...existing, ...payload, id }
  db.set(id, updated)
  return updated
}
