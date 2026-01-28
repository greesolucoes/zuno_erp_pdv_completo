<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { MedicoDraft, MedicoUpsertPayload } from '../../../../composables/createMedicoDraft'
import { createMedicoDraft } from '../../../../composables/createMedicoDraft'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { MedicosLoadOptions } from '../../../../services/petshop/vet/cadastros/medicos.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: MedicoDraft
  loadOptions: MedicosLoadOptions
  onSave?: (payload: MedicoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')

const step = ref<1 | 2 | 3>(1)

const { draft, reset, toPayload } = createMedicoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    reset(value)
  },
  { deep: true },
)

const funcionarios = computed(() => props.loadOptions.funcionarios)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

function goToStep(target: 1 | 2 | 3) {
  step.value = target
}

function onBack() {
  if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value < 3) {
    step.value = (step.value + 1) as 2 | 3
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Pessoas</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Credenciais</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Contato</span></a>
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
        <h2>Pessoas</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Vínculo com colaborador</span></label>
                <label class="control-label"><span>Colaborador<span class="asterisco">*</span></span></label>
                <select v-model="draft.funcionario_id" class="form-control" name="funcionario_id" :disabled="isReadOnly" required>
                  <option value="">Selecione</option>
                  <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Situação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-9">
              <div class="form-group">
                <label class="control-label">
                  <span>Status<span class="asterisco">*</span></span>
                  <a
                    data-content="Define se o médico está ativo para atendimentos no sistema."
                    data-placement="top"
                    data-toggle="popover"
                    data-trigger="focus"
                    role="button"
                    tabindex="0"
                  >
                    <i class="fa fa-question-circle helpBox"></i>
                  </a>
                </label>
                <div class="radio-options">
                  <div class="radiobutton">
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="ativo" />
                      Ativo<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                  <div class="radiobutton">
                    <label>
                      <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="inativo" />
                      Inativo<span class="cr"><i class="cr-icon"></i></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Credenciais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>CRMV<span class="asterisco">*</span></span>
                </label>
                <input v-model="draft.crmv" class="form-control" name="crmv" placeholder="Digite o CRMV" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Especialidade</span></label>
                <input
                  v-model="draft.especialidade"
                  class="form-control"
                  name="especialidade"
                  placeholder="Digite a especialidade (opcional)"
                  :readonly="isReadOnly"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Contato</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>E-mail</span></label>
                <input v-model="draft.email" class="form-control" name="email" placeholder="Digite o e-mail (opcional)" :readonly="isReadOnly" type="email" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Telefone</span></label>
                <input v-model="draft.telefone" class="form-control" name="telefone" placeholder="Digite o telefone (opcional)" :readonly="isReadOnly" type="text" />
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
                <textarea
                  v-model="draft.observacoes"
                  class="form-control"
                  name="observacoes"
                  placeholder="Digite observações (opcional)"
                  :readonly="isReadOnly"
                  rows="6"
                  style="resize: none"
                ></textarea>
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
        <span>{{ step < 3 ? 'Avançar' : props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>
