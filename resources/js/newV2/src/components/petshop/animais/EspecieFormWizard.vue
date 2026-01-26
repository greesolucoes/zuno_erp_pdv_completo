<script setup lang="ts">
import { computed, watch } from 'vue'
import type { EspecieDraft, EspecieUpsertPayload } from '../../../composables/createEspecieDraft'
import { createEspecieDraft } from '../../../composables/createEspecieDraft'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: EspecieDraft
  onSave?: (payload: EspecieUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')

const { draft, reset, toPayload } = createEspecieDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    reset(value)
  },
  { deep: true },
)

async function onSubmit() {
  if (isReadOnly.value) return
  await props.onSave?.(toPayload())
}
</script>

<template>
  <form class="formdps" method="post" @submit.prevent="onSubmit">
    <div class="pnlCollapse semi-aberto">
      <h2>Identificação</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Nome da espécie<span class="asterisco">*</span></span>
              </label>
              <input
                v-model="draft.nome"
                class="form-control"
                name="nome"
                placeholder="Digite o nome da espécie"
                :readonly="isReadOnly"
                required
                type="text"
              />
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
  margin: 0;
  padding: 16px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
