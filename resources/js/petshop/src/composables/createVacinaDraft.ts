import { reactive } from 'vue'

export type VacinaStatus = 'ativa' | 'inativa'

export type VacinaDraft = {
  code: string
  product_id: string
  species: string[]
  status: VacinaStatus
  group: string
  category: string
  manufacturer: string
  registration: string
  presentation: string
  concentration: string
  minimum_age: string
  booster_interval: string
  route: string
  dosage: string
  application_site: string
  coverage: string
  protocol_primary: string
  protocol_booster: string
  protocol_revaccination: string
  pre_vaccination_requirements: string
  post_vaccination_guidance: string
  adverse_effects: string
  contraindications: string
  validity_closed: string
  validity_opened: string
  storage_condition: string
  storage_temperature: string
  inventory_wastage_limit: string
  inventory_lead_time: string
  storage_alerts: string
  documentation: string[]
  tagsText: string
  notes: string
}

export type VacinaUpsertPayload = Omit<VacinaDraft, 'tagsText'> & { tags: string[] }

const emptyDraft: VacinaDraft = {
  code: '',
  product_id: '',
  species: [],
  status: 'ativa',
  group: '',
  category: '',
  manufacturer: '',
  registration: '',
  presentation: '',
  concentration: '',
  minimum_age: '',
  booster_interval: '',
  route: '',
  dosage: '',
  application_site: '',
  coverage: '',
  protocol_primary: '',
  protocol_booster: '',
  protocol_revaccination: '',
  pre_vaccination_requirements: '',
  post_vaccination_guidance: '',
  adverse_effects: '',
  contraindications: '',
  validity_closed: '',
  validity_opened: '',
  storage_condition: '',
  storage_temperature: '',
  inventory_wastage_limit: '',
  inventory_lead_time: '',
  storage_alerts: '',
  documentation: [],
  tagsText: '',
  notes: '',
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function createVacinaDraft(initial?: Partial<VacinaDraft>) {
  const draft = reactive<VacinaDraft>({
    ...emptyDraft,
    ...(initial ?? {}),
    species: Array.isArray(initial?.species) ? [...initial.species] : [],
    documentation: Array.isArray(initial?.documentation) ? [...initial.documentation] : [],
  })

  function reset(next?: Partial<VacinaDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
    draft.species = Array.isArray(next?.species) ? [...next!.species] : []
    draft.documentation = Array.isArray(next?.documentation) ? [...next!.documentation] : []
  }

  function toPayload(): VacinaUpsertPayload {
    return {
      ...draft,
      code: draft.code.trim(),
      product_id: draft.product_id.trim(),
      group: draft.group.trim(),
      category: draft.category.trim(),
      manufacturer: draft.manufacturer.trim(),
      registration: draft.registration.trim(),
      presentation: draft.presentation.trim(),
      concentration: draft.concentration.trim(),
      minimum_age: draft.minimum_age.trim(),
      booster_interval: draft.booster_interval.trim(),
      route: draft.route.trim(),
      dosage: draft.dosage.trim(),
      application_site: draft.application_site.trim(),
      coverage: draft.coverage.trim(),
      protocol_primary: draft.protocol_primary.trim(),
      protocol_booster: draft.protocol_booster.trim(),
      protocol_revaccination: draft.protocol_revaccination.trim(),
      pre_vaccination_requirements: draft.pre_vaccination_requirements.trim(),
      post_vaccination_guidance: draft.post_vaccination_guidance.trim(),
      adverse_effects: draft.adverse_effects.trim(),
      contraindications: draft.contraindications.trim(),
      validity_closed: draft.validity_closed.trim(),
      validity_opened: draft.validity_opened.trim(),
      storage_condition: draft.storage_condition.trim(),
      storage_temperature: draft.storage_temperature.trim(),
      inventory_wastage_limit: draft.inventory_wastage_limit.trim(),
      inventory_lead_time: draft.inventory_lead_time.trim(),
      storage_alerts: draft.storage_alerts.trim(),
      documentation: [...(draft.documentation ?? [])],
      notes: draft.notes.trim(),
      status: draft.status === 'inativa' ? 'inativa' : 'ativa',
      species: [...(draft.species ?? [])],
      tags: parseTags(draft.tagsText),
    }
  }

  return { draft, reset, toPayload }
}

