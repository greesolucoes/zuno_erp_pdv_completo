import type { ModeloPrescricaoDraft, ModeloPrescricaoUpsertPayload } from '../../../../composables/createModeloPrescricaoDraft'

export type ModeloPrescricao = ModeloPrescricaoDraft & {
  id: string
  created_at: string
  updated_at: string
}

export type SelectOption<T extends string> = { value: T; label: string }

export type ModeloPrescricaoLoadOptions = {
  categories: string[]
  status: SelectOption<'ativo' | 'inativo'>[]
  fieldTypes: SelectOption<string>[]
  templates: SelectOption<'prescricao_basica' | 'antibiotico' | 'pos_operatorio'>[]
}

const statusOptions: ModeloPrescricaoLoadOptions['status'] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
]

const categories = ['Geral', 'Consulta', 'Internação', 'Cirurgia']

const fieldTypes: ModeloPrescricaoLoadOptions['fieldTypes'] = [
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

const templates: ModeloPrescricaoLoadOptions['templates'] = [
  { value: 'prescricao_basica', label: 'Prescrição básica' },
  { value: 'antibiotico', label: 'Antibiótico (posologia completa)' },
  { value: 'pos_operatorio', label: 'Pós-operatório (orientações)' },
]

let nextId = 1
const db = new Map<string, ModeloPrescricao>()

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (db.size) return

  const seeds: Array<Omit<ModeloPrescricao, 'id'>> = [
    {
      title: 'Prescrição básica',
      category: 'Consulta',
      notes: 'Modelo inicial para prescrições rápidas.',
      status: 'ativo',
      fields: [
        { label: 'Medicamento', type: 'texto_curto', placeholder: 'Nome do medicamento', textarea_placeholder: '', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Dose', type: 'texto_curto', placeholder: 'Ex.: 10mg/kg', textarea_placeholder: '', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Frequência', type: 'texto_curto', placeholder: 'Ex.: 12/12h', textarea_placeholder: '', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Duração', type: 'texto_curto', placeholder: 'Ex.: 7 dias', textarea_placeholder: '', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
        { label: 'Observações', type: 'texto_longo', placeholder: '', textarea_placeholder: 'Detalhes importantes...', number_min: '', number_max: '', integer_min: '', integer_max: '', date_hint: '', time_hint: '', datetime_hint: '', select_options: '', multi_select_options: '', checkbox_label_checked: '', checkbox_label_unchecked: '', checkbox_default: 'N', checkbox_group_options: '', radio_group_options: '', radio_group_default: '', email_placeholder: '', phone_placeholder: '', file_types: '', file_max_size: '', rich_text_default: '' },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]

  for (const seed of seeds) {
    const model: ModeloPrescricao = { id: String(nextId++), ...seed }
    db.set(model.id, model)
  }
}

export async function loadModeloPrescricaoOptions(): Promise<ModeloPrescricaoLoadOptions> {
  ensureSeeded()
  return { categories, status: statusOptions, fieldTypes, templates }
}

export function listModelosPrescricao(search?: string): ModeloPrescricao[] {
  ensureSeeded()
  const all = Array.from(db.values())
  const normalized = (search ?? '').trim().toLowerCase()
  if (!normalized) return all
  return all.filter((m) => m.title.toLowerCase().includes(normalized) || m.category.toLowerCase().includes(normalized) || m.status.toLowerCase().includes(normalized))
}

export async function getModeloPrescricaoById(id: string): Promise<ModeloPrescricao | null> {
  ensureSeeded()
  return db.get(id) ?? null
}

export async function createModeloPrescricao(payload: ModeloPrescricaoUpsertPayload): Promise<ModeloPrescricao> {
  ensureSeeded()
  const now = nowIso()
  const model: ModeloPrescricao = { id: String(nextId++), ...payload, created_at: now, updated_at: now }
  db.set(model.id, model)
  return model
}

export async function updateModeloPrescricao(id: string, payload: ModeloPrescricaoUpsertPayload): Promise<ModeloPrescricao | null> {
  ensureSeeded()
  const existing = db.get(id)
  if (!existing) return null
  const updated: ModeloPrescricao = { ...existing, ...payload, id, updated_at: nowIso() }
  db.set(id, updated)
  return updated
}

