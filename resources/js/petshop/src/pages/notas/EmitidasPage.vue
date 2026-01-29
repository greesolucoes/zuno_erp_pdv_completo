<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../components/ui/DataTable.vue'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const dataInicio = ref((route.query.datainicio as string) ?? '24/12/2025')
const dataFim = ref((route.query.datafim as string) ?? '23/01/2026')

const sortCol = computed(() => (route.query.col as string | undefined) ?? '')
const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
const perPage = 10

type NotaEmitidaRow = {
  chave: string
  dataGeracao: string
  tomadorCnpj: string
  tomadorNome: string
  competencia: string
  municipio: string
  valor: string
  situacaoTitle: string
  visualizarId: string
  rascunhoId: number
}

const allRows = computed<NotaEmitidaRow[]>(() => {
  // mock: 23 registros para testar paginação (10 por página)
  const total = 23
  return Array.from({ length: total }, (_, index) => {
    const n = index + 1
    const dia = String(((n - 1) % 28) + 1).padStart(2, '0')
    const valor = (8750 + n * 10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return {
      chave: `MOCK_CHAVE_${n}`,
      dataGeracao: `${dia}/01/2026`,
      tomadorCnpj: `052802690001${String(90 + (n % 10)).padStart(2, '0')}`,
      tomadorNome: `TECNOMYL BRASIL DISTRIBUIDORA DE PRODUTOS AGRICOLAS LTDA (${n})`,
      competencia: '01/2026',
      municipio: 'Curitiba/PR',
      valor,
      situacaoTitle: 'NFS-e emitida',
      visualizarId: `410690222643883480001800000000000001260197167${String(97200 + n).padStart(5, '0')}`,
      rascunhoId: 159954420 + n,
    }
  })
})

const totalRows = computed(() => allRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / perPage)))
const pageRows = computed(() => {
  const start = (page.value - 1) * perPage
  return allRows.value.slice(start, start + perPage)
})

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'notas-emitidas', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'notas-emitidas',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      datainicio: dataInicio.value || undefined,
      datafim: dataFim.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'notas-emitidas', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Notas emitidas</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Ao entrar na tela de Notas emitidas é exibido as notas fiscais emitidas nos últimos 30 dias. Para
        exibir as notas referentes a um outro período informe os campos data inicial e data final. Em
        seguida clique no botão filtrar. O período informado não deve ser superior a 30 dias.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaNFSe" to="/dps/pessoas" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova NFS-e</span>
          </RouterLink>
        </li>
        <li>
          <a
            id="btnRecarregar"
            href="javascript:void(0);"
            class="btn btn-lg btn-info"
            data-toggle="tooltip"
            title="Recarregar"
            @click.prevent="onRecarregar"
          >
            <img src="/img/btn-recarregar.svg" style="height: 21px" /><span>Recarregar lista</span>
          </a>
        </li>
      </ul>

      <form class="navbar-form" method="get" @submit.prevent="onSubmit">
        <div class="form-group" style="display: inline">
          <div class="input-group input-group-lg" style="display: table">
            <input
              v-model="busca"
              class="form-control"
              name="busca"
              placeholder="Pesquisar pessoa física ou jurídica"
              type="text"
            />
            <span class="input-group-btn" style="width: 1%">
              <button id="btnPesquisar" class="btn btn-default" type="submit">
                <img src="/img/btn-pesquisar-esq.svg" />
              </button>
            </span>
          </div>
        </div>
        <br />
        <div style="display: flex; align-items: center; justify-content: flex-start">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Data Inicial</span></label>
            <div class="input-group input-group-lg">
              <input v-model="dataInicio" class="form-control data" id="datainicio" name="datainicio" type="text" />
              <span class="input-group-btn">
                <button
                  class="btn btn-lg btn-default btnCalendario"
                  data-original-title="Abrir calendário"
                  data-toggle="tooltip"
                  id="btn_datainicio"
                  type="button"
                >
                  <div class="btn-calendario"></div>
                </button>
              </span>
            </div>
            <span class="field-validation-valid text-danger" data-valmsg-for="datainicio" data-valmsg-replace="true"></span>
          </div>

          <div class="form-group" style="display: flex; align-items: center; justify-content: flex-start; gap: 10px">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Data Final</span></label>
              <div class="input-group input-group-lg">
                <input v-model="dataFim" class="form-control data" id="datafim" name="datafim" type="text" />
                <span class="input-group-btn">
                  <button
                    class="btn btn-lg btn-default btnCalendario"
                    data-original-title="Abrir calendário"
                    data-toggle="tooltip"
                    id="btn_datafim"
                    type="button"
                  >
                    <div class="btn-calendario"></div>
                  </button>
                </span>
              </div>
              <span class="field-validation-valid text-danger" data-valmsg-for="datafim" data-valmsg-replace="true"></span>
            </div>

            <div class="form-group form-group-lg">
              <button type="submit" class="btn btn-lg btn-primary">
                <img src="/img/btn-filtrar.svg" /> Filtrar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>

  <DataTable
    :rows="pageRows"
    :row-key="(r) => (r as any).chave"
    :page="page"
    :total-pages="totalPages"
    :total-items="totalRows"
    @page-change="goToPage"
  >
    <template #head>
      <tr>
        <th class="td-data">
          <RouterLink :to="{ name: 'notas-emitidas', query: { ...route.query, col: 'data_desc' } }">
            Geração<span class="fa fa-angle-down sortIcon" v-if="sortCol === 'data_desc'"></span>
          </RouterLink>
        </th>
        <th>Emitida para</th>
        <th class="td-competencia" style="width: 200px; text-align: center">Competência</th>
        <th class="td-center" style="width: 200px">Município Emissor</th>
        <th class="td-valor" style="width: 160px">
          <RouterLink :to="{ name: 'notas-emitidas', query: { ...route.query, col: 'valor_asc' } }">
            Preço Serviço (R$)<span></span>
          </RouterLink>
        </th>
        <th class="td-situacao">
          <RouterLink :to="{ name: 'notas-emitidas', query: { ...route.query, col: 'situacao_asc' } }">
            Situação<span></span>
          </RouterLink>
        </th>
        <th></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr
        :data-chave="(row as any).chave"
        data-situacao="P100_GERADA"
        :data-valor="(row as any).valor"
      >
        <td class="td-data">
          {{ (row as any).dataGeracao }}
        </td>
        <td class="td-texto-grande">
          <div>
            <img data-toggle="tooltip" title="Tomador" src="/img/tb-tomador.svg" />
            <span class="cnpj">{{ (row as any).tomadorCnpj }}</span> - {{ (row as any).tomadorNome }}
          </div>
        </td>
        <td class="td-competencia" style="text-align: center">
          {{ (row as any).competencia }}
        </td>
        <td class="td-center">
          {{ (row as any).municipio }}
        </td>
        <td class="td-valor">
          {{ (row as any).valor }}
        </td>
        <td class="td-situacao">
          <img
            data-toggle="tooltip"
            src="/img/tb-gerada.svg"
            title=""
            :data-original-title="(row as any).situacaoTitle"
          />
        </td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/notas/visualizar/${(row as any).visualizarId}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <a href="javascript:void(0);" data-bypass="false" class="list-group-item btnSubstituir">
                <img src="/img/op-substituir.svg" />Substituir
              </a>
              <a href="javascript:void(0);" class="list-group-item btnCancelar">
                <img src="/img/op-cancelar.svg" />Cancelar NFS-e
              </a>
              <a href="javascript:void(0);" class="list-group-item">
                <img src="/img/op-xml.svg" />Download XML
              </a>
              <a href="javascript:void(0);" class="list-group-item" download>
                <img src="/img/op-pdf.svg" />Download DANFS-e
              </a>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
  <span class="sem-registros">Nenhum registro encontrado</span>

  <div id="modalCancelamento" class="modal fade" tabindex="-1" role="dialog"></div>
</template>
