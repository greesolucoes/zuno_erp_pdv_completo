<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import {
  listConsultasHistorico,
  loadConsultasHistoricoOptions,
  reopenConsultaInFila,
  type ConsultasHistoricoLoadOptions,
} from '../../../../../services/petshop/vet/prontuarios/consultas.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<ConsultasHistoricoLoadOptions | null>(null)

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

function findPatientLabel(id: string) {
  const loaded = options.value
  if (!loaded) return id
  return loaded.pacientes.find((p) => p.id === id)?.label ?? id
}

function findTutorLabel(id: string) {
  const loaded = options.value
  if (!loaded) return id
  return loaded.pacientes.find((p) => p.id === id)?.tutor_nome ?? '-'
}

function findTipoLabel(value: string) {
  const loaded = options.value
  if (!loaded) return value
  return loaded.tiposAtendimento.find((t) => t.value === value)?.label ?? value
}

type Row = {
  id: string
  prontuarioId: string
  paciente: string
  tutor: string
  veterinario: string
  tipoAtendimento: string
  slot: string
  atualizadoEm: string
}

const allRows = computed<Row[]>(() => {
  const loaded = options.value
  const rows = listConsultasHistorico(busca.value)
  return rows.map((r) => ({
    id: r.id,
    prontuarioId: r.prontuario_id,
    paciente: findPatientLabel(r.paciente_id),
    tutor: findTutorLabel(r.paciente_id),
    veterinario: loaded ? findLabel(loaded.veterinarios, r.veterinario_id) : r.veterinario_id,
    tipoAtendimento: findTipoLabel(r.tipo_atendimento),
    slot: r.slot,
    atualizadoEm: formatDateTimeBr(r.updated_at),
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
  router.push({ name: 'petshop-vet-prontuarios-consultas', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-prontuarios-consultas',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-prontuarios-consultas', query: { ...route.query, page: undefined } })
}

const actionLoadingId = ref<string | null>(null)

async function onReabrirNaFila(id: string) {
  actionLoadingId.value = id
  try {
    const result = await reopenConsultaInFila(id)
    if (!result) return
    router.push({ path: `/Petshop/Vet/Prontuarios/Fila/${result.newId}` })
  } finally {
    actionLoadingId.value = null
  }
}

onMounted(() => {
  loadConsultasHistoricoOptions().then((o) => {
    options.value = o
  })
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Histórico de Consultas</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Registros finalizados (passado) da fila de consultas. Ações: visualizar, reabrir na fila, criar novo atendimento a partir do registro.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
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
        <th style="width: 14%">Prontuário</th>
        <th style="width: 26%">Paciente</th>
        <th style="width: 18%">Tutor</th>
        <th style="width: 22%">Profissional Responsável</th>
        <th style="width: 14%">Tipo de Atendimento</th>
        <th style="width: 10%">Slot</th>
        <th style="width: 16%">Atualização</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td>{{ (row as any).prontuarioId }}</td>
        <td class="td-texto-grande">{{ (row as any).paciente }}</td>
        <td>{{ (row as any).tutor }}</td>
        <td>{{ (row as any).veterinario }}</td>
        <td>{{ (row as any).tipoAtendimento }}</td>
        <td class="td-center">{{ (row as any).slot }}</td>
        <td>{{ (row as any).atualizadoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Prontuarios/Fila/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar prontuário
              </RouterLink>
              <a
                href="javascript:void(0);"
                class="list-group-item"
                @click.prevent="onReabrirNaFila((row as any).id)"
              >
                <img src="/img/op-substituir.svg" />
                {{ actionLoadingId === (row as any).id ? 'Reabrindo...' : 'Reabrir na fila' }}
              </a>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>
