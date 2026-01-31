<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { PetDraft, PetUpsertPayload } from '../../../composables/createNovoPetDraft'
import { createNovoPetDraft } from '../../../composables/createNovoPetDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'
import type { PetsLoadOptions } from '../../../services/petshop/animais/pets.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: PetDraft
  loadOptions: PetsLoadOptions
  onSave?: (payload: PetUpsertPayload) => void | Promise<void>
  onCancel?: () => void
  onNewCliente?: () => void
  onNewEspecie?: () => void
  onNewRaca?: () => void
  onNewPelagem?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')

const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createNovoPetDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    reset(value)
  },
  { deep: true },
)

const clientes = computed(() => props.loadOptions.clientes)
const especies = computed(() => props.loadOptions.especies)
const pelagens = computed(() => props.loadOptions.pelagens)
const racasDisponiveis = computed(() => {
  if (!draft.especie_id) return []
  return props.loadOptions.racasByEspecie[draft.especie_id] ?? []
})
const racaDisabled = computed(() => !draft.especie_id || isReadOnly.value)

watch(
  () => draft.especie_id,
  () => {
    draft.raca_id = ''
  },
)

watch(
  () => draft.tem_pedigree,
  (value) => {
    if (value !== 'S') draft.pedigree = ''
  },
)

watch(
  () => draft.origem_tipo,
  (value) => {
    if (!value || value === 'NAO_INFORMADO') draft.origem_detalhe = ''
  },
)

watch(
  () => draft.porte,
  (value) => {
    if (value !== 'OUTRO') draft.porte_outro = ''
  },
)

const showOrigemDetalhe = computed(() => !!draft.origem_tipo && draft.origem_tipo !== 'NAO_INFORMADO')

const origemValue = computed(() => {
  const tipo = draft.origem_tipo
  if (!tipo) return ''
  if (tipo === 'NAO_INFORMADO') return 'Não informado'
  const label = tipo === 'NASCIMENTO' ? 'Nascimento' : tipo === 'ADOCAO' ? 'Adoção' : 'Resgate'
  const detalhe = draft.origem_detalhe.trim()
  return detalhe ? `${label}: ${detalhe}` : label
})

watch(
  () => origemValue.value,
  (value) => {
    draft.origem = value
  },
  { immediate: true },
)

function parseDateLoose(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (Number.isNaN(date.getTime())) return null
    return date
  }

  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed)
  if (brMatch) {
    const [, d, m, y] = brMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (Number.isNaN(date.getTime())) return null
    return date
  }

  const fallback = new Date(trimmed)
  if (Number.isNaN(fallback.getTime())) return null
  return fallback
}

const idadeCalculada = computed(() => {
  const dob = parseDateLoose(draft.data_nascimento_pet)
  if (!dob) return ''

  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  let months = now.getMonth() - dob.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years < 0) return 'Digite uma data válida'
  if (years === 0 && months === 0) return '0.0'

  return `${Math.max(0, years)}.${Math.max(0, months)}`
})

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

function refreshSelect2ByName(name: string) {
  const w = window as any
  const $: any = w?.$
  if (!$?.fn?.select2) return

  try {
    $(`select[name="${name}"].select2-hidden-accessible`).each(function (this: any) {
      $(this).select2('destroy')
    })
  } catch {
    // ignore
  }
}

watch(
  () => [step.value, draft.especie_id, racasDisponiveis.value.length],
  async () => {
    await nextTick()
    refreshSelect2ByName('raca_id')
    initLegacyUiBindings()
  },
)

function openLegacyModal(selector: string) {
  if (isReadOnly.value) return
  const w = window as any
  const $: any = w?.$
  if (!$) return
  try {
    $(selector).modal('show')
  } catch {
    // ignore
  }
}

function goToStep(target: 1 | 2 | 3) {
  if (target === step.value) return
  if (target < step.value) step.value = target
}

async function onPrimary() {
  if (isReadOnly.value) return

  if (step.value === 1) {
    step.value = 2
    return
  }

  if (step.value === 2) {
    step.value = 3
    return
  }

  await props.onSave?.(toPayload())
}

