<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createProdutoDraft, type ProdutoDraft, type ProdutoUpsertPayload } from '../../composables/createProdutoDraft'
import type { ProdutosLoadOptions } from '../../services/produtos/produtos.service'
import { initLegacyUiBindings, loadLegacyStyleOnce } from '../../utils/legacyScripts'

type Mode = 'create' | 'edit' | 'view'

const props = defineProps<{
  mode: Mode
  modelValue: ProdutoDraft
  loadOptions: ProdutosLoadOptions
  onSave?: (payload: ProdutoUpsertPayload) => void | Promise<void>
  onCancel?: () => void
}>()

const isReadOnly = computed(() => props.mode === 'view')
const step = ref<1 | 2 | 3 | 4>(1)

const { draft, reset, toPayload } = createProdutoDraft(props.modelValue)

watch(
  () => props.modelValue,
  (value) => reset(value),
  { deep: true },
)

onMounted(() => {
  loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })
  initLegacyUiBindings()
})

watch(
  () => [
    step.value,
    draft.categoria_id,
    draft.sub_categoria_id,
    draft.marca_id,
    draft.unidade,
    draft.variavel,
    draft.variacao_modelo_id,
    draft.sub_variacao_modelo_id,
    draft.padrao_id,
    draft.origem,
    draft.cst_csosn,
    draft.cst_pis,
    draft.cst_cofins,
    draft.cst_ipi,
    draft.cEnq,
    draft.modBCST,
    draft.cardapio,
    draft.delivery,
    draft.nuvemshop,
    draft.mercadolivre,
    draft.ecommerce,
    draft.reserva,
    draft.woocommerce,
    draft.ifood,
    draft.vendizap,
  ],
  async () => {
    await nextTick()
    initLegacyUiBindings()
  },
)

watch(
  () => draft.variavel,
  (value) => {
    if (value !== '1') {
      draft.variacao_modelo_id = ''
      draft.sub_variacao_modelo_id = ''
    }
  },
)

watch(
  () => draft.gerenciar_estoque,
  (value) => {
    if (value !== '1') {
      draft.estoque_minimo = ''
      draft.alerta_validade = ''
    }
  },
)

const canAdvanceFrom1 = computed(() => String(draft.nome ?? '').trim().length > 0)

const usarPadraoTributacao = ref<'1' | '0'>(String(draft.padrao_id ?? '').trim() ? '1' : '0')

watch(
  () => draft.padrao_id,
  (value) => {
    usarPadraoTributacao.value = String(value ?? '').trim() ? '1' : '0'
  },
)

watch(usarPadraoTributacao, (value) => {
  if (value !== '1') draft.padrao_id = ''
})

function goToStep(target: 1 | 2 | 3 | 4) {
  if (target <= step.value) {
    step.value = target
    return
  }
  if (!isReadOnly.value && step.value === 1 && !canAdvanceFrom1.value) return
  step.value = target
}

function onBack() {
  if (step.value === 4) step.value = 3
  else if (step.value === 3) step.value = 2
  else if (step.value === 2) step.value = 1
}

async function onPrimary() {
  if (isReadOnly.value) return
  if (step.value === 1) {
    if (!canAdvanceFrom1.value) return
    step.value = 2
    return
  }
  if (step.value === 2) {
    step.value = 3
    return
  }
  if (step.value === 3) {
    step.value = 4
    return
  }
  await props.onSave?.(toPayload())
}

const subcategoriasFiltradas = computed(() => {
  const categoriaId = String(draft.categoria_id ?? '').trim()
  const all = props.loadOptions.subcategorias ?? []
  if (!categoriaId) return all
  return all.filter((s) => s.categoria_id === categoriaId)
})
</script>

