<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listMedicos, loadMedicosOptions, type Medico, type MedicosLoadOptions } from '../../../../../services/petshop/vet/cadastros/medicos.service'
import { initLegacyUiBindings } from '../../../../../utils/legacyScripts'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<MedicosLoadOptions | null>(null)
const loading = ref(false)
const medicos = ref<Medico[]>([])
const totalPages = ref(1)
const totalRows = ref(0)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

function findLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id
}

type MedicoRow = {
  id: string
  nome: string
  crmv: string
  especialidade: string
  status: string
}

const rows = computed<MedicoRow[]>(() => {
  const loadedOptions = options.value

  return medicos.value.map((m) => ({
    id: m.id,
    nome: loadedOptions ? findLabel(loadedOptions.funcionarios, m.funcionario_id) : m.funcionario_id,
    crmv: m.crmv,
    especialidade: m.especialidade,
    status: m.status === 'inativo' ? 'Inativo' : 'Ativo',
  }))
})

async function fetchData() {
  loading.value = true
  try {
    const [loadedOptions, list] = await Promise.all([loadMedicosOptions(), listMedicos({ busca: busca.value, page: page.value })])
    options.value = loadedOptions
    medicos.value = list.data
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
  router.push({
    name: 'petshop-vet-medicos',
    query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) },
  })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-medicos',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-medicos', query: { ...route.query, page: undefined } })
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

  <h2>Médicos</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Cadastro de médicos do petshop. Use o campo de pesquisa para localizar por nome, CRMV ou especialidade.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoMedico" to="/Petshop/Vet/Cadastros/Medicos/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo médico</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por nome, CRMV ou especialidade" type="text" />
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
        <th style="width: 35%">Nome</th>
        <th style="width: 15%">CRMV</th>
        <th style="width: 25%">Especialidade</th>
        <th style="width: 15%">Status</th>
        <th style="width: 10%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).nome }}</td>
        <td>{{ (row as any).crmv }}</td>
        <td>{{ (row as any).especialidade }}</td>
        <td>{{ (row as any).status }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Cadastros/Medicos/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Cadastros/Medicos/${(row as any).id}/Editar`" class="list-group-item">
                <img src="/img/op-substituir.svg" />Editar
              </RouterLink>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>
