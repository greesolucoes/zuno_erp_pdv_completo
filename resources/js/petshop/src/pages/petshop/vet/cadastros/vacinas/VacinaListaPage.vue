<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../../../components/ui/DataTable.vue'
import { listVacinas, loadVacinasOptions, type VacinasLoadOptions } from '../../../../../services/petshop/vet/cadastros/vacinas.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<VacinasLoadOptions | null>(null)

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

type VacinaRow = {
  id: string
  vacina: string
  coberturasEProtocolo: string
  especiesEIdade: string
  aplicacao: string
  estoqueRecomendado: string
  status: string
  cadastradoEm: string
}

function compactText(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

function summarizeCoverage(input: string): string {
  const normalized = compactText(input)
  if (!normalized) return '-'
  const parts = normalized.split(/[.;]/).map((p) => p.trim()).filter(Boolean)
  if (!parts.length) return normalized
  return parts.slice(0, 2).join('; ') + (parts.length > 2 ? '…' : '')
}

const allRows = computed<VacinaRow[]>(() => {
  const loaded = options.value
  const vacinas = listVacinas(busca.value)

  return vacinas.map((v) => {
    const produto = loaded?.products.find((p) => p.id === v.product_id) ?? null
    const vacinaLabel = produto?.label ?? v.code

    const especies = loaded ? v.species.map((id) => findLabel(loaded.species, id)).join(', ') : v.species.join(', ')
    const idade = v.minimum_age.trim()
    const especiesEIdade = idade ? `${especies} • ${idade}` : especies || '-'

    const protocolo = compactText(v.protocol_primary || v.protocol_booster || v.protocol_revaccination)
    const coberturas = summarizeCoverage(v.coverage)
    const coberturasEProtocolo = protocolo ? `${coberturas} • ${protocolo}` : coberturas

    const aplicacaoParts = [compactText(v.route), compactText(v.application_site), compactText(v.dosage)].filter(Boolean)
    const aplicacao = aplicacaoParts.length ? aplicacaoParts.join(' • ') : '-'

    const estoqueRecomendado = produto ? `${produto.inventory_minimum_stock} mín. / ${produto.inventory_safety_stock} seg.` : '-'

    return {
      id: v.id,
      vacina: vacinaLabel,
      coberturasEProtocolo,
      especiesEIdade,
      aplicacao,
      estoqueRecomendado,
      status: v.status === 'inativa' ? 'Inativa' : 'Ativa',
      cadastradoEm: formatDateTimeBr(v.created_at),
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
  router.push({ name: 'petshop-vet-vacinas', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-vet-vacinas',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-vet-vacinas', query: { ...route.query, page: undefined } })
}

onMounted(() => {
  loadVacinasOptions().then((o) => {
    options.value = o
  })
  // Os handlers e tooltips são inicializados pelo DefaultLayout (initLegacyUiBindings)
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Vacinas</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">Cadastro de vacinas. Use o campo de pesquisa para localizar por código, grupo ou coberturas.</div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovaVacina" to="/Petshop/Vet/Cadastros/Vacinas/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Nova vacina</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por código, grupo ou coberturas" type="text" />
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
        <th style="width: 16%">Vacina</th>
        <th style="width: 22%">Coberturas e protocolo</th>
        <th style="width: 18%">Espécies e idade</th>
        <th style="width: 16%">Aplicação</th>
        <th style="width: 12%">Estoque recomendado</th>
        <th style="width: 8%">Status</th>
        <th style="width: 12%">Data de cadastro</th>
        <th style="width: 4%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).vacina }}</td>
        <td>{{ (row as any).coberturasEProtocolo }}</td>
        <td>{{ (row as any).especiesEIdade }}</td>
        <td>{{ (row as any).aplicacao }}</td>
        <td class="td-center">{{ (row as any).estoqueRecomendado }}</td>
        <td>{{ (row as any).status }}</td>
        <td>{{ (row as any).cadastradoEm }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Vet/Cadastros/Vacinas/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Vet/Cadastros/Vacinas/${(row as any).id}/Editar`" class="list-group-item">
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