<template>
  <div class="wizard">
    <div class="wizard-inner">
      <div class="connecting-line"></div>
      <ul class="nav nav-tabs" role="tablist">
        <li :class="step === 1 ? 'ativo' : step > 1 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(1)">
            <span class="round-tab"><img class="passos-pessoas" src="/img/passos-pessoas-ativo-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(1)"><span class="tag-text">Identificação</span></a>
        </li>
        <li :class="step === 2 ? 'ativo' : step > 2 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(2)">
            <span class="round-tab"><img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(2)"><span class="tag-text">Estoque/Variações</span></a>
        </li>
        <li :class="step === 3 ? 'ativo' : step > 3 ? 'aberto' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(3)">
            <span class="round-tab"><img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(3)"><span class="tag-text">Fiscal</span></a>
        </li>
        <li :class="step === 4 ? 'ativo' : 'fechado'">
          <a href="javascript:void(0);" @click.prevent="goToStep(4)">
            <span class="round-tab"><img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" /></span>
          </a>
          <a href="javascript:void(0);" class="tag" @click.prevent="goToStep(4)"><span class="tag-text">Integrações</span></a>
        </li>
      </ul>
    </div>
  </div>

  <form class="formdps" action="#" method="post" novalidate @submit.prevent="onPrimary">
    <template v-if="step === 1">
      <div class="pnlCollapse semi-aberto">
        <h2>Dados do produto</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome<span class="asterisco">*</span></span></label>
                <input v-model="draft.nome" class="form-control" name="nome" :readonly="isReadOnly" required type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Referência</span></label>
                <input v-model="draft.referencia" class="form-control" name="referencia" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código de barras</span></label>
                <input v-model="draft.codigo_barras" class="form-control" name="codigo_barras" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>2º código de barras</span></label>
                <input v-model="draft.codigo_barras2" class="form-control" name="codigo_barras2" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>3º código de barras</span></label>
                <input v-model="draft.codigo_barras3" class="form-control" name="codigo_barras3" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Valores</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor de compra</span></label>
                <input v-model="draft.valor_compra" class="form-control" name="valor_compra" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% lucro</span></label>
                <input v-model="draft.percentual_lucro" class="form-control" name="percentual_lucro" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor de venda</span></label>
                <input v-model="draft.valor_unitario" class="form-control" name="valor_unitario" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor mínimo de venda</span></label>
                <input v-model="draft.valor_minimo_venda" class="form-control" name="valor_minimo_venda" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor de venda a prazo</span></label>
                <input v-model="draft.valor_prazo" class="form-control" name="valor_prazo" placeholder="0,00" :readonly="isReadOnly" type="text" />
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
                <label class="control-label"><span>Categoria</span></label>
                <select v-model="draft.categoria_id" class="form-control form-select2" name="categoria_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="c in props.loadOptions.categorias" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Subcategoria</span></label>
                <select v-model="draft.sub_categoria_id" class="form-control form-select2" name="sub_categoria_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="s in subcategoriasFiltradas" :key="s.id" :value="s.id">{{ s.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Marca</span></label>
                <select v-model="draft.marca_id" class="form-control form-select2" name="marca_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="m in props.loadOptions.marcas" :key="m.id" :value="m.id">{{ m.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Unidade</span></label>
                <select v-model="draft.unidade" class="form-control form-select2" name="unidade" :disabled="isReadOnly">
                  <option v-for="u in props.loadOptions.unidades" :key="u.value" :value="u.value">{{ u.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Local de armazenamento</span></label>
                <input v-model="draft.local_armazenamento" class="form-control" name="local_armazenamento" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Status</h2>
        <div style="padding: 0 20px">
          <div class="row">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Como deseja criar o produto<span class="asterisco">*</span></span>
                  <a
                    data-content="Define se o produto ficará disponível para uso no sistema."
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
    </template>

    <template v-else-if="step === 2">
      <div class="pnlCollapse semi-aberto">
        <h2>Estoque</h2>
        <div style="padding: 0 20px">
          <div class="form-group form-group-lg">
            <label class="control-label">
              <span>Você deseja gerenciar estoque deste produto?<span class="asterisco">*</span></span>
              <a
                data-content="Se marcado como Sim, o produto passa a controlar saldo de estoque."
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
                  ><input v-model="draft.gerenciar_estoque" :disabled="isReadOnly" name="gerenciar_estoque" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.gerenciar_estoque" :disabled="isReadOnly" name="gerenciar_estoque" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>

          <div v-if="draft.gerenciar_estoque === '1'" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Estoque mínimo</span></label>
                <input v-model="draft.estoque_minimo" class="form-control" name="estoque_minimo" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Alerta validade (dias)</span></label>
                <input v-model="draft.alerta_validade" class="form-control" name="alerta_validade" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Variações</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Este produto é composto (kit/combinação)?<span class="asterisco">*</span></span>
                  <a
                    data-content="Use Sim quando este produto é um kit/combinação feito de outros itens."
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
                      ><input v-model="draft.composto" :disabled="isReadOnly" name="composto" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.composto" :disabled="isReadOnly" name="composto" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
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
                  <span>Este produto terá variações (ex.: tamanho/cor)?<span class="asterisco">*</span></span>
                  <a
                    data-content="Use Sim quando o produto tem opções (ex.: tamanho/cor) e você quer cadastrar as variações."
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
                      ><input v-model="draft.variavel" :disabled="isReadOnly" name="variavel" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.variavel" :disabled="isReadOnly" name="variavel" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="draft.variavel === '1'" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Variação principal</span></label>
                <select v-model="draft.variacao_modelo_id" class="form-control form-select2" name="variacao_modelo_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="v in props.loadOptions.variacoes" :key="v.id" :value="v.id">{{ v.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Sub variação</span></label>
                <select v-model="draft.sub_variacao_modelo_id" class="form-control form-select2" name="sub_variacao_modelo_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="v in props.loadOptions.variacoes" :key="v.id" :value="v.id">{{ v.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Atacado e balança</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Atacado (valor)</span></label>
                <input v-model="draft.valor_atacado" class="form-control" name="valor_atacado" placeholder="0,00" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Atacado (qtd)</span></label>
                <input v-model="draft.quantidade_atacado" class="form-control" name="quantidade_atacado" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Referência balança</span></label>
                <input v-model="draft.referencia_balanca" class="form-control" name="referencia_balanca" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>

          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Este produto é tipo único na balança?<span class="asterisco">*</span></span>
                  <a
                    data-content="Use Sim quando o produto tem um único tipo/configuração na balança."
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
                      ><input v-model="draft.tipo_unico" :disabled="isReadOnly" name="tipo_unico" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.tipo_unico" :disabled="isReadOnly" name="tipo_unico" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
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
                  <span>Este produto será usado na balança/PDV?<span class="asterisco">*</span></span>
                  <a
                    data-content="Use Sim se este produto será usado na balança/PDV."
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
                      ><input v-model="draft.balanca_pdv" :disabled="isReadOnly" name="balanca_pdv" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.balanca_pdv" :disabled="isReadOnly" name="balanca_pdv" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
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
                  <span>Deseja exportar este produto para a balança?<span class="asterisco">*</span></span>
                  <a
                    data-content="Use Sim para enviar este produto para a balança automaticamente."
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
                      ><input v-model="draft.exportar_balanca" :disabled="isReadOnly" name="exportar_balanca" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="draft.exportar_balanca" :disabled="isReadOnly" name="exportar_balanca" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <template v-else-if="step === 3">
      <div class="pnlCollapse semi-aberto">
        <h2>Padrão de tributação</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Deseja usar o Padrão de tributação?<span class="asterisco">*</span></span>
                  <a
                    data-content="Se escolher Sim, você seleciona um padrão e o sistema preenche as regras automaticamente."
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
                      ><input v-model="usarPadraoTributacao" :disabled="isReadOnly" name="usar_padrao_tributacao" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton">
                    <label
                      ><input v-model="usarPadraoTributacao" :disabled="isReadOnly" name="usar_padrao_tributacao" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="usarPadraoTributacao === '1'" class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Escolha o Padrão de Tributação</span></label>
                <select v-model="draft.padrao_id" class="form-control form-select2" name="padrao_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="p in props.loadOptions.padroesTributacao" :key="p.id" :value="p.id">{{ p.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Classificação fiscal</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>NCM</span></label>
                <input v-model="draft.ncm" class="form-control" name="ncm" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CEST</span></label>
                <input v-model="draft.cest" class="form-control" name="cest" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Origem</span></label>
                <select v-model="draft.origem" class="form-control form-select2" name="origem" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.origens" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Alíquotas</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% ICMS</span></label>
                <input v-model="draft.perc_icms" class="form-control" name="perc_icms" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% PIS</span></label>
                <input v-model="draft.perc_pis" class="form-control" name="perc_pis" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% COFINS</span></label>
                <input v-model="draft.perc_cofins" class="form-control" name="perc_cofins" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% IPI</span></label>
                <input v-model="draft.perc_ipi" class="form-control" name="perc_ipi" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% Red BC</span></label>
                <input v-model="draft.perc_red_bc" class="form-control" name="perc_red_bc" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Códigos fiscais</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CST/CSOSN</span></label>
                <select v-model="draft.cst_csosn" class="form-control form-select2" name="cst_csosn" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.cst_csosn" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CST PIS</span></label>
                <select v-model="draft.cst_pis" class="form-control form-select2" name="cst_pis" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.cst_pis" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CST COFINS</span></label>
                <select v-model="draft.cst_cofins" class="form-control form-select2" name="cst_cofins" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.cst_cofins" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CST IPI</span></label>
                <select v-model="draft.cst_ipi" class="form-control form-select2" name="cst_ipi" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.cst_ipi" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CEnq IPI</span></label>
                <select v-model="draft.cEnq" class="form-control form-select2" name="cEnq" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.cenq_ipi" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>CFOP e benefício</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CFOP Estadual</span></label>
                <input v-model="draft.cfop_estadual" class="form-control" name="cfop_estadual" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CFOP Inter</span></label>
                <input v-model="draft.cfop_outro_estado" class="form-control" name="cfop_outro_estado" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CFOP Ent. Est.</span></label>
                <input v-model="draft.cfop_entrada_estadual" class="form-control" name="cfop_entrada_estadual" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CFOP Ent. Inter</span></label>
                <input v-model="draft.cfop_entrada_outro_estado" class="form-control" name="cfop_entrada_outro_estado" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código benefício</span></label>
                <input v-model="draft.codigo_beneficio_fiscal" class="form-control" name="codigo_beneficio_fiscal" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>ICMS ST</h2>
        <div style="padding: 0 20px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Modalidade BC-ST</span></label>
                <select v-model="draft.modBCST" class="form-control form-select2" name="modBCST" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="o in props.loadOptions.mod_bcst" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% ICMS ST</span></label>
                <input v-model="draft.pICMSST" class="form-control" name="pICMSST" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% MVA ST</span></label>
                <input v-model="draft.pMVAST" class="form-control" name="pMVAST" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% Red BC ST</span></label>
                <input v-model="draft.redBCST" class="form-control" name="redBCST" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pnlCollapse semi-aberto">
        <h2>Cardápio</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar Cardápio?<span class="asterisco">*</span></span></label>
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
        <div v-if="draft.cardapio === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor cardápio</span></label>
                <input v-model="draft.valor_cardapio" class="form-control" name="valor_cardapio" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tempo preparo</span></label>
                <input v-model="draft.tempo_preparo" class="form-control" name="tempo_preparo" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Ponto da carne</span></label>
                <select v-model="draft.tipo_carne" class="form-control form-select2" name="tipo_carne" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Destaque</span></label>
                <select v-model="draft.destaque_cardapio" class="form-control form-select2" name="destaque_cardapio" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Oferta</span></label>
                <select v-model="draft.oferta_cardapio" class="form-control form-select2" name="oferta_cardapio" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome (EN)</span></label>
                <input v-model="draft.nome_en" class="form-control" name="nome_en" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Nome (ES)</span></label>
                <input v-model="draft.nome_es" class="form-control" name="nome_es" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição (EN)</span></label>
                <input v-model="draft.descricao_en" class="form-control" name="descricao_en" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição (ES)</span></label>
                <input v-model="draft.descricao_es" class="form-control" name="descricao_es" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Delivery</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar Delivery?<span class="asterisco">*</span></span></label>
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
        <div v-if="draft.delivery === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.valor_delivery" class="form-control" name="valor_delivery" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Destaque</span></label>
                <select v-model="draft.destaque_delivery" class="form-control form-select2" name="destaque_delivery" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Oferta</span></label>
                <select v-model="draft.oferta_delivery" class="form-control form-select2" name="oferta_delivery" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.texto_delivery" class="form-control" name="texto_delivery" :readonly="isReadOnly" rows="4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Nuvem Shop</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar Nuvem Shop?<span class="asterisco">*</span></span></label>
            <div class="radio-options">
              <div class="radiobutton">
                <label
                  ><input v-model="draft.nuvemshop" :disabled="isReadOnly" name="nuvemshop" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.nuvemshop" :disabled="isReadOnly" name="nuvemshop" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="draft.nuvemshop === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.nuvem_shop_valor" class="form-control" name="nuvem_shop_valor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Promocional</span></label>
                <input v-model="draft.nuvem_shop_valor_promocional" class="form-control" name="nuvem_shop_valor_promocional" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <input v-model="draft.categoria_nuvem_shop" class="form-control" name="categoria_nuvem_shop" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Altura</span></label>
                <input v-model="draft.altura_nuvem_shop" class="form-control" name="altura_nuvem_shop" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Largura</span></label>
                <input v-model="draft.largura_nuvem_shop" class="form-control" name="largura_nuvem_shop" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Comprimento</span></label>
                <input v-model="draft.comprimento_nuvem_shop" class="form-control" name="comprimento_nuvem_shop" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Peso</span></label>
                <input v-model="draft.peso_nuvem_shop" class="form-control" name="peso_nuvem_shop" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.texto_nuvem_shop" class="form-control" name="texto_nuvem_shop" :readonly="isReadOnly" rows="4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Mercado Livre</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar Mercado Livre?<span class="asterisco">*</span></span></label>
            <div class="radio-options">
              <div class="radiobutton">
                <label
                  ><input v-model="draft.mercadolivre" :disabled="isReadOnly" name="mercadolivre" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.mercadolivre" :disabled="isReadOnly" name="mercadolivre" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="draft.mercadolivre === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor anúncio</span></label>
                <input v-model="draft.mercado_livre_valor" class="form-control" name="mercado_livre_valor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <input v-model="draft.mercado_livre_categoria" class="form-control" name="mercado_livre_categoria" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Condição</span></label>
                <select v-model="draft.condicao_mercado_livre" class="form-control form-select2" name="condicao_mercado_livre" :disabled="isReadOnly">
                  <option v-for="o in props.loadOptions.condicaoMercadoLivre" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Quantidade</span></label>
                <input v-model="draft.quantidade_mercado_livre" class="form-control" name="quantidade_mercado_livre" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Tipo publicação</span></label>
                <input v-model="draft.mercado_livre_tipo_publicacao" class="form-control" name="mercado_livre_tipo_publicacao" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>YouTube</span></label>
                <input v-model="draft.mercado_livre_youtube" class="form-control" name="mercado_livre_youtube" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Modelo</span></label>
                <input v-model="draft.mercado_livre_modelo" class="form-control" name="mercado_livre_modelo" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.mercado_livre_descricao" class="form-control" name="mercado_livre_descricao" :readonly="isReadOnly" rows="4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>Ecommerce</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar Ecommerce?<span class="asterisco">*</span></span></label>
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
        <div v-if="draft.ecommerce === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.valor_ecommerce" class="form-control" name="valor_ecommerce" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>% desconto</span></label>
                <input v-model="draft.percentual_desconto" class="form-control" name="percentual_desconto" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição curta</span></label>
                <input v-model="draft.descricao_ecommerce" class="form-control" name="descricao_ecommerce" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Destaque</span></label>
                <select v-model="draft.destaque_ecommerce" class="form-control form-select2" name="destaque_ecommerce" :disabled="isReadOnly">
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição longa</span></label>
                <textarea v-model="draft.texto_ecommerce" class="form-control" name="texto_ecommerce" :readonly="isReadOnly" rows="4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>WooCommerce</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar WooCommerce?<span class="asterisco">*</span></span></label>
            <div class="radio-options">
              <div class="radiobutton">
                <label
                  ><input v-model="draft.woocommerce" :disabled="isReadOnly" name="woocommerce" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.woocommerce" :disabled="isReadOnly" name="woocommerce" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="draft.woocommerce === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.woocommerce_valor" class="form-control" name="woocommerce_valor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Slug</span></label>
                <input v-model="draft.woocommerce_slug" class="form-control" name="woocommerce_slug" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Status</span></label>
                <select v-model="draft.woocommerce_status" class="form-control form-select2" name="woocommerce_status" :disabled="isReadOnly">
                  <option v-for="o in props.loadOptions.woocommerceStatus" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Status estoque</span></label>
                <select v-model="draft.woocommerce_stock_status" class="form-control form-select2" name="woocommerce_stock_status" :disabled="isReadOnly">
                  <option v-for="o in props.loadOptions.woocommerceStockStatus" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.woocommerce_descricao" class="form-control" name="woocommerce_descricao" :readonly="isReadOnly" rows="4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>iFood</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar iFood?<span class="asterisco">*</span></span></label>
            <div class="radio-options">
              <div class="radiobutton">
                <label
                  ><input v-model="draft.ifood" :disabled="isReadOnly" name="ifood" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.ifood" :disabled="isReadOnly" name="ifood" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="draft.ifood === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.ifood_valor" class="form-control" name="ifood_valor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Categoria</span></label>
                <select v-model="draft.ifood_categoria_id" class="form-control form-select2" name="ifood_categoria_id" :disabled="isReadOnly">
                  <option value=""></option>
                  <option v-for="c in props.loadOptions.ifoodCategorias" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Descrição</span></label>
                <textarea v-model="draft.ifood_descricao" class="form-control" name="ifood_descricao" :readonly="isReadOnly" rows="6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pnlCollapse semi-aberto">
        <h2>VendiZap</h2>
        <div style="padding: 10px 20px">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Deseja ativar VendiZap?<span class="asterisco">*</span></span></label>
            <div class="radio-options">
              <div class="radiobutton">
                <label
                  ><input v-model="draft.vendizap" :disabled="isReadOnly" name="vendizap" type="radio" value="1" />Sim<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
              <div class="radiobutton">
                <label
                  ><input v-model="draft.vendizap" :disabled="isReadOnly" name="vendizap" type="radio" value="0" />Não<span class="cr"><i class="cr-icon"></i></span
                ></label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="draft.vendizap === '1'" style="padding: 0 20px 10px">
          <div class="row" style="margin-top: 5px; margin-bottom: 0">
            <div class="col-md-2">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Valor</span></label>
                <input v-model="draft.vendizap_valor" class="form-control" name="vendizap_valor" :readonly="isReadOnly" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="comandos">
      <button v-if="props.onCancel" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="props.onCancel()">
        Voltar
      </button>
      <button v-if="!isReadOnly && step > 1" type="button" class="btn btn-lg btn-default" style="margin-right: 10px" @click.prevent="onBack">
        Anterior
      </button>
      <button v-if="!isReadOnly" id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>{{ step === 4 ? 'Salvar' : 'Continuar' }}</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>
</template>