function onBack() {
  if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Básico</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Características</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Documentos</span></a>
        </li>
        <li class="fechado">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag"><span class="tag-text">Finalizar</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Identificação do Pet</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome do pet<span class="asterisco">*</span></span></label>
                <input v-model="draft.nome" class="form-control" name="nome" placeholder="Digite o nome do pet" :readonly="isReadOnly" required type="text" />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Sexo<span class="asterisco">*</span></span></label>
                <select v-model="draft.sexo" class="form-control form-select2" name="sexo" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                  <option value="I">Indefinido</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Tutor</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cliente/Tutor<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <select v-model="draft.cliente_id" class="form-control form-select2" name="cliente_id" :disabled="isReadOnly" required>
                    <option value="">Selecione</option>
                    <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.label }}</option>
                  </select>
                  <span class="input-group-btn">
                    <button
                      class="btn btn-lg btn-default"
                      data-toggle="tooltip"
                      title="Novo cliente"
                      type="button"
                      :disabled="isReadOnly"
                      @click.prevent="onNewCliente ? onNewCliente() : openLegacyModal('#modalNovoCliente')"
                    >
                      <i class="fa fa-plus"></i>
                    </button>
                  </span>
                </div>
                <span class="field-validation-valid text-danger" data-valmsg-for="cliente_id" data-valmsg-replace="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Classificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Espécie<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <select v-model="draft.especie_id" class="form-control form-select2" name="especie_id" :disabled="isReadOnly" required>
                    <option value="">Selecione a espécie</option>
                    <option v-for="e in especies" :key="e.id" :value="e.id">{{ e.label }}</option>
                  </select>
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default" data-toggle="tooltip" title="Nova espécie" type="button" :disabled="isReadOnly" @click.prevent="onNewEspecie ? onNewEspecie() : openLegacyModal('#modalEspecie')">
                      <i class="fa fa-plus"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Raça<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <select v-model="draft.raca_id" class="form-control form-select2" name="raca_id" :disabled="racaDisabled" required>
                    <option value="">Selecione a raça</option>
                    <option v-for="r in racasDisponiveis" :key="r.id" :value="r.id">{{ r.label }}</option>
                  </select>
                  <span class="input-group-btn">
                    <button
                      class="btn btn-lg btn-default"
                      data-toggle="tooltip"
                      title="Nova raça"
                      type="button"
                      :disabled="racaDisabled"
                      @click.prevent="onNewRaca ? onNewRaca() : openLegacyModal('#modalRaca')"
                    >
                      <i class="fa fa-plus"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Corpo</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Porte<span class="asterisco">*</span></span></label>
                <div class="radio-options">
                  <div class="radiobutton">
                    <label><input v-model="draft.porte" name="porte" type="radio" value="P" :disabled="isReadOnly" required />P<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                  <div class="radiobutton">
                    <label><input v-model="draft.porte" name="porte" type="radio" value="M" :disabled="isReadOnly" required />M<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                  <div class="radiobutton">
                    <label><input v-model="draft.porte" name="porte" type="radio" value="G" :disabled="isReadOnly" required />G<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                  <div class="radiobutton">
                    <label><input v-model="draft.porte" name="porte" type="radio" value="OUTRO" :disabled="isReadOnly" required />Outro<span class="cr"><i class="cr-icon"></i></span></label>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-4" v-if="draft.porte === 'OUTRO'">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Qual porte?</span></label>
                <input v-model="draft.porte_outro" class="form-control text-uppercase" name="porte_outro" placeholder="Digite o porte" :readonly="isReadOnly" type="text" />
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Peso</span></label>
                <input v-model="draft.peso" class="form-control" name="peso" placeholder="Digite o peso" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Aparência</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Pelagem</span></label>
                <div class="input-group input-group-lg">
                  <select v-model="draft.pelagem_id" class="form-control form-select2" name="pelagem_id" :disabled="isReadOnly">
                    <option value="">Selecione a pelagem</option>
                    <option v-for="p in pelagens" :key="p.id" :value="p.id">{{ p.label }}</option>
                  </select>
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default" data-toggle="tooltip" title="Nova pelagem" type="button" :disabled="isReadOnly" @click.prevent="onNewPelagem ? onNewPelagem() : openLegacyModal('#modalPelagem')">
                      <i class="fa fa-plus"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cor</span></label>
                <input v-model="draft.cor" class="form-control text-uppercase" name="cor" placeholder="Digite a cor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Origem</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <input type="hidden" name="origem" :value="origemValue" />
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Origem</span></label>
                <select v-model="draft.origem_tipo" class="form-control form-select2" :disabled="isReadOnly">
                  <option value="">Selecione</option>
                  <option value="NASCIMENTO">Nascimento</option>
                  <option value="ADOCAO">Adoção</option>
                  <option value="RESGATE">Resgate</option>
                  <option value="NAO_INFORMADO">Não informado</option>
                </select>
              </div>
            </div>

            <div class="col-md-8" v-if="showOrigemDetalhe">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Detalhe</span></label>
                <input v-model="draft.origem_detalhe" class="form-control" placeholder="Digite o detalhe da origem" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Idade</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Data de nascimento</span></label>
                <div class="input-group input-group-lg">
                  <input
                    v-model="draft.data_nascimento_pet"
                    class="form-control data"
                    id="inp-data_nascimento_pet"
                    name="data_nascimento_pet"
                    placeholder="dd/mm/aaaa"
                    :readonly="isReadOnly"
                    type="text"
                  />
                  <span class="input-group-btn">
                    <button
                      class="btn btn-lg btn-default btnCalendario"
                      data-original-title="Abrir calendário"
                      data-toggle="tooltip"
                      id="btn_inp-data_nascimento_pet"
                      type="button"
                      :disabled="isReadOnly"
                    >
                      <div class="btn-calendario"></div>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Idade calculada</span></label>
                <input :value="idadeCalculada" class="form-control" name="idade_calculada" readonly type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Identificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Chip</span></label>
                <input v-model="draft.chip" class="form-control" name="chip" placeholder="Digite o chip" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Pedigree</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Possui pedigree?<span class="asterisco">*</span></span></label>
                <select v-model="draft.tem_pedigree" class="form-control form-select2" name="tem_pedigree" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
              </div>
            </div>

            <div class="col-md-8" v-if="draft.tem_pedigree === 'S'">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Número do pedigree</span></label>
                <input v-model="draft.pedigree" class="form-control" name="pedigree" placeholder="Digite o número do pedigree" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Observações</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Observações</span></label>
                <textarea v-model="draft.observacao" class="form-control" name="observacao" placeholder="Digite as observações" :readonly="isReadOnly" rows="6" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>
      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">Voltar etapa</button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>{{ step < 3 ? 'Avançar' : props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span
        ><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>

  <div id="modalNovoCliente" class="modal fade" tabindex="-1" role="dialog"></div>
  <div id="modalEspecie" class="modal fade" tabindex="-1" role="dialog"></div>
  <div id="modalRaca" class="modal fade" tabindex="-1" role="dialog"></div>
  <div id="modalPelagem" class="modal fade" tabindex="-1" role="dialog"></div>
</template>

<style scoped>
.wizard li.ativo span.round-tab img,
.wizard li.aberto span.round-tab img {
  filter: brightness(0) invert(1);
}
</style>
