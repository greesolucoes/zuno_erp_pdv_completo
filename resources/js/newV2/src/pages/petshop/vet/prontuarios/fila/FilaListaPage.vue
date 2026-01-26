<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listFilaProntuarios, loadFilaProntuariosOptions, type FilaProntuarioLoadOptions } from '../../../../../services/petshop/vet/prontuarios/fila.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<FilaProntuarioLoadOptions | null>(null)

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

function findStatusLabel(value: string) {
  const loaded = options.value
  if (!loaded) return value
  return loaded.status.find((s) => s.value === value)?.label ?? value
}

type FilaRow = {
  id: string
  paciente: string
  tutor: string
  veterinario: string
  status: string
  tipoAtendimento: string
  atendimentoAtivo: string
  atualizadoEm: string
}

const allRows = computed<FilaRow[]>(() => {
  const loaded = options.value
  const rows = listFilaProntuarios(busca.value)
  return rows.map((r) => {
    const statusLabel = findStatusLabel(r.status)
    const ativo = r.status === 'em_atendimento' ? 'Sim' : 'Não'
    return {
      id: r.id,
      paciente: findPatientLabel(r.paciente_id),
      tutor: findTutorLabel(r.paciente_id),
      veterinario: loaded ? findLabel(loaded.veterinarios, r.veterinario_id) : r.veterinario_id,
      status: statusLabel,
      tipoAtendimento: findTipoLabel(r.tipo_atendimento),
      atendimentoAtivo: ativo,
      atualizadoEm: formatDateTimeBr(r.updated_at),
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
  router.push({ name: 'petshop-vet-prontuarios-fila', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-prontuarios-fila',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-prontuarios-fila', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadFilaProntuariosOptions().then((o) => {
    options.value = o
  })
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Fila de consultas</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Controle de prontuários em fila. Use a pesquisa para localizar por paciente, tutor, status ou tipo de atendimento.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink to="/Petshop/Vet/Prontuarios/Fila/Novo" class="btn btn-lg btn-primary">
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
        <th style="width: 16%">Tutor</th>
        <th style="width: 18%">Profissional Responsável</th>
        <th style="width: 10%">Status</th>
        <th style="width: 14%">Tipo de Atendimento</th>
        <th style="width: 10%">Atendimento ativo</th>
        <th style="width: 16%">Atualização</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).paciente }}</td>
        <td>{{ (row as any).tutor }}</td>
        <td>{{ (row as any).veterinario }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).tipoAtendimento }}</td>
        <td class="td-center">{{ (row as any).atendimentoAtivo }}</td>
        <td>{{ (row as any).atualizadoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Prontuarios/Fila/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Prontuarios/Fila/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

