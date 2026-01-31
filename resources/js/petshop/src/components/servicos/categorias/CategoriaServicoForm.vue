<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { CategoriaServicoDraft, CategoriaServicoUpsertPayload } from '../../../composables/createCategoriaServicoDraft'
import type { CategoriasServicoLoadOptions } from '../../../services/servicos/categoriasServico.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: CategoriaServicoDraft
  loadOptions: CategoriasServicoLoadOptions
  onSave?: (payload: CategoriaServicoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const saving = ref(false)

const draft = ref<CategoriaServicoDraft>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    draft.value = { ...value }
  },
  { deep: true },
)

onMounted(async () => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  await nextTick()
  initLegacyUiBindings()
})

watch(
  () => [draft.value.marketplace],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

function toPayload(): CategoriaServicoUpsertPayload {
  return {
    nome: String(draft.value.nome ?? '').trim(),
    marketplace: draft.value.marketplace === '1' ? '1' : '0',
  }
}

async function onSubmit() {
  if (isReadOnly.value) return
  saving.value = true
  try {
    await props.onSave?.(toPayload())
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onSubmit">
    <div class="pnlCollapse semi-aberto">
      <h2>Dados da categoria</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome<span class="asterisco">*</span></span></label>
              <input v-model="draft.nome" class="form-control" name="nome" :readonly="isReadOnly" required type="text" />
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Deseja usar esta categoria no Marketplace (Delivery)?</span>
                <a
                  data-content="Marque Sim se esta categoria deve aparecer no Delivery/Marketplace."
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
                  <label
                    ><input v-model="draft.marketplace" :disabled="isReadOnly" name="marketplace" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.marketplace" :disabled="isReadOnly" name="marketplace" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="!isReadOnly" id="btnSalvarCategoriaServico" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

