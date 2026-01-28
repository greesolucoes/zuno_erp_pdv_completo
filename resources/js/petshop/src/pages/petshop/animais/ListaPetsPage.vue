<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../components/ui/DataTable.vue'
import { listPets, loadPetsOptions, type Pet, type PetsLoadOptions } from '../../../services/petshop/animais/pets.service'

const router = useRouter()
const route = useRoute()

const busca = ref((route.query.busca as string) ?? '')
const options = ref<PetsLoadOptions | null>(null)
const loading = ref(false)
const pets = ref<Pet[]>([])
const totalPages = ref(1)
const totalRows = ref(0)

const page = computed(() => {
  const raw = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  const parsed = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

type PetRow = {
  id: string
  nome: string
  sexo: 'M' | 'F'
  especie: string
  raca: string
  pelagem: string
  tutor: string
}

function findLabel(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id
}

const rows = computed<PetRow[]>(() => {
  const loadedOptions = options.value
  const loadedPets = pets.value

  return loadedPets.map((p) => {
    const especie = loadedOptions ? findLabel(loadedOptions.especies, p.especie_id) : p.especie_id
    const racas = loadedOptions ? loadedOptions.racasByEspecie[p.especie_id] ?? [] : []
    const raca = loadedOptions ? findLabel(racas, p.raca_id) : p.raca_id
    const pelagem = loadedOptions ? findLabel(loadedOptions.pelagens, p.pelagem_id) : p.pelagem_id

    return {
      id: p.id,
      nome: p.nome,
      sexo: p.sexo === 'F' ? 'F' : 'M',
      especie,
      raca,
      pelagem,
      tutor: p.tutor,
    }
  })
})

async function fetchData() {
  loading.value = true
  try {
    const [loadedOptions, list] = await Promise.all([loadPetsOptions(), listPets({ busca: busca.value, page: page.value })])
    options.value = loadedOptions
    pets.value = list.data
    totalPages.value = list.meta.last_page
    totalRows.value = list.meta.total
  } finally {
    loading.value = false
  }
}

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(1, targetPage), totalPages.value || 1)
  router.push({ name: 'petshop-lista-pets', query: { ...route.query, page: safePage === 1 ? undefined : String(safePage) } })
}

function onSubmit() {
  router.push({
    name: 'petshop-lista-pets',
    query: {
      ...route.query,
      busca: busca.value || undefined,
      page: undefined,
    },
  })
}

function onRecarregar() {
  router.push({ name: 'petshop-lista-pets', query: { ...route.query, page: undefined } })
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

  <h2>Pets</h2>

  <div id="pnlIdentificacao" class="pnlCollapse">
    <div class="retratil">
      <div class="bd-callout bd-callout-info">
        Lista de pets cadastrados no petshop. Use o campo de pesquisa para localizar por nome, tutor, espécie ou raça.
      </div>
    </div>
  </div>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar">
      <ul class="nav navbar-nav">
        <li>
          <RouterLink id="btnNovoPet" to="/Petshop/Pets/Novo" class="btn btn-lg btn-primary">
            <img src="/img/btn-novo.svg" /><span>Novo pet</span>
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
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar por nome ou tutor" type="text" />
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
        <th style="width: 20%">Nome</th>
        <th style="width: 10%">Sexo</th>
        <th style="width: 15%">Espécie</th>
        <th style="width: 15%">Raça</th>
        <th style="width: 15%">Pelagem</th>
        <th style="width: 20%">Tutor</th>
        <th style="width: 5%"></th>
      </tr>
    </template>

    <template #row="{ row }">
      <tr :data-id="(row as any).id">
        <td class="td-texto-grande">{{ (row as any).nome }}</td>
        <td class="td-center">{{ (row as any).sexo }}</td>
        <td>{{ (row as any).especie }}</td>
        <td>{{ (row as any).raca }}</td>
        <td>{{ (row as any).pelagem }}</td>
        <td>{{ (row as any).tutor }}</td>
        <td class="td-opcoes">
          <div class="menu-suspenso-tabela">
            <a class="icone-trigger" href="javascript:void(0);">
              <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="list-group menu-content" style="display: none">
              <RouterLink :to="`/Petshop/Pets/${(row as any).id}`" class="list-group-item">
                <img src="/img/op-visualizar.svg" />Visualizar
              </RouterLink>
              <RouterLink :to="`/Petshop/Pets/${(row as any).id}/Editar`" class="list-group-item">
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
