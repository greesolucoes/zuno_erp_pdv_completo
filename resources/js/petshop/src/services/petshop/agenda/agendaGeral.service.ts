import { deleteEstetica, listEstetica, loadEsteticaOptions } from '../estetica/estetica.service'
import { deleteReservaHotel, listReservasHotel, loadReservasHotelOptions } from '../hotel/reservas.service'
import { deleteReservaCreche, listReservasCreche, loadReservasCrecheOptions } from '../creche/reservas.service'
import { deleteAtendimento, listAtendimentos, loadAtendimentosOptions } from '../vet/atendimentos/atendimentos.service'

export type AgendaSource = 'vet' | 'estetica' | 'hotel' | 'creche'
export type AgendaViewLink = { to: string; label: string }

export type AgendaGeralItem = {
  id: string
  source: AgendaSource
  sourceId: string
  ordemServico?: string

  petNome: string
  tutorNome: string

  data: string
  horaInicio: string
  horaFim?: string

  local: string
  descricao?: string

  status: { value: string; label: string }
  links: AgendaViewLink[]
}

export type AgendaGeralFilters = {
  data: string
  busca?: string
}

export async function deleteAgendaGeralItem(source: AgendaSource, sourceId: string): Promise<boolean> {
  const id = String(sourceId ?? '').trim()
  if (!id) return false
  if (source === 'vet') return deleteAtendimento(id)
  if (source === 'estetica') return deleteEstetica(id)
  if (source === 'hotel') return deleteReservaHotel(id)
  return deleteReservaCreche(id)
}

function parseBrDateToKey(dateBr: string): number {
  const raw = String(dateBr ?? '').trim()
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return 0
  const dd = Number.parseInt(match[1] ?? '0', 10)
  const mm = Number.parseInt(match[2] ?? '0', 10)
  const yyyy = Number.parseInt(match[3] ?? '0', 10)
  if (!dd || !mm || !yyyy) return 0
  return yyyy * 10000 + mm * 100 + dd
}

function withinRange(dateKey: number, startBr: string, endBr?: string): boolean {
  const startKey = parseBrDateToKey(startBr)
  const endKey = parseBrDateToKey(endBr || startBr)
  if (!dateKey || !startKey || !endKey) return false
  return dateKey >= startKey && dateKey <= endKey
}

function normalizeSearch(input: string) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

function matchesSearch(item: Pick<AgendaGeralItem, 'petNome' | 'tutorNome' | 'ordemServico' | 'local' | 'descricao'>, search: string) {
  const q = normalizeSearch(search)
  if (!q) return true
  const haystack = normalizeSearch(
    [item.petNome, item.tutorNome, item.ordemServico ?? '', item.local, item.descricao ?? ''].filter(Boolean).join(' '),
  )
  return haystack.includes(q)
}

