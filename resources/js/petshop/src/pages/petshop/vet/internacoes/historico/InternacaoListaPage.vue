<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listInternacoes, loadInternacoesOptions, type InternacoesLoadOptions } from '../../../../../services/petshop/vet/internacoes/internacoes.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<InternacoesLoadOptions | null>(null)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
const perPage = 10

function findLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id
}

function formatAdmission(date: string, time: string) {
  const safeDate = date || '-'
  if (!time) return safeDate
  return `${safeDate} ${time}`
}

type Row = {
  id: string
  paciente: string
  tutor: string
  veterinario: string
  statusClinico: string
  unidade: string
  admissao: string
  previsaoAlta: string
}

const allRows = computed<Row[]>(() => {
  const loaded = options.value
  const items = listInternacoes(busca.value)
  return items.map((i) => {
    const patient = loaded?.patients.find((p) => p.id === i.patient_id)
    const status = loaded?.statusOptions.find((s) => s.value === i.status)?.label ?? i.status
    const room = loaded ? findLabel(loaded.rooms, i.sala_internacao_id) : i.sala_internacao_id
    const vet = loaded ? findLabel(loaded.veterinarios, i.veterinario_id) : i.veterinario_id
    return {
      id: i.id,
      paciente: patient?.label ?? i.patient_id,
      tutor: patient?.tutor_nome ?? '-',
      veterinario: vet,
      statusClinico: status,
      unidade: room,
      admissao: formatAdmission(i.admission_date, i.admission_time),
      previsaoAlta: i.expected_discharge_date || '-',
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
  router.push({ name: 'petshop-vet-internacoes-historico', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-internacoes-historico',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-internacoes-historico', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadInternacoesOptions().then((o) => {
    options.value = o
  })
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Histórico de Internação</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Histórico de internações (rascunhos, ativas e altas). Use a pesquisa para localizar.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink to="/Petshop/Vet/Internacoes/Historico/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova internação</span>
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
        <th style="width: 20%">Paciente</th>
        <th style="width: 16%">Tutor</th>
        <th style="width: 18%">Profissional responsável</th>
        <th style="width: 12%">Status clínico</th>
        <th style="width: 12%">Unidade</th>
        <th style="width: 12%">Admissão</th>
        <th style="width: 12%">Previsão de alta</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).paciente }}</td>
        <td>{{ (row as any).tutor }}</td>
        <td>{{ (row as any).veterinario }}</td>
        <td>{{ (row as any).statusClinico }}</td>
        <td>{{ (row as any).unidade }}</td>
        <td>{{ (row as any).admissao }}</td>
        <td>{{ (row as any).previsaoAlta }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Internacoes/Historico/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Internacoes/Historico/${(row as any).id}/Editar`" class="list-group-item">
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
