<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../../utils/legacyScripts'
import {
  deleteCategoriaProduto,
  listCategoriasProduto,
  type CategoriaProduto,
  type PaginatedResponse,
} from '../../../services/produtos/categoriasProduto.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const loading = ref(false)
const resp = ref<PaginatedResponse<CategoriaProduto> | null>(null)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type Row = {
  id: string
  nome: string
  categoriaPai: string
  status: string
  cardapio: string
  delivery: string
  ecommerce: string
  reserva: string
}

const rows = computed<Row[]>(() => {
  const data = resp.value?.data ?? []
  return data.map((c) => ({
    id: c.id,
    nome: c.nome,
    categoriaPai: c.categoria_nome || '-',
    status: c.status === '1' ? 'Ativo' : 'Inativo',
    cardapio: c.cardapio === '1' ? 'Sim' : 'Não',
    delivery: c.delivery === '1' ? 'Sim' : 'Não',
    ecommerce: c.ecommerce === '1' ? 'Sim' : 'Não',
    reserva: c.reserva === '1' ? 'Sim' : 'Não',
  }))
})

const totalRows = computed(() => resp.value?.meta?.total ?? 0)
const totalPages = computed(() => resp.value?.meta?.last_page ?? 1)

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'categorias-produto', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({ name: 'categorias-produto', query: { ...route.query, busca: busca.value || undefined, page: undefined } })
}

function onRecarregar() {
  router.push({ name: 'categorias-produto', query: { ...route.query, page: undefined } })
}

async function onExcluir(id: string) {
  await deleteCategoriaProduto(id)
  onRecarregar()
}

async function fetchData() {
  loading.value = true
  try {
    resp.value = await listCategoriasProduto({ busca: busca.value, page: page.value })
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
  <h2>Categorias de Produto</h2>

  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaCategoriaProduto" to="/produtos/categorias/novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova categoria</span>
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
        <th style="width: 20%">Categoria pai</th>
        <th style="width: 10%">Status</th>
        <th style="width: 10%">Cardápio</th>
        <th style="width: 10%">Delivery</th>
        <th style="width: 10%">Ecommerce</th>
        <th style="width: 10%">Reserva</th>
        <th style="width: 4%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).nome }}</td>
        <td>{{ (row as any).categoriaPai }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).cardapio }}</td>
        <td>{{ (row as any).delivery }}</td>
        <td>{{ (row as any).ecommerce }}</td>
        <td>{{ (row as any).reserva }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/produtos/categorias/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/produtos/categorias/${(row as any).id}/editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
              <a href="javascript:void(0);" class="list-group-item text-danger" @click.prevent="onExcluir((row as any).id)">
                <img src="/img/op-excluir.svg" />Excluir
              </a>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

