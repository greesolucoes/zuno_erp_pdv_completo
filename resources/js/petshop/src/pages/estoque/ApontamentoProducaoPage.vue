<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../components/ui/DataTable.vue'
import { initLegacyUiBindings } from '../../utils/legacyScripts'
import { createApontamento, getApontamentoPrintUrl, listApontamentos, loadApontamentosOptions, type ApontamentoItem, type ApontamentosOptions, type PaginatedResponse } from '../../services/estoque/apontamentos.service'

const router = useRouter()
const route = useRoute()

const options = ref<ApontamentosOptions | null>(null)
const loading = ref(false)
const resp = ref<PaginatedResponse<ApontamentoItem> | null>(null)

const form = ref({ produto_composto_id: '', quantidade: '' })

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type Row = { id: string; produto: string; quantidade: string; data: string }

const rows = computed<Row[]>(() => {
  const data = resp.value?.data ?? []
  return data.map((a) => ({
    id: a.id,
    produto: a.produto_nome,
    quantidade: a.quantidade,
    data: a.created_at,
  }))
})

const totalRows = computed(() => resp.value?.meta?.total ?? 0)
const totalPages = computed(() => resp.value?.meta?.last_page ?? 1)

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value)
  router.push({ name: 'estoque-apontamento', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

async function onRecarregar() {
  router.push({ name: 'estoque-apontamento', query: { ...route.query, page: undefined } })
}

async function onSalvar() {
  await createApontamento({ produto_composto_id: form.value.produto_composto_id, quantidade: form.value.quantidade })
  form.value = { produto_composto_id: '', quantidade: '' }
  await onRecarregar()
}

async function onImprimir(id: string) {
  const { url } = await getApontamentoPrintUrl(id)
  window.open(url, '_blank')
}

async function fetchData() {
  loading.value = true
  try {
    if (!options.value) options.value = await loadApontamentosOptions()
    resp.value = await listApontamentos({ page: page.value })
  } finally {
    loading.value = false
    await nextTick()
    initLegacyUiBindings()
  }
}

watch(
  () => [page.value],
  () => fetchData(),
  { immediate: true },
)

onMounted(() => initLegacyUiBindings())
</script>

<template>
  <h2>Apontamento de Produção</h2>

  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-if="options" class="pnlCollapse semi-aberto">
    <h2>Adicionar</h2>
    <div style="padding: 0 20px">
      <div class="row" style="margin-top: 5px; margin-bottom: 0">
        <div class="col-md-6">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Produto (composto)<span class="asterisco">*</span></span></label>
            <select v-model="form.produto_composto_id" class="form-control form-select2" name="produto_composto_id">
              <option value="">Selecione</option>
              <option v-for="p in options.produtosCompostos" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group form-group-lg">
            <label class="control-label"><span>Quantidade<span class="asterisco">*</span></span></label>
            <input v-model="form.quantidade" class="form-control quantidade" name="quantidade" type="text" />
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
    </div>
  </div>

  <DataTable :rows="rows" :row-key="(r) => (r as any).id" :page="page" :total-pages="totalPages" :total-items="totalRows" @page-change="goToPage">
    <template #head>
      <tr>
        <th style="width: 55%">Produto</th>
        <th style="width: 15%">Quantidade</th>
        <th style="width: 20%">Data</th>
        <th style="width: 10%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).produto }}</td>
        <td>{{ (row as any).quantidade }}</td>
        <td>{{ (row as any).data }}</td>
        <td>
          <a href="javascript:void(0);" class="btn btn-sm btn-info" data-toggle="tooltip" title="Imprimir" @click.prevent="onImprimir((row as any).id)">
            <i class="fa fa-print"></i>
          </a>
        </td>
      </tr>
    </template>
  </DataTable>
</template>

