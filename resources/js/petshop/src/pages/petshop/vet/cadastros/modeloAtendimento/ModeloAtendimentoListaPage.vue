<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../../../../utils/legacyScripts'
import { listModelosAtendimento, loadModeloAtendimentoOptions, type ModeloAtendimento, type ModeloAtendimentoLoadOptions } from '../../../../../services/petshop/vet/cadastros/modeloAtendimento.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<ModeloAtendimentoLoadOptions | null>(null)
const loading = ref(false)
const modelos = ref<ModeloAtendimento[]>([])
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

function findLabel(list: { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? value
}

type Row = {
  id: string
  titulo: string
  categoria: string
  atualizadoEm: string
  status: string
}

const allRows = computed<Row[]>(() => {
  const loaded = options.value
  return modelos.value.map((m) => ({
    id: m.id,
    titulo: m.title,
    categoria: m.category || '-',
    atualizadoEm: formatDateTimeBr(m.updated_at),
    status: m.status ? (loaded ? findLabel(loaded.status, m.status) : m.status) : '-',
  }))
})

async function fetchData() {
  loading.value = true
  try {
    const [loadedOptions, list] = await Promise.all([loadModeloAtendimentoOptions(), listModelosAtendimento({ busca: busca.value, page: page.value })])
    options.value = loadedOptions
    modelos.value = list.data
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
  router.push({ name: 'petshop-vet-modelo-atendimento', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-modelo-atendimento',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-modelo-atendimento', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  fetchData()
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

  <h2>Modelo de Atendimento</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Cadastre modelos de atendimento (scripts clínicos). Você pode salvar um rascunho com o básico e preencher o conteúdo depois.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoModeloAtendimento" to="/Petshop/Vet/Cadastros/ModeloAtendimento/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo modelo</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por título, categoria ou status" type="text" />
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
    :rows="allRows"
    :row-key="(r) => (r as any).id"
    :page="page"
    :total-pages="totalPages"
    :total-items="totalRows"
    :loading="loading"
    @page-change="goToPage"
  >
    <template #head>
      <tr>
        <th style="width: 40%">Título do Modelo</th>
        <th style="width: 25%">Categoria</th>
        <th style="width: 20%">Atualizado em</th>
        <th style="width: 10%">Status</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).titulo }}</td>
        <td>{{ (row as any).categoria }}</td>
        <td>{{ (row as any).atualizadoEm }}</td>
        <td>{{ (row as any).status }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Cadastros/ModeloAtendimento/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Cadastros/ModeloAtendimento/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>
