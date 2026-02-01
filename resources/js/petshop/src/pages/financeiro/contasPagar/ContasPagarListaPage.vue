<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../../utils/legacyScripts'
import { deleteContaPagar, listContasPagar, type ContaPagar, type PaginatedResponse } from '../../../services/financeiro/contasPagar.service'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const resp = ref<PaginatedResponse<ContaPagar> | null>(null)

const busca = ref((route.query.busca as string) ?? '')

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type Row = {
  id: string
  fornecedor: string
  descricao: string
  categoria: string
  vencimento: string
  valor: string
  status: string
  pagamento: string
}

function formatDateBr(input: string): string {
  if (!input) return '-'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    // fallback para YYYY-MM-DD
    const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    return input
  }
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date)
}

const rows = computed<Row[]>(() => {
  const data = resp.value?.data ?? []
  return data.map((c) => ({
    id: c.id,
    fornecedor: c.fornecedor_nome,
    descricao: c.descricao,
    categoria: c.categoria_nome,
    vencimento: formatDateBr(c.data_vencimento),
    valor: c.valor_integral ? `R$ ${c.valor_integral}` : '-',
    status: c.status === '1' ? 'Paga' : 'Pendente',
    pagamento: c.status === '1' ? `${formatDateBr(c.data_pagamento)} • R$ ${c.valor_pago}` : '-',
  }))
})

const totalRows = computed(() => resp.value?.meta?.total ?? 0)
const totalPages = computed(() => resp.value?.meta?.last_page ?? 1)

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'contas-pagar', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'contas-pagar',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'contas-pagar', query: { ...route.query, page: undefined } })
}

async function onExcluir(id: string) {
  await deleteContaPagar(id)
  onRecarregar()
}

async function fetchData() {
  loading.value = true
  try {
    resp.value = await listContasPagar({
      busca: busca.value,
      page: page.value,
    })
  } finally {
    loading.value = false
    await nextTick()
    initLegacyUiBindings()
  }
}

watch(
  () => [page.value, route.query.busca],
  () => {
    busca.value = (route.query.busca as string) ?? ''
    fetchData()
  },
  { immediate: true },
)

onMounted(() => initLegacyUiBindings())
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Contas a pagar</h2>

  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Listagem de contas a pagar. Use os filtros para encontrar rapidamente.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaContaPagar" to="/financeiro/contas-pagar/novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova conta a pagar</span>
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
        <th style="width: 18%">Fornecedor</th>
        <th style="width: 22%">Descrição</th>
        <th style="width: 15%">Categoria</th>
        <th style="width: 10%">Venc.</th>
        <th style="width: 10%">Valor</th>
        <th style="width: 10%">Status</th>
        <th style="width: 10%">Pagamento</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).fornecedor }}</td>
        <td>{{ (row as any).descricao }}</td>
        <td>{{ (row as any).categoria }}</td>
        <td>{{ (row as any).vencimento }}</td>
        <td>{{ (row as any).valor }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).pagamento }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/financeiro/contas-pagar/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/financeiro/contas-pagar/${(row as any).id}/editar`" class="list-group-item">
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
