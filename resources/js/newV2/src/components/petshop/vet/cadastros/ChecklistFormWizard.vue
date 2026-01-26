<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { createChecklistDraft, type ChecklistDraft, type ChecklistUpsertPayload } from '../../../../composables/createChecklistDraft'
import type { ChecklistsLoadOptions } from '../../../../services/petshop/vet/cadastros/checklist.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ChecklistDraft
  loadOptions: ChecklistsLoadOptions
  onSave?: (payload: ChecklistUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const showDescricao = ref(false)

const { draft, reset, toPayload } = createChecklistDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

function addItem(atIndex?: number) {
  if (isReadOnly.value) return
  const index = typeof atIndex === 'number' ? atIndex : draft.itens.length
  draft.itens.splice(index, 0, { texto: '' })
}

function removeItem(index: number) {
  if (isReadOnly.value) return
  if (draft.itens.length <= 1) {
    draft.itens[0]!.texto = ''
    return
  }
  draft.itens.splice(index, 1)
}

function moveItemUp(index: number) {
  if (isReadOnly.value) return
  if (index <= 0) return
  const item = draft.itens[index]!
  draft.itens.splice(index, 1)
  draft.itens.splice(index - 1, 0, item)
}

function moveItemDown(index: number) {
  if (isReadOnly.value) return
  if (index >= draft.itens.length - 1) return
  const item = draft.itens[index]!
  draft.itens.splice(index, 1)
  draft.itens.splice(index + 1, 0, item)
}

const itensValidos = computed(() => (draft.itens ?? []).some((i) => i.texto.trim().length > 0))
const canSave = computed(() => {
  if (isReadOnly.value) return false
  return draft.titulo.trim().length > 0 && !!draft.tipo && !!draft.status && itensValidos.value
})

async function onSubmit() {
  if (isReadOnly.value) return
  if (!canSave.value) return
  await props.onSave?.(toPayload())
}
</script>

<template>
  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onSubmit">
    <div class="pnlCollapse semi-aberto">
      <h2>Identificação do checklist</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Título<span class="asterisco">*</span></span></label>
              <input v-model="draft.titulo" class="form-control" name="titulo" placeholder="Digite o título" :readonly="isReadOnly" required type="text" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Configuração</h2>
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
      <h2>Descrição</h2>
      <div style="padding: 0 20px 15px; margin-top: 10px">
        <button type="button" class="btn btn-lg btn-info" @click.prevent="showDescricao = !showDescricao">
          {{ showDescricao ? 'Ocultar detalhes' : 'Exibir detalhes' }}
        </button>
      </div>
      <div v-if="showDescricao" style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Descrição</span></label>
              <textarea v-model="draft.descricao" class="form-control" name="descricao" placeholder="(opcional)" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Itens do checklist</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12" style="display: flex; justify-content: space-between; align-items: center; gap: 10px">
            <div class="bd-callout bd-callout-info" style="margin: 0; flex: 1">
              Adicione os itens do checklist. Você pode reordenar e remover itens.
            </div>
            <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-primary" @click.prevent="addItem()">
              <img src="/img/btn-novo.svg" /><span>Adicionar item</span>
            </button>
          </div>
        </div>

        <div class="row" style="margin-top: 15px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="list-group">
              <div v-for="(item, idx) in draft.itens" :key="idx" class="list-group-item" style="padding: 15px">
                <div class="row" style="margin: 0">
                  <div class="col-md-12">
                    <label class="control-label" style="margin-bottom: 8px">
                      <span>Item {{ idx + 1 }}<span v-if="idx === 0" class="asterisco">*</span></span>
                    </label>
                  </div>
                </div>

                <div class="row" style="margin: 0">
                  <div class="col-md-10">
                    <div class="form-group form-group-lg" style="margin: 0">
                      <input v-model="item.texto" class="form-control" :readonly="isReadOnly" placeholder="Descreva o item" type="text" />
                    </div>
                  </div>
                  <div class="col-md-2" style="display: flex; gap: 8px; align-items: center; justify-content: flex-end">
                    <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Subir" @click.prevent="moveItemUp(idx)">↑</button>
                    <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Descer" @click.prevent="moveItemDown(idx)">↓</button>
                    <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-default" title="Remover" @click.prevent="removeItem(idx)">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="!canSave">
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
