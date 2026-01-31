<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../utils/legacyScripts'
import { listProdutos, loadProdutosOptions, type PaginatedResponse, type Produto, type ProdutosLoadOptions } from '../../services/produtos/produtos.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const loading = ref(false)
const options = ref<ProdutosLoadOptions | null>(null)
const resp = ref<PaginatedResponse<Produto> | null>(null)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type Row = {
  id: string
  nome: string
  categoria: string
  codigoBarras: string
  unidade: string
  valorCompra: string
  valorVenda: string
  estoque: string
  status: string
  cadastradoEm: string
}

function formatDateTimeBr(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

const rows = computed<Row[]>(() => {
  const data = resp.value?.data ?? []
  return data.map((p) => ({
    id: p.id,
    nome: p.nome,
    categoria: p.categoria_nome || '-',
    codigoBarras: p.codigo_barras || '-',
    unidade: p.unidade || '-',
    valorCompra: p.valor_compra ? `R$ ${p.valor_compra}` : '-',
    valorVenda: p.valor_unitario ? `R$ ${p.valor_unitario}` : '-',
    estoque: p.gerenciar_estoque === '1' ? 'Sim' : 'Não',
    status: p.status === '1' ? 'Ativo' : 'Inativo',
    cadastradoEm: formatDateTimeBr(p.created_at),
  }))
})

const totalRows = computed(() => resp.value?.meta?.total ?? 0)
const totalPages = computed(() => resp.value?.meta?.last_page ?? 1)

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'produtos', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({ name: 'produtos', query: { ...route.query, busca: busca.value || undefined, page: undefined } })
}

function onRecarregar() {
  router.push({ name: 'produtos', query: { ...route.query, page: undefined } })
}

async function fetchData() {
  loading.value = true
  try {
    const [opts, paged] = await Promise.all([loadProdutosOptions(), listProdutos({ busca: busca.value, page: page.value })])
    options.value = opts
    resp.value = paged
  } finally {
    loading.value = false
    await nextTick()
    initLegacyUiBindings()
  }
}

watch(
  () => [page.value, route.query.busca],
  () => {
    fetchData()
  },
  { immediate: true },
)

onMounted(() => {
  initLegacyUiBindings()
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Produtos</h2>

  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Listagem de produtos. Pesquise por nome, código de barras ou NCM.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoProduto" to="/produtos/novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo produto</span>
          </RouterLink>
        </li>
        <li>
          <a id="btnRecarregar" href="javascript:void(0);" class="btn btn-lg btn-info" data-toggle="tooltip" title="Recarregar" @click.prevent="onRecarregar">
            <img src="/img/btn-recarregar.svg" style="height: 21px" /><span>Recarregar lista</span>
          </a>
        </li>
      </ul>

      <form class="navbar-form" method="get" @submit.prevent="onSubmit">
        <div class="form-group" style="display: inline">
          <div class="input-group input-group-lg" style="display: table">
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar" type="text" />
            <span class="input-group-btn" style="width: 1%">
              <button id="btnPesquisar" class="btn btn-default" type="submit">
                <img src="/img/btn-pesquisar-esq.svg" />
              </button>
            </span>
          </div>
        </div>
      </form>
    </div>
  </div>

  <DataTable :rows="rows" :row-key="(r) => (r as any).id" :page="page" :total-pages="totalPages" :total-items="totalRows" @page-change="goToPage">
    <template #head>
      <tr>
        <th style="width: 30%">Nome</th>
        <th style="width: 14%">Categoria</th>
        <th style="width: 14%">Código de barras</th>
        <th style="width: 8%">Unidade</th>
        <th style="width: 10%">Compra</th>
        <th style="width: 10%">Venda</th>
        <th style="width: 8%">Estoque</th>
        <th style="width: 8%">Status</th>
        <th style="width: 10%">Cadastro</th>
        <th style="width: 4%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).nome }}</td>
        <td>{{ (row as any).categoria }}</td>
        <td>{{ (row as any).codigoBarras }}</td>
        <td>{{ (row as any).unidade }}</td>
        <td>{{ (row as any).valorCompra }}</td>
        <td>{{ (row as any).valorVenda }}</td>
        <td>{{ (row as any).estoque }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).cadastradoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/produtos/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/produtos/${(row as any).id}/editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

