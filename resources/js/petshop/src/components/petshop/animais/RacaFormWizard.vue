<script setup lang="ts">
import { computed, watch } from 'vue'
import { createRacaDraft, type RacaDraft, type RacaUpsertPayload } from '../../../composables/createRacaDraft'
import type { RacasLoadOptions } from '../../../services/petshop/animais/racas.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: RacaDraft
  loadOptions: RacasLoadOptions
  onSave?: (payload: RacaUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')

const { draft, reset, toPayload } = createRacaDraft(props.modelValue)

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
          <div class="col-md-8">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Nome da raça<span class="asterisco">*</span></span>
              </label>
              <input
                v-model="draft.nome"
                class="form-control"
                name="nome"
                placeholder="Digite o nome da raça"
                :readonly="isReadOnly"
                required
                type="text"
              />
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Espécie<span class="asterisco">*</span></span>
              </label>
              <select v-model="draft.especie_id" class="form-control" name="especie_id" :disabled="isReadOnly" required>
                <option value="" disabled>Selecione</option>
                <option v-for="e in props.loadOptions.especies" :key="e.id" :value="e.id">{{ e.label }}</option>
              </select>
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

