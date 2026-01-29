<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from '../../../components/ui/DataTable.vue'
import AgendarModal from '../../../components/petshop/agenda/AgendarModal.vue'
import ConfirmDeleteModal from '../../../components/petshop/agenda/ConfirmDeleteModal.vue'
import { initLegacyUiBindings } from '../../../utils/legacyScripts'
import { deleteAgendaGeralItem, listAgendaGeralItems, type AgendaGeralItem } from '../../../services/petshop/agenda/agendaGeral.service'

type ViewMode = 'lista' | 'blocos'
type AgendarTab = 'vet' | 'estetica' | 'hotel' | 'creche'
type EditTarget = { source: AgendarTab; id: string }

function todayBr() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function addDaysBr(dateBr: string, deltaDays: number) {
  const match = String(dateBr ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const base = match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : new Date()
  base.setDate(base.getDate() + deltaDays)
  const dd = String(base.getDate()).padStart(2, '0')
  const mm = String(base.getMonth() + 1).padStart(2, '0')
  const yyyy = base.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function avatarLabel(text: string) {
  const clean = String(text ?? '').trim()
  if (!clean) return '?'
  return clean.slice(0, 1).toUpperCase()
}

function sourceLabel(source: AgendaGeralItem['source']) {
  if (source === 'vet') return 'Veterinário'
  if (source === 'estetica') return 'Estética'
  if (source === 'hotel') return 'Hotel'
  return 'Creche'
}

function sourceColorClass(source: AgendaGeralItem['source']) {
  if (source === 'vet') return 'agenda-card--vet'
  if (source === 'estetica') return 'agenda-card--estetica'
  if (source === 'hotel') return 'agenda-card--hotel'
  return 'agenda-card--creche'
}

function statusCode(statusValue: string) {
  const v = String(statusValue ?? '').trim().toLowerCase()
  if (v === 'agendado') return 'AG'
  if (v === 'em_andamento') return 'EA'
  if (v === 'hospedado') return 'HO'
  if (v === 'concluido') return 'CO'
  if (v === 'cancelado') return 'CA'
  if (v === 'finalizado') return 'FI'
  if (v === 'em_triagem') return 'TR'
  if (v === 'em_atendimento') return 'AT'
  return String(v).slice(0, 2).toUpperCase() || '?'
}

function statusCornerClass(statusValue: string) {
  const v = String(statusValue ?? '').trim().toLowerCase()
  if (v === 'agendado') return 'agenda-status-corner--agendado'
  if (v === 'em_andamento') return 'agenda-status-corner--andamento'
  if (v === 'hospedado') return 'agenda-status-corner--hospedado'
  if (v === 'concluido') return 'agenda-status-corner--concluido'
  if (v === 'cancelado') return 'agenda-status-corner--cancelado'
  if (v === 'finalizado') return 'agenda-status-corner--finalizado'
  if (v === 'em_triagem') return 'agenda-status-corner--triagem'
  if (v === 'em_atendimento') return 'agenda-status-corner--atendimento'
  return 'agenda-status-corner--default'
}

const viewMode = ref<ViewMode>('blocos')
const dataReferencia = ref(todayBr())
const busca = ref('')
const isAgendarOpen = ref(false)
const agendarEditTarget = ref<EditTarget | null>(null)

const route = useRoute()
const router = useRouter()
const defaultAgendarTab = computed<AgendarTab | undefined>(() => {
  const value = String(route.query.tab ?? '')
  if (value === 'vet' || value === 'estetica' || value === 'hotel' || value === 'creche') return value
  return undefined
})

const loading = ref(false)
const items = ref<AgendaGeralItem[]>([])
const deletingKey = ref<string | null>(null)
const deleteModalOpen = ref(false)
const deleteTarget = ref<AgendaGeralItem | null>(null)

async function refresh() {
  loading.value = true
  try {
    items.value = await listAgendaGeralItems({ data: dataReferencia.value, busca: busca.value })
  } finally {
    loading.value = false
    await nextTick()
    initLegacyUiBindings()
  }
}

function previousDay() {
  dataReferencia.value = addDaysBr(dataReferencia.value, -1)
}

function nextDay() {
  dataReferencia.value = addDaysBr(dataReferencia.value, 1)
}

watch([dataReferencia, busca], refresh, { immediate: true })

function openAgendar() {
  agendarEditTarget.value = null
  isAgendarOpen.value = true
}

function openEditar(item: AgendaGeralItem) {
  agendarEditTarget.value = { source: item.source as AgendarTab, id: String(item.sourceId) }
  isAgendarOpen.value = true
}

function askRemoveAgendamento(item: AgendaGeralItem) {
  if (deletingKey.value) return
  deleteTarget.value = item
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (deletingKey.value) return
  deleteModalOpen.value = false
  deleteTarget.value = null
}

async function confirmRemoveAgendamento() {
  const item = deleteTarget.value
  if (!item || deletingKey.value) return
  deletingKey.value = item.id
  try {
    await deleteAgendaGeralItem(item.source, item.sourceId)
    await refresh()
  } finally {
    deletingKey.value = null
    deleteModalOpen.value = false
    deleteTarget.value = null
  }
}

function closeAgendar() {
  isAgendarOpen.value = false
  agendarEditTarget.value = null
  if (route.query.agendar || route.query.tab) {
    const query = { ...route.query } as Record<string, any>
    delete query.agendar
    delete query.tab
    router.replace({ query })
  }
}

watch(
  () => route.query.agendar,
  (v) => {
    if (String(v) === '1') openAgendar()
  },
  { immediate: true },
)

onMounted(() => {
  initLegacyUiBindings()
})

const listRows = computed(() => {
  return items.value.map((i) => ({
    id: i.id,
    horario: [i.horaInicio, i.horaFim].filter(Boolean).join(' - ') || '-',
    pet: i.petNome,
    tutor: i.tutorNome,
    modulo: sourceLabel(i.source),
    local: i.local,
    status: i.status.label,
    link: i.links[0] ?? null,
  }))
})
</script>

<template>
  <div id="erroAssinatura" class="alert-danger alert" style="display: none">
    <span class="icone"></span><a class="close" href="javascript:void(0);"></a>
  </div>

  <h2>Agenda Geral</h2>

  <div id="pnlComandos" class="navbar navbar-nfse">
    <div class="navbar-collapse" id="searchbar" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end">
      <div style="display: flex; align-items: flex-end; gap: 10px">
        <button type="button" class="btn btn-lg btn-default" data-toggle="tooltip" title="Dia anterior" @click.prevent="previousDay">
          <i class="fa fa-chevron-left"></i>
        </button>

        <div class="form-group form-group-lg" style="margin: 0">
          <label class="control-label">Data referente</label>
          <div class="input-group input-group-lg">
            <input v-model="dataReferencia" class="form-control data" name="dataReferencia" type="text" />
            <span class="input-group-btn">
              <button class="btn btn-lg btn-default btnCalendario" data-original-title="Abrir calendário" data-toggle="tooltip" type="button">
                <div class="btn-calendario"></div>
              </button>
            </span>
          </div>
        </div>

        <button type="button" class="btn btn-lg btn-default" data-toggle="tooltip" title="Próximo dia" @click.prevent="nextDay">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>

      <form class="navbar-form" method="get" style="margin: 0; flex: 1; min-width: 260px" @submit.prevent>
        <div class="form-group" style="display: inline; width: 100%">
          <div class="input-group input-group-lg" style="display: table; width: 100%">
            <input v-model="busca" class="form-control" name="busca" placeholder="Pesquisar pet ou tutor" type="text" />
            <span class="input-group-btn" style="width: 1%">
              <button id="btnPesquisarAgenda" class="btn btn-default" type="submit" data-toggle="tooltip" title="Pesquisar">
                <img src="/img/btn-pesquisar-esq.svg" />
              </button>
            </span>
          </div>
        </div>
      </form>

      <div style="display: flex; align-items: flex-end">
        <button type="button" class="btn btn-lg btn-info" @click.prevent="openAgendar">
          <img src="/img/btn-novo.svg" />
          <span>Agendar</span>
        </button>
      </div>
    </div>
  </div>

  <AgendarModal
    :open="isAgendarOpen"
    :prefill-date="dataReferencia"
    :default-tab="defaultAgendarTab"
    :edit-target="agendarEditTarget"
    @close="closeAgendar"
    @scheduled="refresh"
  />

  <ConfirmDeleteModal
    :open="deleteModalOpen"
    title="Remover agendamento"
    message="Tem certeza que deseja remover este agendamento?"
    :details="deleteTarget ? `${deleteTarget.petNome} • ${deleteTarget.local}` : ''"
    confirm-label="Remover"
    cancel-label="Voltar"
    :loading="Boolean(deletingKey)"
    @cancel="closeDeleteModal"
    @confirm="confirmRemoveAgendamento"
  />

  <ul class="nav nav-tabs" style="margin-bottom: 15px">
    <li :class="viewMode === 'lista' ? 'active' : ''">
      <a href="javascript:void(0);" @click.prevent="viewMode = 'lista'">Grade em lista</a>
    </li>
    <li :class="viewMode === 'blocos' ? 'active' : ''">
      <a href="javascript:void(0);" @click.prevent="viewMode = 'blocos'">Grade em blocos</a>
    </li>
  </ul>

  <div v-if="viewMode === 'lista'">
    <DataTable :rows="listRows" :loading="loading" :show-pagination="false" empty-text="Nenhum agendamento para a data selecionada">
      <template #head>
        <tr>
          <th style="width: 12%">Horário</th>
          <th style="width: 16%">Pet</th>
          <th style="width: 16%">Tutor</th>
          <th style="width: 14%">Módulo</th>
          <th style="width: 28%">Local</th>
          <th style="width: 14%">Status</th>
          <th style="width: 10%"></th>
        </tr>
      </template>

      <template #row="{ row }">
        <tr :data-id="(row as any).id">
          <td>{{ (row as any).horario }}</td>
          <td class="td-texto-grande">{{ (row as any).pet }}</td>
          <td>{{ (row as any).tutor }}</td>
          <td>{{ (row as any).modulo }}</td>
          <td>{{ (row as any).local }}</td>
          <td>
            <span class="label label-info">{{ (row as any).status }}</span>
          </td>
          <td class="td-opcoes" style="text-align: right">
            <RouterLink v-if="(row as any).link" class="btn btn-default" :to="(row as any).link.to">{{ (row as any).link.label }}</RouterLink>
          </td>
        </tr>
      </template>
    </DataTable>
    <span class="sem-registros">Nenhum registro encontrado</span>
  </div>

  <div v-else class="agenda-grid">
    <div v-if="loading" class="pnlCollapse semi-aberto">
      <h2>Carregando...</h2>
      <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
    </div>

    <div v-else-if="!items.length" class="pnlCollapse semi-aberto">
      <h2>Sem agendamentos</h2>
      <div class="retratil" style="padding: 10px 20px">Nenhum agendamento para a data selecionada.</div>
    </div>

    <div v-else class="agenda-grid-inner">
      <div v-for="item in items" :key="item.id" class="agenda-card-wrap">
        <button
          type="button"
          class="agenda-card-delete"
          :title="deletingKey === item.id ? 'Removendo...' : 'Remover agendamento'"
          :disabled="deletingKey === item.id"
          @click.stop.prevent="askRemoveAgendamento(item)"
        >
          <i v-if="deletingKey !== item.id" class="fa fa-times"></i>
          <i v-else class="fa fa-spinner fa-spin"></i>
        </button>

        <div
          class="agenda-card"
          :class="sourceColorClass(item.source)"
          role="button"
          tabindex="0"
          @click.prevent="openEditar(item)"
          @keydown.enter.prevent="openEditar(item)"
          @keydown.space.prevent="openEditar(item)"
        >
          <div class="agenda-status-corner" :class="statusCornerClass(item.status.value)" :title="item.status.label">
            <span>{{ statusCode(item.status.value) }}</span>
          </div>

          <div class="agenda-card-header">
            <div class="agenda-avatar">{{ avatarLabel(item.petNome) }}</div>
            <div style="min-width: 0">
              <div class="agenda-title">{{ item.petNome }}</div>
              <div class="agenda-subtitle">{{ item.tutorNome }}</div>
            </div>
          </div>

          <div class="agenda-meta">
            <b>{{ sourceLabel(item.source) }}</b>
            <span v-if="item.ordemServico"> • {{ item.ordemServico }}</span>
          </div>

          <div class="agenda-meta">{{ item.local }}</div>

          <div class="agenda-meta">
            <span class="label label-info">{{ item.status.label }}</span>
            <span style="margin-left: 8px"
              >{{ item.data }} <span v-if="item.horaInicio">• {{ item.horaInicio }}</span
              ><span v-if="item.horaFim"> - {{ item.horaFim }}</span></span
            >
          </div>

          <div v-if="item.descricao" class="agenda-desc">{{ item.descricao }}</div>

          <div class="agenda-actions">
            <RouterLink v-for="l in item.links.slice(0, 1)" :key="l.to" class="btn btn-lg btn-primary direita btn-block" :to="l.to" @click.stop>
              <span>{{ l.label }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agenda-grid-inner {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 14px;
}

@media (max-width: 1100px) {
  .agenda-grid-inner {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 740px) {
  .agenda-grid-inner {
    grid-template-columns: 1fr;
  }
}

.agenda-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-left-width: 6px;
  position: relative;
  padding: 12px 12px 10px;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    border-color 140ms ease;
}

.agenda-card-wrap {
  position: relative;
}

.agenda-card-delete {
  position: absolute;
  top: 10px;
  left: -18px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.98);
  color: #d9534f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  z-index: 4;
}

.agenda-card-wrap:hover .agenda-card-delete,
.agenda-card-wrap:focus-within .agenda-card-delete {
  opacity: 1;
  transform: translateY(0);
}

.agenda-card-delete:disabled {
  opacity: 1;
  transform: translateY(0);
  color: #999;
}

.agenda-card-delete:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.agenda-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  border-color: #d6d6d6;
}

.agenda-card:hover .agenda-avatar {
  background: #eeeeee;
}

.agenda-status-corner {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 0;
  height: 0;
  border-top: 58px solid #999;
  border-left: 58px solid transparent;
  pointer-events: none;
}

.agenda-status-corner span {
  position: absolute;
  top: -47px;
  right: 8px;
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.4px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
}

.agenda-status-corner--agendado {
  border-top-color: #5bc0de;
}
.agenda-status-corner--andamento,
.agenda-status-corner--atendimento {
  border-top-color: #337ab7;
}
.agenda-status-corner--triagem {
  border-top-color: #f0ad4e;
}
.agenda-status-corner--hospedado {
  border-top-color: #5cb85c;
}
.agenda-status-corner--concluido,
.agenda-status-corner--finalizado {
  border-top-color: #5cb85c;
}
.agenda-status-corner--cancelado {
  border-top-color: #d9534f;
}
.agenda-status-corner--default {
  border-top-color: #777;
}

.agenda-card--vet {
  border-left-color: #5cb85c;
}
.agenda-card--estetica {
  border-left-color: #5bc0de;
}
.agenda-card--hotel {
  border-left-color: #337ab7;
}
.agenda-card--creche {
  border-left-color: #f0ad4e;
}

.agenda-card-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.agenda-avatar {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #555;
  flex: 0 0 auto;
}

.agenda-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-subtitle {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-meta {
  margin-top: 8px;
  color: #444;
}

.agenda-desc {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  color: #555;
  min-height: 38px;
}

.agenda-actions {
  margin-top: 12px;
}

.btn-block {
  display: block;
  width: 100%;
}
</style>
