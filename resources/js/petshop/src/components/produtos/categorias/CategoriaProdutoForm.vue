<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { CategoriaProdutoDraft, CategoriaProdutoUpsertPayload } from '../../../composables/createCategoriaProdutoDraft'
import type { CategoriasProdutoLoadOptions } from '../../../services/produtos/categoriasProduto.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: CategoriaProdutoDraft
  loadOptions: CategoriasProdutoLoadOptions
  onSave?: (payload: CategoriaProdutoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const saving = ref(false)

const draft = ref<CategoriaProdutoDraft>({ ...props.modelValue })

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
  () => [
    draft.value.categoria_id,
    draft.value.status,
    draft.value.cardapio,
    draft.value.delivery,
    draft.value.tipo_pizza,
    draft.value.ecommerce,
    draft.value.reserva,
  ],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

function toPayload(): CategoriaProdutoUpsertPayload {
  return {
    nome: String(draft.value.nome ?? '').trim(),
    status: draft.value.status === '0' ? '0' : '1',
    nome_en: String(draft.value.nome_en ?? '').trim(),
    nome_es: String(draft.value.nome_es ?? '').trim(),
    cardapio: draft.value.cardapio === '1' ? '1' : '0',
    delivery: draft.value.delivery === '1' ? '1' : '0',
    tipo_pizza: draft.value.tipo_pizza === '1' ? '1' : '0',
    ecommerce: draft.value.ecommerce === '1' ? '1' : '0',
    reserva: draft.value.reserva === '1' ? '1' : '0',
    categoria_id: String(draft.value.categoria_id ?? '').trim(),
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

          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Categoria pai (subcategoria)</span>
                <a
                  data-content="Use apenas se esta for uma subcategoria."
                  data-placement="top"
                  data-toggle="popover"
                  data-trigger="focus"
                  role="button"
                  tabindex="0"
                >
                  <i class="fa fa-question-circle helpBox"></i>
                </a>
              </label>
              <select v-model="draft.categoria_id" class="form-control form-select2" name="categoria_id" :disabled="isReadOnly">
                <option value=""></option>
                <option v-for="c in props.loadOptions.categorias" :key="c.id" :value="c.id">{{ c.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome (em inglês)</span></label>
              <input v-model="draft.nome_en" class="form-control" name="nome_en" :readonly="isReadOnly" type="text" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome (em espanhol)</span></label>
              <input v-model="draft.nome_es" class="form-control" name="nome_es" :readonly="isReadOnly" type="text" />
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Esta categoria está ativa?<span class="asterisco">*</span></span>
                <a
                  data-content="Se estiver como Não, ela não aparece para seleção no cadastro."
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
                    ><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.status" :disabled="isReadOnly" name="status" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto">
      <h2>Integrações</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Usar esta categoria no Cardápio?</span>
                <a
                  data-content="Marque Sim se esta categoria deve aparecer no cardápio."
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
                    ><input v-model="draft.cardapio" :disabled="isReadOnly" name="cardapio" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.cardapio" :disabled="isReadOnly" name="cardapio" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Usar esta categoria no Delivery?</span>
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
                    ><input v-model="draft.delivery" :disabled="isReadOnly" name="delivery" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.delivery" :disabled="isReadOnly" name="delivery" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="draft.delivery === '1'" class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Esta categoria é para Pizza?</span>
                <a
                  data-content="Marque Sim apenas se esta categoria será usada para pizzas (ex.: montagem/sabores)."
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
                    ><input v-model="draft.tipo_pizza" :disabled="isReadOnly" name="tipo_pizza" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.tipo_pizza" :disabled="isReadOnly" name="tipo_pizza" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Usar esta categoria no Ecommerce?</span>
                <a
                  data-content="Marque Sim se esta categoria deve aparecer no Ecommerce."
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
                    ><input v-model="draft.ecommerce" :disabled="isReadOnly" name="ecommerce" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.ecommerce" :disabled="isReadOnly" name="ecommerce" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>Usar esta categoria no módulo de Reserva?</span>
                <a
                  data-content="Marque Sim se esta categoria deve aparecer no módulo de reservas."
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
                    ><input v-model="draft.reserva" :disabled="isReadOnly" name="reserva" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input v-model="draft.reserva" :disabled="isReadOnly" name="reserva" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
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
      <button v-if="!isReadOnly" id="btnSalvarCategoria" type="submit" class="btn btn-lg btn-primary direita has-spin" :disabled="saving">
        <span>{{ saving ? 'Salvando...' : 'Salvar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>

