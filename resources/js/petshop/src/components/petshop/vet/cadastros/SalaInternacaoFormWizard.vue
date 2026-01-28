<script setup lang="ts">
import { computed, watch } from 'vue'
import { createSalaInternacaoDraft, type SalaInternacaoDraft, type SalaInternacaoUpsertPayload } from '../../../../composables/createSalaInternacaoDraft'
import type { SalasInternacaoLoadOptions } from '../../../../services/petshop/vet/cadastros/salasInternacao.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: SalaInternacaoDraft
  loadOptions: SalasInternacaoLoadOptions
  onSave?: (payload: SalaInternacaoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')

const { draft, reset, toPayload } = createSalaInternacaoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

async function onSubmit() {
  if (isReadOnly.value) return
  await props.onSave?.(toPayload())
}
</script>

<template>
  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onSubmit">
    <div class="pnlCollapse semi-aberto">
      <h2>Identificação da sala</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome<span class="asterisco">*</span></span></label>
              <input v-model="draft.nome" class="form-control" name="nome" placeholder="Digite o nome da sala" :readonly="isReadOnly" required type="text" />
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Identificador</span></label>
              <input
                v-model="draft.identificador"
                class="form-control"
                name="identificador"
                placeholder="Ex.: I-01 (opcional)"
                :readonly="isReadOnly"
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Configuração de internação</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group">
              <label class="control-label"><span>Tipo<span class="asterisco">*</span></span></label>
              <div class="radio-options">
                <div v-for="t in props.loadOptions.tipos" :key="t.value" class="radiobutton">
                  <label>
                    <input v-model="draft.tipo" :disabled="isReadOnly" name="tipo" type="radio" :value="t.value" />
                    {{ t.label }}<span class="cr"><i class="cr-icon"></i></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group">
              <label class="control-label"><span>Status<span class="asterisco">*</span></span></label>
              <div class="radio-options">
                <div v-for="s in props.loadOptions.status" :key="s.value" class="radiobutton">
                  <label>
                    <input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" :value="s.value" />
                    {{ s.label }}<span class="cr"><i class="cr-icon"></i></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Capacidade e recursos</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Quantidade de leitos</span></label>
              <input v-model="draft.capacidade" class="form-control" name="capacidade" placeholder="(opcional)" :readonly="isReadOnly" type="text" />
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Equipamentos</span></label>
              <textarea
                v-model="draft.equipamentos"
                class="form-control"
                name="equipamentos"
                placeholder="Liste os equipamentos (opcional)"
                :readonly="isReadOnly"
                rows="4"
                style="resize: none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Observações e protocolos internos</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Observações</span></label>
              <textarea
                v-model="draft.observacoes"
                class="form-control"
                name="observacoes"
                placeholder="(opcional)"
                :readonly="isReadOnly"
                rows="6"
                style="resize: none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>{{ props.mode === 'edit' ? 'Salvar alterações' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.comandos {
  margin: 25px 0;
  text-align: right;
}
</style>

