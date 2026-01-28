import { reactive } from 'vue'

export type ModeloPrescricaoStatus = 'ativo' | 'inativo'

export type ModeloPrescricaoFieldType =
  | 'texto_curto'
  | 'texto_longo'
  | 'numero_decimal'
  | 'inteiro'
  | 'data'
  | 'hora'
  | 'data_hora'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'checkbox_group'
  | 'radio_group'
  | 'email'
  | 'phone'
  | 'file'
  | 'rich_text'

export type ModeloPrescricaoFieldDraft = {
  label: string
  type: ModeloPrescricaoFieldType | ''
  placeholder: string
  textarea_placeholder: string
  number_min: string
  number_max: string
  integer_min: string
  integer_max: string
  date_hint: string
  time_hint: string
  datetime_hint: string
  select_options: string
  multi_select_options: string
  checkbox_label_checked: string
  checkbox_label_unchecked: string
  checkbox_default: 'S' | 'N'
  checkbox_group_options: string
  radio_group_options: string
  radio_group_default: string
  email_placeholder: string
  phone_placeholder: string
  file_types: string
  file_max_size: string
  rich_text_default: string
}

export type ModeloPrescricaoDraft = {
  title: string
  category: string
  notes: string
  status: ModeloPrescricaoStatus
  fields: ModeloPrescricaoFieldDraft[]
}

export type ModeloPrescricaoUpsertPayload = ModeloPrescricaoDraft

const emptyField: ModeloPrescricaoFieldDraft = {
  label: '',
  type: '',
  placeholder: '',
  textarea_placeholder: '',
  number_min: '',
  number_max: '',
  integer_min: '',
  integer_max: '',
  date_hint: '',
  time_hint: '',
  datetime_hint: '',
  select_options: '',
  multi_select_options: '',
  checkbox_label_checked: '',
  checkbox_label_unchecked: '',
  checkbox_default: 'N',
  checkbox_group_options: '',
  radio_group_options: '',
  radio_group_default: '',
  email_placeholder: '',
  phone_placeholder: '',
  file_types: '',
  file_max_size: '',
  rich_text_default: '',
}

const emptyDraft: ModeloPrescricaoDraft = {
  title: '',
  category: '',
  notes: '',
  status: 'ativo',
  fields: [{ ...emptyField }],
}

function normalizeFields(fields: ModeloPrescricaoFieldDraft[]) {
  return (fields ?? [])
    .map((f): ModeloPrescricaoFieldDraft => ({
      ...emptyField,
      ...(f ?? {}),
      label: String(f?.label ?? ''),
      type: (f?.type ?? '') as any,
      checkbox_default: (f?.checkbox_default === 'S' ? 'S' : 'N') as 'S' | 'N',
    }))
    .filter((f) => f.label.trim().length > 0 || String(f.type).trim().length > 0)
}

export function createModeloPrescricaoDraft(initial?: Partial<ModeloPrescricaoDraft>) {
  const draft = reactive<ModeloPrescricaoDraft>({
    ...emptyDraft,
    ...(initial ?? {}),
    fields: Array.isArray(initial?.fields) ? normalizeFields(initial!.fields as any) : [{ ...emptyField }],
  })

  function reset(next?: Partial<ModeloPrescricaoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
    const normalized = Array.isArray(next?.fields) ? normalizeFields(next!.fields as any) : [{ ...emptyField }]
    draft.fields = normalized.length ? normalized : [{ ...emptyField }]
  }

  function toPayload(): ModeloPrescricaoUpsertPayload {
    const normalizedFields = normalizeFields(draft.fields)
      .map((f) => ({
        ...f,
        label: f.label.trim(),
        placeholder: f.placeholder.trim(),
        textarea_placeholder: f.textarea_placeholder.trim(),
        number_min: f.number_min.trim(),
        number_max: f.number_max.trim(),
        integer_min: f.integer_min.trim(),
        integer_max: f.integer_max.trim(),
        date_hint: f.date_hint.trim(),
        time_hint: f.time_hint.trim(),
        datetime_hint: f.datetime_hint.trim(),
        select_options: f.select_options.trim(),
        multi_select_options: f.multi_select_options.trim(),
        checkbox_label_checked: f.checkbox_label_checked.trim(),
        checkbox_label_unchecked: f.checkbox_label_unchecked.trim(),
        checkbox_group_options: f.checkbox_group_options.trim(),
        radio_group_options: f.radio_group_options.trim(),
        radio_group_default: f.radio_group_default.trim(),
        email_placeholder: f.email_placeholder.trim(),
        phone_placeholder: f.phone_placeholder.trim(),
        file_types: f.file_types.trim(),
        file_max_size: f.file_max_size.trim(),
        rich_text_default: f.rich_text_default.trim(),
      }))
      .filter((f) => f.label.length > 0 && String(f.type).length > 0)

    return {
      title: draft.title.trim(),
      category: draft.category.trim(),
      notes: draft.notes.trim(),
      status: draft.status === 'inativo' ? 'inativo' : 'ativo',
      fields: normalizedFields.length ? normalizedFields : [{ ...emptyField }],
    }
  }

  return { draft, reset, toPayload, emptyField }
}

