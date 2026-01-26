import type { ModeloAvaliacaoDraft, ModeloAvaliacaoUpsertPayload } from '../../../../composables/createModeloAvaliacaoDraft'

export type ModeloAvaliacao = ModeloAvaliacaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloAvaliacaoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
  fieldTypes: SelectOption<string>[]
  templates: SelectOption<'basico' | 'consulta' | 'internacao'>[]
}

const statusOptions: ModeloAvaliacaoLoadOptions['status'] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

const categories = ['Geral', 'Consulta', 'Internação', 'Cirurgia']

const fieldTypes: ModeloAvaliacaoLoadOptions['fieldTypes'] = [
  { value: 'texto_curto', label: 'Texto curto' },
  { value: 'texto_longo', label: 'Texto longo' },
  { value: 'numero_decimal', label: 'Número decimal' },
  { value: 'inteiro', label: 'Inteiro' },
  { value: 'data', label: 'Data' },
  { value: 'hora', label: 'Hora' },
  { value: 'data_hora', label: 'Data e hora' },
  { value: 'select', label: 'Select' },
  { value: 'multi_select', label: 'Multi-select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'checkbox_group', label: 'Grupo de checkbox' },
  { value: 'radio_group', label: 'Grupo de rádio' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'file', label: 'Arquivo' },
  { value: 'rich_text', label: 'Rich text' },
]

const templates: ModeloAvaliacaoLoadOptions['templates'] = [
  { value: 'basico', label: 'Básico (sinais + observações)' },
  { value: 'consulta', label: 'Consulta (anamnese)' },
  { value: 'internacao', label: 'Internação (evolução)' },
]

let nextId = 1
const db = new Map<string, ModeloAvaliacao>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<ModeloAvaliacao, 'id'>> = [
    {
      title: 'Modelo básico',
      category: 'Geral',
      notes: 'Rascunho inicial para avaliações rápidas.',
      status: 'ativo',
      fields: [
        { label: 'Peso (kg)', type: 'numero_decimal', placeholder: 'Ex.: 12.5', textarea_placeholder: '', number_min: '0', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Temperatura (°C)', type: 'numero_decimal', placeholder: 'Ex.: 38.5', textarea_placeholder: '', number_min: '0', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Observações', type: 'texto_longo', placeholder: '', textarea_placeholder: 'Digite as observações...', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const model: ModeloAvaliacao = { id: String(nextId++), ...seed }
    db.set(model.id, model)
  }
}

export async function loadModeloAvaliacaoOptions(): Promise<ModeloAvaliacaoLoadOptions> {
  ensureSeeded()
  return { categories, status: statusOptions, fieldTypes, templates }
}

export function listModelosAvaliacao(search?: string): ModeloAvaliacao[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((m) => m.title.toLowerCase().includes(normalized) || m.category.toLowerCase().includes(normalized) || m.status.toLowerCase().includes(normalized))
}

export async function getModeloAvaliacaoById(id: string): Promise<ModeloAvaliacao | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createModeloAvaliacao(payload: ModeloAvaliacaoUpsertPayload): Promise<ModeloAvaliacao> {
  ensureSeeded()
  const now = nowIso()
  const model: ModeloAvaliacao = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(model.id, model)
  return model
}

export async function updateModeloAvaliacao(id: string, payload: ModeloAvaliacaoUpsertPayload): Promise<ModeloAvaliacao | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: ModeloAvaliacao = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

