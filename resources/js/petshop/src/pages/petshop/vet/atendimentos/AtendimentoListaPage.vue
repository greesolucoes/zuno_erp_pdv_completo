<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../components/ui/DataTable.vue'
import { listAtendimentos, loadAtendimentosOptions, type AtendimentoLoadOptions } from '../../../../services/petshop/vet/atendimentos/atendimentos.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<AtendimentoLoadOptions | null>(null)

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

function findLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id
}

function findStatusLabel(list: { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? value
}

type Row = {
  id: string
  paciente: string
  veterinario: string
  servico: string
  inicio: string
  status: string
  criadoEm: string
}

const allRows = computed<Row[]>(() => {
  const loaded = options.value
  const atendimentos = listAtendimentos(busca.value)
  return atendimentos.map((a) => ({
    id: a.id,
    paciente: loaded ? findLabel(loaded.pacientes, a.paciente_id) : a.paciente_id,
    veterinario: loaded ? findLabel(loaded.veterinarios, a.veterinario_id) : a.veterinario_id,
    servico: loaded ? findLabel(loaded.servicos, a.servico_id) : a.servico_id,
    inicio: formatDateTimeBr(a.inicio_atendimento),
    status: loaded ? findStatusLabel(loaded.status as any, a.status) : a.status,
    criadoEm: formatDateTimeBr(a.created_at),
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
  router.push({ name: 'petshop-vet-atendimentos', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-atendimentos',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-atendimentos', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadAtendimentosOptions().then((o) => {
    options.value = o
  })
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Atendimentos</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Gerencie atendimentos: pré-atendimento, triagem e status. Use a pesquisa para localizar por paciente, veterinário, serviço ou status.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoAtendimento" to="/Petshop/Vet/Atendimentos/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo atendimento</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por paciente, veterinário, serviço ou status" type="text" />
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
        <th style="width: 22%">Paciente</th>
        <th style="width: 18%">Veterinário</th>
        <th style="width: 15%">Serviço</th>
        <th style="width: 18%">Início do atendimento</th>
        <th style="width: 12%">Status</th>
        <th style="width: 15%">Data de Criação</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).paciente }}</td>
        <td>{{ (row as any).veterinario }}</td>
        <td>{{ (row as any).servico }}</td>
        <td>{{ (row as any).inicio }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).criadoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Atendimentos/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Atendimentos/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

