import { reactive } from 'vue'

export type ReservaCrecheStatus = 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado'

export type ReservaCrecheServicoExtra = {
  servico_id: string
  servico_categoria: string
  tempo_execucao: string
  servico_data: string
  servico_hora: string
  servico_valor: string
}

export type ReservaCrecheProduto = {
  produto_id: string
  qtd_produto: string
  valor_unitario_produto: string
  subtotal_produto: string
}

export type ReservaCrecheFrete = {
  servico_id: string
  servico_categoria: string
  tempo_execucao: string
  subtotal_servico: string
  endereco_cliente: string
}

export type ReservaCrecheDraft = {
  ordem_servico: string

  animal_id: string
  colaborador_id: string
  estado: ReservaCrecheStatus
  descricao: string

  animal_info: string
  id_animal: string
  cliente_id: string
  nome_colaborador: string
  id_colaborador: string

  data_entrada: string
  horario_entrada: string
  data_saida: string
  horario_saida: string

  turma_id: string
  nome_turma: string
  id_turma: string

  servico_principal_id: string
  servico_principal_valor: string

  servicos_extras: ReservaCrecheServicoExtra[]
  produtos: ReservaCrecheProduto[]
  frete: ReservaCrecheFrete
}

export type ReservaCrecheUpsertPayload = ReservaCrecheDraft

const emptyDraft: ReservaCrecheDraft = {
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
  data_entrada: '',
  horario_entrada: '',
  data_saida: '',
  horario_saida: '',
  turma_id: '',
  nome_turma: '',
  id_turma: '',
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

function normalizeDraft(input?: Partial<ReservaCrecheDraft>): ReservaCrecheDraft {
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

export function createReservaCrecheDraft(initial?: Partial<ReservaCrecheDraft>) {
  const draft = reactive<ReservaCrecheDraft>(normalizeDraft(initial))

  function reset(next?: Partial<ReservaCrecheDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): ReservaCrecheUpsertPayload {
    return {
      ordem_servico: String(draft.ordem_servico ?? ''),
      animal_id: String(draft.animal_id ?? ''),
      colaborador_id: String(draft.colaborador_id ?? ''),
      estado:
        draft.estado === 'finalizado' || draft.estado === 'cancelado' || draft.estado === 'em_andamento' ? draft.estado : 'agendado',
      descricao: String(draft.descricao ?? ''),
      animal_info: String(draft.animal_info ?? ''),
      id_animal: String(draft.id_animal ?? ''),
      cliente_id: String(draft.cliente_id ?? ''),
      nome_colaborador: String(draft.nome_colaborador ?? ''),
      id_colaborador: String(draft.id_colaborador ?? ''),
      data_entrada: String(draft.data_entrada ?? ''),
      horario_entrada: String(draft.horario_entrada ?? ''),
      data_saida: String(draft.data_saida ?? ''),
      horario_saida: String(draft.horario_saida ?? ''),
      turma_id: String(draft.turma_id ?? ''),
      nome_turma: String(draft.nome_turma ?? ''),
      id_turma: String(draft.id_turma ?? ''),
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

