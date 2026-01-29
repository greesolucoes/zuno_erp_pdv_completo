<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listMedicamentos, loadMedicamentosOptions, type MedicamentosLoadOptions } from '../../../../../services/petshop/vet/cadastros/medicamentos.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<MedicamentosLoadOptions | null>(null)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
const perPage = 10

function findLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id
}

function formatDateTimeBr(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

type MedicamentoRow = {
  id: string
  medicamento: string
  categoria: string
  via: string
  especies: string
  estoque: string
  status: string
  cadastradoEm: string
}

const allRows = computed<MedicamentoRow[]>(() => {
  const loadedOptions = options.value
  const medicamentos = listMedicamentos(busca.value)

  return medicamentos.map((m) => {
    const especies = loadedOptions
      ? (m.especies ?? []).map((id) => findLabel(loadedOptions.especies, id)).join(', ')
      : (m.especies ?? []).join(', ')

    const produto = loadedOptions?.produtos.find((p) => p.id === m.produto_id) ?? null
    const estoque = produto ? `${produto.current_stock}` : '-'

    return {
      id: m.id,
      medicamento: m.nome_comercial,
      categoria: m.classe_terapeutica,
      via: m.via_administracao,
      especies,
      estoque,
      status: m.status === 'inativo' ? 'Inativo' : 'Ativo',
      cadastradoEm: formatDateTimeBr(m.created_at),
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
  router.push({ name: 'petshop-vet-medicamentos', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-medicamentos',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-medicamentos', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadMedicamentosOptions().then((o) => {
    options.value = o
  })
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Medicamentos</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Cadastro de medicamentos. Use o campo de pesquisa para localizar por nome, classe terapêutica ou via.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoMedicamento" to="/Petshop/Vet/Cadastros/Medicamentos/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo medicamento</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por nome, classe ou via" type="text" />
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
        <th style="width: 18%">Medicamento</th>
        <th style="width: 16%">Categoria terapêutica</th>
        <th style="width: 10%">Via</th>
        <th style="width: 18%">Espécies</th>
        <th style="width: 8%">Estoque</th>
        <th style="width: 10%">Status</th>
        <th style="width: 14%">Data de cadastro</th>
        <th style="width: 6%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).medicamento }}</td>
        <td>{{ (row as any).categoria }}</td>
        <td>{{ (row as any).via }}</td>
        <td>{{ (row as any).especies }}</td>
        <td class="td-center">{{ (row as any).estoque }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).cadastradoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Cadastros/Medicamentos/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Cadastros/Medicamentos/${(row as any).id}/Editar`" class="list-group-item">
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
