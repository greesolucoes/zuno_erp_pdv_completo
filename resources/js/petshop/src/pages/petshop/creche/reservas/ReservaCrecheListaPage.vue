<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../components/ui/DataTable.vue'
import {
  listReservasCreche,
  loadReservasCrecheOptions,
  type ReservaCreche,
  type ReservasCrecheLoadOptions,
} from '../../../../services/petshop/creche/reservas.service'
import { initLegacyUiBindings } from '../../../../utils/legacyScripts'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<ReservasCrecheLoadOptions | null>(null)
const loading = ref(false)
const reservas = ref<ReservaCreche[]>([])
const totalPages = ref(1)
const totalRows = ref(0)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

function formatDateTimeBr(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function findLabel(list: { id: string; label: string }[], value: string): string {
  return list.find((o) => o.id === value)?.label ?? value
}

type ReservaRow = {
  id: string
  ordemServico: string
  pet: string
  cliente: string
  situacao: string
  turma: string
  entrada: string
  saida: string
  valor: string
  cadastro: string
}

const allRows = computed<ReservaRow[]>(() => {
  const loaded = options.value
  return reservas.value.map((r) => {
    const pet = loaded?.pets.find((p) => p.id === r.animal_id) ?? null
    const turma = loaded ? findLabel(loaded.turmas, r.turma_id) : r.turma_id
    const situacao = loaded ? (loaded.estados.find((s) => s.value === r.estado)?.label ?? r.estado) : r.estado
    return {
      id: r.id,
      ordemServico: r.ordem_servico || '-',
      pet: pet?.label ?? r.animal_id,
      cliente: pet?.cliente_nome ?? r.cliente_id ?? '-',
      situacao,
      turma,
      entrada: r.data_entrada || '-',
      saida: r.data_saida || '-',
      valor: r.valor_total ? `R$ ${r.valor_total}` : '-',
      cadastro: formatDateTimeBr(r.created_at),
    }
  })
})

async function fetchData() {
  loading.value = true
  try {
    const [loadedOptions, list] = await Promise.all([loadReservasCrecheOptions(), listReservasCreche({ busca: busca.value, page: page.value })])
    options.value = loadedOptions
    reservas.value = list.data
    totalPages.value = list.meta.last_page
    totalRows.value = list.meta.total
    await nextTick()
    initLegacyUiBindings()
  } finally {
    loading.value = false
  }
}

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value || 1)
  router.push({ name: 'petshop-creche-reservas', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-creche-reservas',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-creche-reservas', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  fetchData()
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})

watch(
  () => [route.query.page, route.query.busca],
  () => {
    busca.value = (route.query.busca as string) ?? ''
    fetchData()
  },
)
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Reservas da Creche</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Listagem de reservas da creche. Pesquise por ordem de serviço, pet, cliente, turma ou situação.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaReservaCreche" to="/Petshop/Creche/Reservas/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova reserva</span>
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

  <DataTable :rows="allRows" :row-key="(r) => (r as any).id" :page="page" :total-pages="totalPages" :total-items="totalRows" :loading="loading" @page-change="goToPage">
    <template #head>
      <tr>
        <th style="width: 12%">Ordem de Serviço</th>
        <th style="width: 14%">Pet</th>
        <th style="width: 16%">Cliente</th>
        <th style="width: 12%">Situação</th>
        <th style="width: 14%">Turma</th>
        <th style="width: 10%">Data de Entrada</th>
        <th style="width: 10%">Data de Saída</th>
        <th style="width: 8%">Valor</th>
        <th style="width: 12%">Data de Cadastro</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).ordemServico }}</td>
        <td>{{ (row as any).pet }}</td>
        <td>{{ (row as any).cliente }}</td>
        <td>{{ (row as any).situacao }}</td>
        <td>{{ (row as any).turma }}</td>
        <td>{{ (row as any).entrada }}</td>
        <td>{{ (row as any).saida }}</td>
        <td>{{ (row as any).valor }}</td>
        <td>{{ (row as any).cadastro }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Creche/Reservas/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Creche/Reservas/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>
