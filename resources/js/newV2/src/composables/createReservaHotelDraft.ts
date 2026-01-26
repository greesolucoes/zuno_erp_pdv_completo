import { reactive } from 'vue'

export type ReservaHotelStatus = 'agendado' | 'hospedado' | 'finalizado' | 'cancelado'

export type ReservaServicoExtra = {
  servico_id: string
  servico_categoria: string
  tempo_execucao: string
  servico_data: string
  servico_hora: string
  servico_valor: string
}

export type ReservaProduto = {
  produto_id: string
  qtd_produto: string
  valor_unitario_produto: string
  subtotal_produto: string
}

export type ReservaFrete = {
  servico_id: string
  servico_categoria: string
  tempo_execucao: string
  subtotal_servico: string
  endereco_cliente: string
}

export type ReservaHotelDraft = {
  ordem_servico: string

  animal_id: string
  colaborador_id: string
  estado: ReservaHotelStatus
  descricao: string

  animal_info: string
  id_animal: string
  cliente_id: string
  nome_colaborador: string
  id_colaborador: string

  checkin: string
  timecheckin: string
  checkout: string
  timecheckout: string

  quarto_id: string
  nome_quarto: string
  id_quarto: string

  servico_principal_id: string
  servico_principal_valor: string

  servicos_extras: ReservaServicoExtra[]
  produtos: ReservaProduto[]
  frete: ReservaFrete
}

export type ReservaHotelUpsertPayload = ReservaHotelDraft

const emptyDraft: ReservaHotelDraft = {
  ordem_servico: '',
  animal_id: '',
  colaborador_id: '',
  estado: 'agendado',
  descricao: '',
  animal_info: '',
  id_animal: '',
  cliente_id: '',
  nome_colaborador: '',
  id_colaborador: '',
  checkin: '',
  timecheckin: '',
  checkout: '',
  timecheckout: '',
  quarto_id: '',
  nome_quarto: '',
  id_quarto: '',
  servico_principal_id: '',
  servico_principal_valor: '',
  servicos_extras: [],
  produtos: [],
  frete: {
    servico_id: '',
    servico_categoria: 'frete',
    tempo_execucao: '',
    subtotal_servico: '',
    endereco_cliente: '',
  },
}

function normalizeDraft(input?: Partial<ReservaHotelDraft>): ReservaHotelDraft {
  const servicos_extras = Array.isArray(input?.servicos_extras) ? input!.servicos_extras : []
  const produtos = Array.isArray(input?.produtos) ? input!.produtos : []
  const frete = (input?.frete ?? {}) as any

  return {
    ...emptyDraft,
    ...(input ?? {}),
    estado: (input?.estado ?? emptyDraft.estado) as any,
    servicos_extras: servicos_extras.map((s) => ({
      servico_id: String((s as any)?.servico_id ?? ''),
      servico_categoria: String((s as any)?.servico_categoria ?? ''),
      tempo_execucao: String((s as any)?.tempo_execucao ?? ''),
      servico_data: String((s as any)?.servico_data ?? ''),
      servico_hora: String((s as any)?.servico_hora ?? ''),
      servico_valor: String((s as any)?.servico_valor ?? ''),
    })),
    produtos: produtos.map((p) => ({
      produto_id: String((p as any)?.produto_id ?? ''),
      qtd_produto: String((p as any)?.qtd_produto ?? ''),
      valor_unitario_produto: String((p as any)?.valor_unitario_produto ?? ''),
      subtotal_produto: String((p as any)?.subtotal_produto ?? ''),
    })),
    frete: {
      servico_id: String(frete?.servico_id ?? ''),
      servico_categoria: String(frete?.servico_categoria ?? 'frete'),
      tempo_execucao: String(frete?.tempo_execucao ?? ''),
      subtotal_servico: String(frete?.subtotal_servico ?? ''),
      endereco_cliente: String(frete?.endereco_cliente ?? ''),
    },
  }
}

export function createReservaHotelDraft(initial?: Partial<ReservaHotelDraft>) {
  const draft = reactive<ReservaHotelDraft>(normalizeDraft(initial))

  function reset(next?: Partial<ReservaHotelDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): ReservaHotelUpsertPayload {
    return {
      ordem_servico: String(draft.ordem_servico ?? ''),
      animal_id: String(draft.animal_id ?? ''),
      colaborador_id: String(draft.colaborador_id ?? ''),
      estado:
        draft.estado === 'finalizado' || draft.estado === 'cancelado' || draft.estado === 'hospedado' ? draft.estado : 'agendado',
      descricao: String(draft.descricao ?? ''),
      animal_info: String(draft.animal_info ?? ''),
      id_animal: String(draft.id_animal ?? ''),
      cliente_id: String(draft.cliente_id ?? ''),
      nome_colaborador: String(draft.nome_colaborador ?? ''),
      id_colaborador: String(draft.id_colaborador ?? ''),
      checkin: String(draft.checkin ?? ''),
      timecheckin: String(draft.timecheckin ?? ''),
      checkout: String(draft.checkout ?? ''),
      timecheckout: String(draft.timecheckout ?? ''),
      quarto_id: String(draft.quarto_id ?? ''),
      nome_quarto: String(draft.nome_quarto ?? ''),
      id_quarto: String(draft.id_quarto ?? ''),
      servico_principal_id: String(draft.servico_principal_id ?? ''),
      servico_principal_valor: String(draft.servico_principal_valor ?? ''),
      servicos_extras: (draft.servicos_extras ?? []).map((s) => ({
        servico_id: String(s.servico_id ?? ''),
        servico_categoria: String(s.servico_categoria ?? ''),
        tempo_execucao: String(s.tempo_execucao ?? ''),
        servico_data: String(s.servico_data ?? ''),
        servico_hora: String(s.servico_hora ?? ''),
        servico_valor: String(s.servico_valor ?? ''),
      })),
      produtos: (draft.produtos ?? []).map((p) => ({
        produto_id: String(p.produto_id ?? ''),
        qtd_produto: String(p.qtd_produto ?? ''),
        valor_unitario_produto: String(p.valor_unitario_produto ?? ''),
        subtotal_produto: String(p.subtotal_produto ?? ''),
      })),
      frete: {
        servico_id: String(draft.frete?.servico_id ?? ''),
        servico_categoria: String(draft.frete?.servico_categoria ?? 'frete'),
        tempo_execucao: String(draft.frete?.tempo_execucao ?? ''),
        subtotal_servico: String(draft.frete?.subtotal_servico ?? ''),
        endereco_cliente: String(draft.frete?.endereco_cliente ?? ''),
      },
    }
  }

  return { draft, reset, toPayload }
}

