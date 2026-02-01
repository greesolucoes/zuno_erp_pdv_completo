<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../utils/legacyScripts'
import { createRetirada, deleteRetirada, listRetiradas, loadRetiradasOptions, type PaginatedResponse, type RetiradaEstoqueItem, type RetiradasOptions } from '../../services/estoque/retiradasEstoque.service'

const router = useRouter()
const route = useRoute()

const options = ref<RetiradasOptions | null>(null)
const loading = ref(false)
const resp = ref<PaginatedResponse<RetiradaEstoqueItem> | null>(null)

const produtoBusca = ref((route.query.produto as string) ?? '')
const localBusca = ref((route.query.local_id as string) ?? '')

const form = ref({ produto_id: '', quantidade: '', motivo: '', observacao: '', local_id: '' })

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type Row = { id: string; produto: string; quantidade: string; motivo: string; observacao: string; data: string }

const rows = computed<Row[]>(() => {
  const data = resp.value?.data ?? []
  return data.map((r) => ({
    id: r.id,
    produto: r.produto_nome,
    quantidade: r.quantidade,
    motivo: r.motivo,
    observacao: r.observacao,
    data: r.created_at,
  }))
})

const totalRows = computed(() => resp.value?.meta?.total ?? 0)
const totalPages = computed(() => resp.value?.meta?.last_page ?? 1)

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'estoque-retirada', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSearch() {
  router.push({
    name: 'estoque-retirada',
    query: { ...route.query, produto: produtoBusca.value || undefined, local_id: localBusca.value || undefined, page: undefined },
  })
}

async function onRecarregar() {
  router.push({ name: 'estoque-retirada', query: { ...route.query, page: undefined } })
}

async function onExcluir(id: string) {
  await deleteRetirada(id)
  await onRecarregar()
}

async function onSalvar() {
  await createRetirada({
    produto_id: form.value.produto_id,
    quantidade: form.value.quantidade,
    motivo: form.value.motivo,
    observacao: form.value.observacao || undefined,
    local_id: options.value?.multiLocal === 1 ? form.value.local_id || undefined : undefined,
  })
  form.value = { produto_id: '', quantidade: '', motivo: '', observacao: '', local_id: '' }
  await onRecarregar()
}

async function fetchData() {
  loading.value = true
  try {
    if (!options.value) options.value = await loadRetiradasOptions()
    resp.value = await listRetiradas({ produto: produtoBusca.value, local_id: localBusca.value, page: page.value })
  } finally {
    loading.value = false
    await nextTick()
    initLegacyUiBindings()
  }
}

watch(
  () => [page.value, route.query.produto, route.query.local_id],
  () => {
    produtoBusca.value = (route.query.produto as string) ?? ''
    localBusca.value = (route.query.local_id as string) ?? ''
    fetchData()
  },
  { immediate: true },
)

onMounted(() => initLegacyUiBindings())
</script>

<template>
  <h2>Retirada de Estoque</h2>

  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-if="options" class="pnlCollapse semi-aberto">
    <h2>Adicionar</h2>
    <div style="padding: 0 20px">
      <div class="row" style="margin-top: 5px; margin-bottom: 0">
        <div class="col-md-4">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Produto<span class="asterisco">*</span></span></label>
            <select v-model="form.produto_id" class="form-control form-select2" name="produto_id">
              <option value="">Selecione</option>
              <option v-for="p in options.produtos" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Quantidade<span class="asterisco">*</span></span></label>
            <input v-model="form.quantidade" class="form-control quantidade" name="quantidade" type="text" />
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Motivo<span class="asterisco">*</span></span></label>
            <select v-model="form.motivo" class="form-control" name="motivo">
              <option value="">Selecione</option>
              <option v-for="m in options.motivos" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-3">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Observação</span></label>
            <input v-model="form.observacao" class="form-control" name="observacao" type="text" />
          </div>
        </div>
        <div v-if="options.multiLocal === 1" class="col-md-3">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Local<span class="asterisco">*</span></span></label>
            <select v-model="form.local_id" class="form-control form-select2" name="local_id">
              <option value="">Selecione</option>
              <option v-for="l in options.locais" :key="l.id" :value="l.id">{{ l.label }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-2" style="margin-top: 28px">
          <button class="btn btn-lg btn-primary" type="button" @click.prevent="onSalvar">Salvar</button>
        </div>
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink to="/estoque" class="btn btn-lg btn-default">
            <img src="/img/btn-avancar.svg" style="height: 21px" /><span>Voltar</span>
          </RouterLink>
        </li>
      </ul>

      <form class="navbar-form" method="get" @submit.prevent="onSearch">
        <div class="form-group" style="display: inline; width: 260px">
          <input v-model="produtoBusca" class="form-control" name="produto" placeholder="Pesquisar por produto" type="text" />
        </div>

        <div v-if="options?.multiLocal === 1" class="form-group" style="display: inline; margin-left: 10px; width: 220px">
          <select v-model="localBusca" class="form-control" name="local_id">
            <option value="">Local</option>
            <option v-for="l in options?.locais ?? []" :key="l.id" :value="l.id">{{ l.label }}</option>
          </select>
        </div>

        <div class="form-group" style="display: inline; margin-left: 10px">
          <button id="btnPesquisar" class="btn btn-default" type="submit">
            <img src="/img/btn-pesquisar-esq.svg" />
          </button>
        </div>
      </form>
    </div>
  </div>

  <DataTable :rows="rows" :row-key="(r) => (r as any).id" :page="page" :total-pages="totalPages" :total-items="totalRows" @page-change="goToPage">
    <template #head>
      <tr>
        <th style="width: 35%">Produto</th>
        <th style="width: 10%">Quantidade</th>
        <th style="width: 15%">Motivo</th>
        <th style="width: 25%">Observação</th>
        <th style="width: 10%">Data</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).produto }}</td>
        <td>{{ (row as any).quantidade }}</td>
        <td>{{ (row as any).motivo }}</td>
        <td>{{ (row as any).observacao }}</td>
        <td>{{ (row as any).data }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <a href="javascript:void(0);" class="list-group-item text-danger" @click.prevent="onExcluir((row as any).id)">
                <img src="/img/op-excluir.svg" />Excluir
              </a>
            </div>
          </div>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

