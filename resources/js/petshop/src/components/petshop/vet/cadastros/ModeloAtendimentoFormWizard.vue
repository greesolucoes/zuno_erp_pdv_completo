<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createModeloAtendimentoDraft, type ModeloAtendimentoDraft, type ModeloAtendimentoUpsertPayload } from '../../../../composables/createModeloAtendimentoDraft'
import { initLegacyUiBindings, loadLegacyScriptOnce, loadLegacyStyleOnce } from '../../../../utils/legacyScripts'
import type { ModeloAtendimentoLoadOptions } from '../../../../services/petshop/vet/cadastros/modeloAtendimento.service'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ModeloAtendimentoDraft
  loadOptions: ModeloAtendimentoLoadOptions
  onSave?: (payload: ModeloAtendimentoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2>(1)

const { draft, reset, toPayload } = createModeloAtendimentoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

const showStatus = computed(() => draft.status === 'ativo' || draft.status === 'inativo')

const hasValidTab1 = computed(() => {
  const titleOk = draft.title.trim().length > 0
  const statusOk = !showStatus.value || draft.status === 'ativo' || draft.status === 'inativo'
  return titleOk && statusOk
})

function canAdvanceFrom(stepValue: 1 | 2) {
  if (isReadOnly.value) return true
  if (stepValue === 1) return hasValidTab1.value
  return true
}

function goToStep(target: 1 | 2) {
  if (target <= step.value) {
    step.value = target
    return
  }
  if (canAdvanceFrom(step.value)) step.value = target
}

function onBack() {
  if (step.value === 2) step.value = 1
}

async function onSaveDraft() {
  if (isReadOnly.value) return
  if (!hasValidTab1.value) return
  await props.onSave?.(toPayload())
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value === 1) {
    if (!canAdvanceFrom(1)) return
    step.value = 2
    return
  }
  await props.onSave?.(toPayload())
}

const editorId = `modelo-atendimento-content-${Math.random().toString(36).slice(2)}`
const editorReady = ref(false)
let editorInstance: any | null = null

function destroyEditor() {
  try {
    const w = window as any
    w?.tinymce?.get?.(editorId)?.remove?.()
  } catch {
    // ignore
  }
  editorInstance = null
  editorReady.value = false
}

async function initEditor() {
  if (editorReady.value) return
  try {
    await loadLegacyScriptOnce({
      id: 'legacy-tinymce',
      src: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js',
    })
  } catch {
    return
  }

  await nextTick()

  const w = window as any
  const tinymce = w?.tinymce
  if (!tinymce) return

  destroyEditor()

  tinymce.init({
    selector: `#${editorId}`,
    height: 520,
    menubar: false,
    statusbar: false,
    plugins: 'lists link fullscreen',
    toolbar: isReadOnly.value ? false : 'undo redo | bold italic underline | bullist numlist | link | fullscreen',
    branding: false,
    setup: (editor: any) => {
      editorInstance = editor

      editor.on('init', () => {
        editorReady.value = true
        editor.setContent(draft.content || '')
        if (isReadOnly.value && editor?.mode?.set) editor.mode.set('readonly')
      })

      editor.on('change keyup setcontent', () => {
        if (isReadOnly.value) return
        const html = editor.getContent()
        if (draft.content !== html) draft.content = html
      })
    },
  })
}

watch(
  () => step.value,
  async (value) => {
    if (value !== 2) return
    await initEditor()
  },
  { immediate: true },
)

watch(
  () => draft.content,
  (value) => {
    if (!editorInstance) return
    if (!editorReady.value) return
    try {
      const current = editorInstance.getContent()
      if (current !== value) editorInstance.setContent(value || '')
    } catch {
      // ignore
    }
  },
)

function toggleFullscreen() {
  if (!editorInstance) return
  try {
    editorInstance.execCommand('mceFullScreen')
  } catch {
    // ignore
  }
}

onBeforeUnmount(() => {
  destroyEditor()
})
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
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Conteúdo</span></a>
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

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Identificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Título<span class="asterisco">*</span></span></label>
                <input v-model="draft.title" class="form-control" name="title" placeholder="Digite o título do modelo" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Classificação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <select v-model="draft.category" class="form-control form-chosen" name="category" :readonly="isReadOnly">
                  <option value=""></option>
                  <option v-for="c in props.loadOptions.categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="showStatus" class="row" style="margin-top: 5px; margin-bottom: 0">
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
        <h2>Observações</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Notas</span></label>
                <textarea v-model="draft.notes" class="form-control" name="notes" :readonly="isReadOnly" rows="4" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Conteúdo principal</h2>
        <div style="padding: 0 20px 15px; margin-top: 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="bd-callout bd-callout-info" style="margin: 0">
                Escreva o script clínico padrão. Você pode salvar o básico no Tab 1 e preencher o conteúdo depois.
              </div>
            </div>
            <div class="col-md-4" style="text-align: right">
              <button v-if="!isReadOnly" type="button" class="btn btn-lg btn-info" @click.prevent="toggleFullscreen">Tela cheia</button>
            </div>
          </div>
        </div>

        <div style="padding: 0 20px 20px">
          <textarea
            :id="editorId"
            v-model="draft.content"
            class="form-control"
            name="content"
            :readonly="isReadOnly"
            rows="16"
            style="resize: vertical"
          ></textarea>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">Voltar</button>

      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Voltar etapa
      </button>

      <button v-if="!isReadOnly && hasValidTab1" type="button" class="btn btn-lg btn-info" style="margin-right: 10px" @click.prevent="onSaveDraft">
        Salvar rascunho
      </button>

      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="step === 1 ? !hasValidTab1 : false">
        <span>{{ step < 2 ? 'Avançar' : 'Salvar modelo' }}</span><img src="/img/btn-avancar.svg" />
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
