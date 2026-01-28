<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createVacinaDraft, type VacinaDraft, type VacinaUpsertPayload } from '../../../../composables/createVacinaDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { VacinasLoadOptions } from '../../../../services/petshop/vet/cadastros/vacinas.service'

type Mode = 'create' | 'edit' | 'view'

const CUSTOM = '__CUSTOM__'

const props = defineProps<{
  mode: Mode
  modelValue: VacinaDraft
  loadOptions: VacinasLoadOptions
  onSave?: (payload: VacinaUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3 | 4>(1)

const { draft, reset, toPayload } = createVacinaDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

function inferSelectChoice(value: string, options: string[]) {
  const normalized = value.trim()
  if (!normalized) return { choice: '', custom: '' }
  if (options.includes(normalized)) return { choice: normalized, custom: '' }
  return { choice: CUSTOM, custom: normalized }
}

function useCustomSelect(field: keyof VacinaDraft, options: string[]) {
  const ui = reactive<{ choice: string; custom: string }>({ choice: '', custom: '' })

  function syncFromDraft() {
    const inferred = inferSelectChoice(String(draft[field] ?? ''), options)
    ui.choice = inferred.choice
    ui.custom = inferred.custom
  }

  syncFromDraft()

  watch(
    () => ui.choice,
    (value) => {
      if (value === CUSTOM) (draft as any)[field] = ui.custom
      else (draft as any)[field] = value
    },
    { immediate: true },
  )

  watch(
    () => ui.custom,
    (value) => {
      if (ui.choice !== CUSTOM) return
      ;(draft as any)[field] = value
    },
  )

  watch(
    () => String(draft[field] ?? ''),
    () => syncFromDraft(),
  )

  return ui
}

const manufacturer = useCustomSelect('manufacturer', props.loadOptions.manufacturerOptions)
const presentation = useCustomSelect('presentation', props.loadOptions.presentationOptions)
const minimumAge = useCustomSelect('minimum_age', props.loadOptions.minimumAgeOptions)
const boosterInterval = useCustomSelect('booster_interval', props.loadOptions.boosterIntervalOptions)
const route = useCustomSelect('route', props.loadOptions.routeOptions)
const applicationSite = useCustomSelect('application_site', props.loadOptions.applicationSiteOptions)
const storageCondition = useCustomSelect('storage_condition', props.loadOptions.storageConditionOptions)

const selectedProduct = computed(() => props.loadOptions.products.find((p) => p.id === draft.product_id) ?? null)

const showManufacturerDetails = ref(false)
const showInventoryDetails = ref(false)

const documentationCustom = ref('')

function addDocumentationCustom() {
  const value = documentationCustom.value.trim()
  if (!value) return
  if (!draft.documentation.includes(value)) draft.documentation.push(value)
  documentationCustom.value = ''
}

function removeDocumentationItem(value: string) {
  const idx = draft.documentation.indexOf(value)
  if (idx >= 0) draft.documentation.splice(idx, 1)
}

function requiredFilled(value: string) {
  return value.trim().length > 0
}

function canAdvanceFrom(stepValue: 1 | 2 | 3 | 4) {
  if (isReadOnly.value) return true
  if (stepValue === 1) {
    return (
      requiredFilled(draft.code) &&
      requiredFilled(draft.product_id) &&
      (draft.species?.length ?? 0) > 0 &&
      requiredFilled(draft.group) &&
      requiredFilled(draft.coverage)
    )
  }
  return true
}

function goToStep(target: 1 | 2 | 3 | 4) {
  if (target <= step.value) {
    step.value = target
    return
  }
  let current = step.value
  while (current < target) {
    if (!canAdvanceFrom(current)) break
    current = (current + 1) as any
  }
  step.value = current
}

function onBack() {
  if (step.value === 4) step.value = 3
  else if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value < 4) {
    if (!canAdvanceFrom(step.value)) return
    step.value = (step.value + 1) as any
    return
  }
  await props.onSave?.(toPayload())
}
</script>

<template>
  <div class="wizard">
    <div class="wizard-inner">
      <div class="connecting-line"></div>
      <ul class="nav nav-tabs" role="tablist">
        <li :class="step === 1 ? 'ativo' : step > 1 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(1)">
            <span class="round-tab">
              <img class="passos-pessoas" src="/img/passos-pessoas-ativo-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Informações gerais</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Protocolos</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : step > 3 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Estoque</span></a>
        </li>
        <li :class="step === 4 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(4)">
            <span class="round-tab">
              <img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(4)"><span class="tag-text">Documentação</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Identificação e vínculo</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código<span class="asterisco">*</span></span></label>
                <input v-model="draft.code" class="form-control" name="code" placeholder="Ex.: VAC-V8" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Produto<span class="asterisco">*</span></span></label>
                <select v-model="draft.product_id" class="form-control" name="product_id" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="p in props.loadOptions.products" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Aplicação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Espécies<span class="asterisco">*</span></span></label>
                <select v-model="draft.species" class="form-control" name="species" :disabled="isReadOnly" multiple required style="min-height: 140px">
                  <option v-for="s in props.loadOptions.species" :key="s.id" :value="s.id">{{ s.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group">
                <label class="control-label"><span>Status<span class="asterisco">*</span></span></label>
                <div class="radio-options">
                  <div v-for="s in props.loadOptions.statusOptions" :key="s.value" class="radiobutton">
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" :value="s.value" />
                      {{ s.label }}<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Grupo<span class="asterisco">*</span></span></label>
                <select v-model="draft.group" class="form-control" name="group" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="g in props.loadOptions.groupOptions" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <select v-model="draft.category" class="form-control" name="category" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="c in props.loadOptions.categoryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
            
                <button type="button" class="btn btn-lg btn-info" style="margin-left: 10px" @click.prevent="showManufacturerDetails = !showManufacturerDetails">
                  {{ showManufacturerDetails ? 'Ocultar detalhes' : 'Exibir detalhes da Fabricante e registro' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="showManufacturerDetails" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Fabricante</span></label>
                <select v-model="manufacturer.choice" class="form-control" name="manufacturer_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.manufacturerOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="manufacturer.choice === CUSTOM"
                  v-model="manufacturer.custom"
                  class="form-control"
                  name="manufacturer_custom"
                  placeholder="Digite o fabricante"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Registro</span></label>
                <input v-model="draft.registration" class="form-control" name="registration" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Apresentação</span></label>
                <select v-model="presentation.choice" class="form-control" name="presentation_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.presentationOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="presentation.choice === CUSTOM"
                  v-model="presentation.custom"
                  class="form-control"
                  name="presentation_custom"
                  placeholder="Digite a apresentação"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Concentração</span></label>
                <input v-model="draft.concentration" class="form-control" name="concentration" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Via</span></label>
                <select v-model="route.choice" class="form-control" name="route_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.routeOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="route.choice === CUSTOM"
                  v-model="route.custom"
                  class="form-control"
                  name="route_custom"
                  placeholder="Digite a via"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Local de aplicação</span></label>
                <select v-model="applicationSite.choice" class="form-control" name="application_site_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.applicationSiteOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="applicationSite.choice === CUSTOM"
                  v-model="applicationSite.custom"
                  class="form-control"
                  name="application_site_custom"
                  placeholder="Digite o local"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Dosagem</span></label>
                <input v-model="draft.dosage" class="form-control" name="dosage" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Idade mínima</span></label>
                <select v-model="minimumAge.choice" class="form-control" name="minimum_age_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.minimumAgeOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="minimumAge.choice === CUSTOM"
                  v-model="minimumAge.custom"
                  class="form-control"
                  name="minimum_age_custom"
                  placeholder="Digite a idade mínima"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Intervalo de reforço</span></label>
                <select v-model="boosterInterval.choice" class="form-control" name="booster_interval_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.boosterIntervalOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="boosterInterval.choice === CUSTOM"
                  v-model="boosterInterval.custom"
                  class="form-control"
                  name="booster_interval_custom"
                  placeholder="Digite o intervalo"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cobertura<span class="asterisco">*</span></span></label>
                <textarea
                  v-model="draft.coverage"
                  class="form-control"
                  name="coverage"
                  placeholder="Descreva as coberturas"
                  :readonly="isReadOnly"
                  required
                  rows="6"
                  style="resize: none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Protocolos clínicos</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Protocolo primário</span></label>
                <textarea v-model="draft.protocol_primary" class="form-control" name="protocol_primary" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Protocolo de reforço</span></label>
                <textarea v-model="draft.protocol_booster" class="form-control" name="protocol_booster" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Revacinação</span></label>
                <textarea v-model="draft.protocol_revaccination" class="form-control" name="protocol_revaccination" :readonly="isReadOnly" rows="3" style="resize: none"></textarea>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Requisitos pré-vacinação</span></label>
                <textarea
                  v-model="draft.pre_vaccination_requirements"
                  class="form-control"
                  name="pre_vaccination_requirements"
                  :readonly="isReadOnly"
                  rows="4"
                  style="resize: none"
                ></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Contraindicações</span></label>
                <textarea v-model="draft.contraindications" class="form-control" name="contraindications" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Orientações pós-vacinação</span></label>
                <textarea
                  v-model="draft.post_vaccination_guidance"
                  class="form-control"
                  name="post_vaccination_guidance"
                  :readonly="isReadOnly"
                  rows="4"
                  style="resize: none"
                ></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Efeitos adversos</span></label>
                <textarea v-model="draft.adverse_effects" class="form-control" name="adverse_effects" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 3">
      <div class="pnlCollapse semi-aberto">
        <h2>Armazenamento e estoque</h2>
        <div class="retratil">
          <div v-if="!draft.product_id" class="bd-callout bd-callout-info">Selecione o produto para exibir estoque.</div>

          <div v-else style="padding: 0 20px">
            <div class="row" style="margin-top: 5px; margin-bottom: 0">
              <div class="col-md-3">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Estoque atual</span></label>
                  <input class="form-control" :value="String(selectedProduct?.inventory_current_stock ?? '')" readonly type="text" />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Estoque mínimo</span></label>
                  <input class="form-control" :value="String(selectedProduct?.inventory_minimum_stock ?? '')" readonly type="text" />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Estoque de segurança</span></label>
                  <input class="form-control" :value="String(selectedProduct?.inventory_safety_stock ?? '')" readonly type="text" />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group form-group-lg">
                  <label class="control-label"><span>Doses reservadas</span></label>
                  <input class="form-control" :value="String(selectedProduct?.inventory_reserved_doses ?? '')" readonly type="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Validades e conservação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Validade (fechada)</span></label>
                <input v-model="draft.validity_closed" class="form-control" name="validity_closed" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Validade (aberta)</span></label>
                <input v-model="draft.validity_opened" class="form-control" name="validity_opened" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Condição de armazenamento</span></label>
                <select v-model="storageCondition.choice" class="form-control" name="storage_condition_choice" :disabled="isReadOnly">
                  <option value="">Selecione (opcional)</option>
                  <option v-for="o in props.loadOptions.storageConditionOptions" :key="o" :value="o">{{ o }}</option>
                  <option :value="CUSTOM">Personalizado</option>
                </select>
                <input
                  v-if="storageCondition.choice === CUSTOM"
                  v-model="storageCondition.custom"
                  class="form-control"
                  name="storage_condition_custom"
                  placeholder="Digite a condição"
                  :readonly="isReadOnly"
                  style="margin-top: 8px"
                  type="text"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Temperatura de armazenamento</span></label>
                <input v-model="draft.storage_temperature" class="form-control" name="storage_temperature" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Alertas de armazenamento</span></label>
                <textarea v-model="draft.storage_alerts" class="form-control" name="storage_alerts" :readonly="isReadOnly" rows="3" style="resize: none"></textarea>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Reposição</span></label>
                <button type="button" class="btn btn-lg btn-info" style="margin-left: 10px" @click.prevent="showInventoryDetails = !showInventoryDetails">
                  {{ showInventoryDetails ? 'Ocultar detalhes' : 'Exibir detalhes' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="showInventoryDetails" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Limite de perdas</span></label>
                <input v-model="draft.inventory_wastage_limit" class="form-control" name="inventory_wastage_limit" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Lead time</span></label>
                <input v-model="draft.inventory_lead_time" class="form-control" name="inventory_lead_time" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Documentos</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Documentação</span></label>
                <select v-model="draft.documentation" class="form-control" name="documentation" :disabled="isReadOnly" multiple style="min-height: 140px">
                  <option v-for="d in props.loadOptions.documentationOptions" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Adicionar personalizado</span></label>
                <div class="input-group input-group-lg">
                  <input v-model="documentationCustom" class="form-control" :readonly="isReadOnly" placeholder="Digite e clique em adicionar" type="text" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default" type="button" :disabled="isReadOnly" @click.prevent="addDocumentationCustom">Adicionar</button>
                  </span>
                </div>
                <div v-if="draft.documentation.length" style="margin-top: 10px">
                  <div v-for="item in draft.documentation" :key="item" class="label label-default" style="display: inline-block; margin: 0 6px 6px 0; padding: 8px 10px">
                    {{ item }}
                    <a v-if="!isReadOnly" href="javascript:void(0);" style="margin-left: 8px" @click.prevent="removeDocumentationItem(item)">×</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Organização interna</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tags</span></label>
                <input v-model="draft.tagsText" class="form-control" name="tags" placeholder="Separe por vírgula (opcional)" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Notas</span></label>
                <textarea v-model="draft.notes" class="form-control" name="notes" :readonly="isReadOnly" rows="5" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>
      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>{{ step < 4 ? 'Avançar' : props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>
