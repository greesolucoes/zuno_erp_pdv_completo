<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../components/ui/DataTable.vue'
import { listEstetica, loadEsteticaOptions, type EsteticaLoadOptions } from '../../../../services/petshop/estetica/estetica.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<EsteticaLoadOptions | null>(null)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
const perPage = 10

function formatDateTimeBr(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function formatMoneyBr(input: string) {
  const raw = String(input ?? '').trim()
  if (!raw) return '-'
  return `R$ ${raw}`
}

function findLabel(list: { id: string; label: string }[], value: string): string {
  return list.find((o) => o.id === value)?.label ?? value
}

type Row = {
  id: string
  ordemServico: string
  pet: string
  cliente: string
  servico: string
  data: string
  horario: string
  status: string
  valor: string
  cadastro: string
}

const allRows = computed<Row[]>(() => {
  const loaded = options.value
  const itens = listEstetica(busca.value)
  return itens.map((i) => {
    const pet = loaded?.pets.find((p) => p.id === i.animal_id) ?? null
    const firstServico = i.servicos?.[0]?.servico_id ? (loaded ? findLabel(loaded.servicos, i.servicos[0].servico_id) : i.servicos[0].servico_id) : '-'
    const status = loaded ? (loaded.estados.find((s) => s.value === i.estado)?.label ?? i.estado) : i.estado
    return {
      id: i.id,
      ordemServico: i.ordem_servico || '-',
      pet: pet?.label ?? i.animal_id,
      cliente: pet?.cliente_nome ?? i.cliente_id ?? '-',
      servico: firstServico,
      data: i.data_agendamento || '-',
      horario: i.horario_agendamento || '-',
      status,
      valor: formatMoneyBr(i.valor_total),
      cadastro: formatDateTimeBr(i.created_at),
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
  router.push({ name: 'petshop-estetica-gerenciar', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-estetica-gerenciar',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-estetica-gerenciar', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadEsteticaOptions().then((o) => {
    options.value = o
  })
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Gerenciar Estética</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Listagem de ordens de serviço da estética. Pesquise por OS, pet, cliente ou status.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaEstetica" to="/Petshop/Estetica/Gerenciar/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo</span>
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

  <DataTable :rows="pageRows" :row-key="(r) => (r as any).id" :page="page" :total-pages="totalPages" :total-items="totalRows" @page-change="goToPage">
    <template #head>
      <tr>
        <th style="width: 10%">Ordem de Serviço</th>
        <th style="width: 15%">Pet</th>
        <th style="width: 15%">Cliente</th>
        <th style="width: 15%">Serviço</th>
        <th style="width: 10%">Data</th>
        <th style="width: 10%">Horário</th>
        <th style="width: 15%">Status</th>
        <th style="width: 10%">Valor</th>
        <th style="width: 10%">Cadastro</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).ordemServico }}</td>
        <td>{{ (row as any).pet }}</td>
        <td>{{ (row as any).cliente }}</td>
        <td>{{ (row as any).servico }}</td>
        <td>{{ (row as any).data }}</td>
        <td>{{ (row as any).horario }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).valor }}</td>
        <td>{{ (row as any).cadastro }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Estetica/Gerenciar/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Estetica/Gerenciar/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
  <span class="sem-registros">Nenhum registro encontrado</span>
</template>