export async function listAgendaGeralItems(filters: AgendaGeralFilters): Promise<AgendaGeralItem[]> {
  const dateKey = parseBrDateToKey(filters.data)
  const [esteticaOptions, hotelOptions, crecheOptions, vetOptions] = await Promise.all([
    loadEsteticaOptions(),
    loadReservasHotelOptions(),
    loadReservasCrecheOptions(),
    loadAtendimentosOptions(),
  ])

  const items: AgendaGeralItem[] = []

  for (const e of listEstetica()) {
    if (!withinRange(dateKey, e.data_agendamento)) continue
    const pet = esteticaOptions.pets.find((p) => p.id === e.animal_id)
    const col = esteticaOptions.colaboradores.find((c) => c.id === e.colaborador_id)
    const servico = (e.servicos?.[0]?.servico_id && esteticaOptions.servicos.find((s) => s.id === e.servicos?.[0]?.servico_id)?.label) || 'Serviço'
    const statusLabel = esteticaOptions.estados.find((s) => s.value === e.estado)?.label ?? e.estado
    items.push({
      id: `estetica-${e.id}`,
      source: 'estetica',
      sourceId: e.id,
      ordemServico: e.ordem_servico,
      petNome: pet?.label ?? e.animal_id,
      tutorNome: pet?.cliente_nome ?? e.cliente_id ?? '-',
      data: e.data_agendamento,
      horaInicio: e.horario_agendamento || '',
      horaFim: e.horario_saida || '',
      local: `Estética • ${servico}${col?.label ? ` • ${col.label}` : ''}`,
      descricao: e.descricao,
      status: { value: e.estado, label: statusLabel },
      links: [
        { to: `/Petshop/Estetica/Gerenciar/${e.id}`, label: 'Ver ficha' },
        { to: `/Petshop/Estetica/Gerenciar/${e.id}/Editar`, label: 'Editar' },
      ],
    })
  }

  for (const r of listReservasHotel()) {
    if (!withinRange(dateKey, r.checkin, r.checkout)) continue
    const pet = hotelOptions.pets.find((p) => p.id === r.animal_id)
    const quarto = hotelOptions.quartos.find((q) => q.id === r.quarto_id)
    const statusLabel = hotelOptions.estados.find((s) => s.value === r.estado)?.label ?? r.estado
    items.push({
      id: `hotel-${r.id}`,
      source: 'hotel',
      sourceId: r.id,
      ordemServico: r.ordem_servico,
      petNome: pet?.label ?? r.animal_id,
      tutorNome: pet?.cliente_nome ?? r.cliente_id ?? '-',
      data: r.checkin,
      horaInicio: r.timecheckin || '',
      horaFim: r.timecheckout || '',
      local: `Hotel • ${quarto?.label ?? r.quarto_id}`,
      descricao: r.descricao,
      status: { value: r.estado, label: statusLabel },
      links: [
        { to: `/Petshop/Hotel/Reservas/${r.id}`, label: 'Ver ficha' },
        { to: `/Petshop/Hotel/Reservas/${r.id}/Editar`, label: 'Editar' },
      ],
    })
  }

  for (const r of listReservasCreche()) {
    if (!withinRange(dateKey, r.data_entrada, r.data_saida)) continue
    const pet = crecheOptions.pets.find((p) => p.id === r.animal_id)
    const turma = crecheOptions.turmas.find((t) => t.id === r.turma_id)
    const statusLabel = crecheOptions.estados.find((s) => s.value === r.estado)?.label ?? r.estado
    items.push({
      id: `creche-${r.id}`,
      source: 'creche',
      sourceId: r.id,
      ordemServico: r.ordem_servico,
      petNome: pet?.label ?? r.animal_id,
      tutorNome: pet?.cliente_nome ?? r.cliente_id ?? '-',
      data: r.data_entrada,
      horaInicio: r.horario_entrada || '',
      horaFim: r.horario_saida || '',
      local: `Creche • ${turma?.label ?? r.turma_id}`,
      descricao: r.descricao,
      status: { value: r.estado, label: statusLabel },
      links: [
        { to: `/Petshop/Creche/Reservas/${r.id}`, label: 'Ver ficha' },
        { to: `/Petshop/Creche/Reservas/${r.id}/Editar`, label: 'Editar' },
      ],
    })
  }

  for (const a of listAtendimentos()) {
    if (!withinRange(dateKey, a.data_atendimento)) continue
    const paciente = vetOptions.pacientes.find((p) => p.id === a.paciente_id)
    const vet = vetOptions.veterinarios.find((v) => v.id === a.veterinario_id)
    const sala = vetOptions.salas.find((s) => s.id === a.sala_id)
    const servico = vetOptions.servicos.find((s) => s.id === a.servico_id)
    const statusLabel = vetOptions.status.find((s) => s.value === a.status)?.label ?? a.status
    items.push({
      id: `vet-${a.id}`,
      source: 'vet',
      sourceId: a.id,
      ordemServico: undefined,
      petNome: paciente?.label ?? a.paciente_id,
      tutorNome: paciente?.tutor_nome ?? a.tutor_nome ?? '-',
      data: a.data_atendimento,
      horaInicio: a.horario || '',
      local: `Vet • ${servico?.label ?? a.servico_id}${sala?.label ? ` • ${sala.label}` : ''}${vet?.label ? ` • ${vet.label}` : ''}`,
      descricao: a.motivo_visita,
      status: { value: a.status, label: statusLabel },
      links: [
        { to: `/Petshop/Vet/Atendimentos/${a.id}`, label: 'Ver ficha' },
        { to: `/Petshop/Vet/Atendimentos/${a.id}/Editar`, label: 'Editar' },
      ],
    })
  }

  const filtered = items.filter((i) => matchesSearch(i, filters.busca ?? ''))
  return filtered.sort((a, b) => {
    if (a.data !== b.data) return parseBrDateToKey(a.data) - parseBrDateToKey(b.data)
    return String(a.horaInicio ?? '').localeCompare(String(b.horaInicio ?? ''))
  })
}
