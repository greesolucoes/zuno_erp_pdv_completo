import { createFilaProntuario, getFilaProntuarioById, listFilaProntuarios, loadFilaProntuariosOptions, type FilaProntuario } from './fila.service'

export type ConsultaHistoricoRow = FilaProntuario

export type ConsultasHistoricoLoadOptions = Awaited<ReturnType<typeof loadFilaProntuariosOptions>>

export async function loadConsultasHistoricoOptions(): Promise<ConsultasHistoricoLoadOptions> {
  return loadFilaProntuariosOptions()
}

export function listConsultasHistorico(search?: string): ConsultaHistoricoRow[] {
  // "Passado dos que já foram atendidos" -> finalizados
  return listFilaProntuarios(search).filter((r) => r.status === 'finalizado')
}

function nextProntuarioIdFromBase(base: string) {
  const safeBase = base.trim() || 'P'
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14)
  return `${safeBase}-R${stamp}`
}

export async function reopenConsultaInFila(id: string): Promise<{ newId: string } | null> {
  const existing = await getFilaProntuarioById(id)
  if (!existing) return null

  const created = await createFilaProntuario({
    prontuario_id: nextProntuarioIdFromBase(existing.prontuario_id),
    atendimento_id: existing.atendimento_id,
    status: 'aguardando',
    paciente_id: existing.paciente_id,
    veterinario_id: existing.veterinario_id,
    tipo_atendimento: existing.tipo_atendimento,
    slot: existing.slot,
    resumo_rapido: existing.resumo_rapido,
    modelo_avaliacao_id: existing.modelo_avaliacao_id,
    avaliacao_campos: existing.avaliacao_campos ?? {},
    checklists: existing.checklists ?? {},
    anexos: [],
  })

  return { newId: created.id }
}
