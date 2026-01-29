<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listSalasAtendimento, loadSalasAtendimentoOptions, type SalasAtendimentoLoadOptions } from '../../../../../services/petshop/vet/cadastros/salasAtendimento.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<SalasAtendimentoLoadOptions | null>(null)

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

function findLabel(list: { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? value
}

type SalaRow = {
  id: string
  sala: string
  tipo: string
  status: string
  capacidade: string
  atualizadoEm: string
}

const allRows = computed<SalaRow[]>(() => {
  const loaded = options.value
  const salas = listSalasAtendimento(busca.value)
  return salas.map((s) => ({
    id: s.id,
    sala: s.nome,
    tipo: loaded ? findLabel(loaded.tipos, s.tipo) : s.tipo,
    status: loaded ? findLabel(loaded.status, s.status) : s.status,
    capacidade: s.capacidade || '-',
    atualizadoEm: formatDateTimeBr(s.updated_at),
  }))
})

const totalRows = computed(() => allRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / perPage)))
const pageRows = computed(() => {
  const start = (page.value - 1) * perPage
  return allRows.value.slice(start, start + perPage)
})

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'petshop-vet-salas-atendimento', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-salas-atendimento',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-salas-atendimento', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadSalasAtendimentoOptions().then((o) => {
    options.value = o
  })
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Salas de Atendimento</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Cadastro de salas de atendimento. Use o campo de pesquisa para localizar por nome, tipo ou status.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaSalaAtendimento" to="/Petshop/Vet/Cadastros/SalasAtendimento/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova sala</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por nome, tipo ou status" type="text" />
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

  <DataTable
    :rows="pageRows"
    :row-key="(r) => (r as any).id"
    :page="page"
    :total-pages="totalPages"
    :total-items="totalRows"
    @page-change="goToPage"
  >
    <template #head>
      <tr>
        <th style="width: 32%">Sala</th>
        <th style="width: 18%">Tipo</th>
        <th style="width: 12%">Status</th>
        <th style="width: 12%">Capacidade</th>
        <th style="width: 20%">Atualizado em</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).sala }}</td>
        <td>{{ (row as any).tipo }}</td>
        <td>{{ (row as any).status }}</td>
        <td class="td-center">{{ (row as any).capacidade }}</td>
        <td>{{ (row as any).atualizadoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Cadastros/SalasAtendimento/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Cadastros/SalasAtendimento/${(row as any).id}/Editar`" class="list-group-item">
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
