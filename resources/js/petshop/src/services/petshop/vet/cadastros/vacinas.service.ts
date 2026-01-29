import type { VacinaDraft, VacinaUpsertPayload } from '../../../../composables/createVacinaDraft'
import { listEspeciesSnapshot, loadEspeciesOptions } from '../../animais/especies.service'

export type Vacina = VacinaDraft & {
  id: string
  created_at: string
  tags: string[]
}

export type SelectOption = { id: string; label: string }

export type ProdutoOption = SelectOption & {
  inventory_current_stock: number
  inventory_minimum_stock: number
  inventory_safety_stock: number
  inventory_reserved_doses: number
}

export type VacinasLoadOptions = {
  products: ProdutoOption[]
  species: SelectOption[]
  statusOptions: Array<{ value: 'ativa' | 'inativa'; label: string }>
  groupOptions: string[]
  categoryOptions: string[]
  manufacturerOptions: string[]
  presentationOptions: string[]
  minimumAgeOptions: string[]
  boosterIntervalOptions: string[]
  routeOptions: string[]
  applicationSiteOptions: string[]
  storageConditionOptions: string[]
  documentationOptions: string[]
}

let nextId = 1
const db = new Map<string, Vacina>()

const products: ProdutoOption[] = [
  {
    id: 'V1',
    label: 'V8 (polivalente) - frasco 10 doses',
    inventory_current_stock: 18,
    inventory_minimum_stock: 10,
    inventory_safety_stock: 5,
    inventory_reserved_doses: 2,
  },
  {
    id: 'V2',
    label: 'Antirrábica - frasco 1 dose',
    inventory_current_stock: 6,
    inventory_minimum_stock: 12,
    inventory_safety_stock: 3,
    inventory_reserved_doses: 1,
  },
]

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  void loadEspeciesOptions()
  const especies = listEspeciesSnapshot()
  const cachorroId = especies.find((e) => e.nome.toLowerCase() === 'cachorro')?.id ?? especies[0]?.id ?? '1'
  const gatoId = especies.find((e) => e.nome.toLowerCase() === 'gato')?.id ?? especies[1]?.id ?? cachorroId

  const seeds: Array<Omit<Vacina, 'id'>> = [
    {
      code: 'VAC-V8',
      product_id: 'V1',
      species: [cachorroId],
      status: 'ativa',
      group: 'Polivalente',
      category: 'Cães',
      manufacturer: 'BioVet',
      registration: '',
      presentation: 'Frasco',
      concentration: '',
      minimum_age: '45 dias',
      booster_interval: '21 dias',
      route: 'Subcutânea',
      dosage: '1 dose',
      application_site: 'Região cervical',
      coverage: 'Cinomose; Hepatite infecciosa; Parvovirose; Leptospirose.',
      protocol_primary: '3 doses com intervalo de 21 dias.',
      protocol_booster: 'Reforço anual.',
      protocol_revaccination: '',
      pre_vaccination_requirements: '',
      post_vaccination_guidance: '',
      adverse_effects: '',
      contraindications: '',
      validity_closed: '',
      validity_opened: '',
      storage_condition: 'Refrigerado',
      storage_temperature: '2–8°C',
      inventory_wastage_limit: '',
      inventory_lead_time: '',
      storage_alerts: '',
      documentation: ['Bula'],
      tagsText: 'cães, filhotes',
      tags: ['cães', 'filhotes'],
      notes: '',
      created_at: nowIso(),
    },
    {
      code: 'VAC-RAIVA',
      product_id: 'V2',
      species: [cachorroId, gatoId],
      status: 'ativa',
      group: 'Zoonoses',
      category: '',
      manufacturer: '',
      registration: '',
      presentation: 'Dose única',
      concentration: '',
      minimum_age: '',
      booster_interval: '',
      route: 'Subcutânea',
      dosage: '1 dose',
      application_site: '',
      coverage: 'Raiva.',
      protocol_primary: '',
      protocol_booster: '',
      protocol_revaccination: '',
      pre_vaccination_requirements: '',
      post_vaccination_guidance: '',
      adverse_effects: '',
      contraindications: '',
      validity_closed: '',
      validity_opened: '',
      storage_condition: 'Refrigerado',
      storage_temperature: '2–8°C',
      inventory_wastage_limit: '',
      inventory_lead_time: '',
      storage_alerts: '',
      documentation: [],
      tagsText: '',
      tags: [],
      notes: '',
      created_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const vacina: Vacina = { id: String(nextId++), ...seed }
    db.set(vacina.id, vacina)
  }
}

export async function loadVacinasOptions(): Promise<VacinasLoadOptions> {
  ensureSeeded()
  const species = listEspeciesSnapshot().map((e) => ({ id: e.id, label: e.nome }))

  return {
    products,
    species,
    statusOptions: [
      { value: 'ativa', label: 'Ativa' },
      { value: 'inativa', label: 'Inativa' },
    ],
    groupOptions: ['Polivalente', 'Zoonoses', 'Respiratórias'],
    categoryOptions: ['Cães', 'Gatos'],
    manufacturerOptions: ['BioVet', 'Zoetis', 'MSD', 'Virbac'],
    presentationOptions: ['Frasco', 'Dose única', 'Seringa'],
    minimumAgeOptions: ['45 dias', '60 dias', '90 dias'],
    boosterIntervalOptions: ['21 dias', '30 dias', 'Anual'],
    routeOptions: ['Subcutânea', 'Intramuscular', 'Intradérmica'],
    applicationSiteOptions: ['Região cervical', 'Membro posterior', 'Escápula'],
    storageConditionOptions: ['Refrigerado', 'Temperatura ambiente', 'Proteger da luz'],
    documentationOptions: ['Bula', 'Certificado', 'Lote/Validade'],
  }
}

export function listVacinas(search?: string): Vacina[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all

  return all.filter((v) => {
    return (
      v.code.toLowerCase().includes(normalized) ||
      v.group.toLowerCase().includes(normalized) ||
      v.coverage.toLowerCase().includes(normalized) ||
      v.status.toLowerCase().includes(normalized)
    )
  })
}

export async function getVacinaById(id: string): Promise<Vacina | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createVacina(payload: VacinaUpsertPayload): Promise<Vacina> {
  ensureSeeded()

  const vacina: Vacina = {
    id: String(nextId++),
    ...payload,
    tags: payload.tags ?? [],
    tagsText: (payload.tags ?? []).join(', '),
    created_at: nowIso(),
  }

  db.set(vacina.id, vacina)
  return vacina
}

export async function updateVacina(id: string, payload: VacinaUpsertPayload): Promise<Vacina | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null

  const updated: Vacina = {
    ...existing,
    ...payload,
    id,
    tags: payload.tags ?? [],
    tagsText: (payload.tags ?? []).join(', '),
  }

  db.set(id, updated)
  return updated
}
