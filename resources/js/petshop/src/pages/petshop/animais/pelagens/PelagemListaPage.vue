<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../components/ui/DataTable.vue'
import { listPelagens, loadPelagensOptions, type Pelagem } from '../../../../services/petshop/animais/pelagens.service'
import { initLegacyUiBindings } from '../../../../utils/legacyScripts'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const loading = ref(false)
const pelagens = ref<Pelagem[]>([])
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

type PelagemRow = {
  id: string
  nome: string
  cadastradoEm: string
}

const rows = computed<PelagemRow[]>(() => {
  return pelagens.value.map((p) => ({
    id: p.id,
    nome: p.nome,
    cadastradoEm: formatDateTimeBr(p.created_at),
  }))
})

async function fetchData() {
  loading.value = true
  try {
    await loadPelagensOptions()
    const list = await listPelagens({ busca: busca.value, page: page.value })
    pelagens.value = list.data
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
  router.push({ name: 'petshop-pelagens', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-pelagens',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-pelagens', query: { ...route.query, page: undefined } })
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

  <h2>Pelagens</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Cadastro de pelagens do petshop. Use o campo de pesquisa para localizar por nome.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaPelagem" to="/Petshop/Pelagens/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova pelagem</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por nome da pelagem" type="text" />
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
    :rows="rows"
    :row-key="(r) => (r as any).id"
    :page="page"
    :total-pages="totalPages"
    :total-items="totalRows"
    :loading="loading"
    @page-change="goToPage"
  >
    <template #head>
      <tr>
        <th style="width: 60%">Nome da pelagem</th>
        <th style="width: 30%">Cadastrado em</th>
        <th style="width: 10%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).nome }}</td>
        <td>{{ (row as any).cadastradoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Pelagens/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Pelagens/${(row as any).id}/Editar`" class="list-group-item">
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
