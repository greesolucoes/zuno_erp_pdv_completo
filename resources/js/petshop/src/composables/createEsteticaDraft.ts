import { reactive } from 'vue'

export type EsteticaStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'

export type EsteticaServico = {
  servico_id: string
  subtotal_servico: string
  tempo_execucao: string
}

export type EsteticaProduto = {
  produto_id: string
  qtd_produto: string
  valor_unitario_produto: string
  subtotal_produto: string
}

export type EsteticaFrete = {
  subtotal_servico: string
  tempo_execucao: string
  endereco_cliente: string
}

export type EsteticaDraft = {
  ordem_servico: string

  animal_id: string
  colaborador_id: string
  estado: EsteticaStatus
  descricao: string

  animal_info: string
  id_animal: string
  cliente_id: string
  nome_colaborador: string
  id_colaborador: string

  servicos: EsteticaServico[]
  produtos: EsteticaProduto[]
  frete: EsteticaFrete

  data_agendamento: string
  horario_agendamento: string
  horario_saida: string
}

export type EsteticaUpsertPayload = EsteticaDraft

const emptyDraft: EsteticaDraft = {
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
  servicos: [],
  produtos: [],
  frete: {
    subtotal_servico: '',
    tempo_execucao: '',
    endereco_cliente: '',
  },
  data_agendamento: '',
  horario_agendamento: '',
  horario_saida: '',
}

function normalizeDraft(input?: Partial<EsteticaDraft>): EsteticaDraft {
  const servicos = Array.isArray(input?.servicos) ? input!.servicos : []
  const produtos = Array.isArray(input?.produtos) ? input!.produtos : []
  const frete = (input?.frete ?? {}) as any

  return {
    ...emptyDraft,
    ...(input ?? {}),
    estado: (input?.estado ?? emptyDraft.estado) as any,
    servicos: servicos.map((s) => ({
      servico_id: String((s as any)?.servico_id ?? ''),
      subtotal_servico: String((s as any)?.subtotal_servico ?? ''),
      tempo_execucao: String((s as any)?.tempo_execucao ?? ''),
    })),
    produtos: produtos.map((p) => ({
      produto_id: String((p as any)?.produto_id ?? ''),
      qtd_produto: String((p as any)?.qtd_produto ?? ''),
      valor_unitario_produto: String((p as any)?.valor_unitario_produto ?? ''),
      subtotal_produto: String((p as any)?.subtotal_produto ?? ''),
    })),
    frete: {
      subtotal_servico: String(frete?.subtotal_servico ?? ''),
      tempo_execucao: String(frete?.tempo_execucao ?? ''),
      endereco_cliente: String(frete?.endereco_cliente ?? ''),
    },
  }
}

export function createEsteticaDraft(initial?: Partial<EsteticaDraft>) {
  const draft = reactive<EsteticaDraft>(normalizeDraft(initial))

  function reset(next?: Partial<EsteticaDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): EsteticaUpsertPayload {
    return {
      ordem_servico: String(draft.ordem_servico ?? ''),
      animal_id: String(draft.animal_id ?? ''),
      colaborador_id: String(draft.colaborador_id ?? ''),
      estado:
        draft.estado === 'em_andamento' || draft.estado === 'concluido' || draft.estado === 'cancelado' ? draft.estado : 'agendado',
      descricao: String(draft.descricao ?? ''),
      animal_info: String(draft.animal_info ?? ''),
      id_animal: String(draft.id_animal ?? ''),
      cliente_id: String(draft.cliente_id ?? ''),
      nome_colaborador: String(draft.nome_colaborador ?? ''),
      id_colaborador: String(draft.id_colaborador ?? ''),
      servicos: (draft.servicos ?? []).map((s) => ({
        servico_id: String(s.servico_id ?? ''),
        subtotal_servico: String(s.subtotal_servico ?? ''),
        tempo_execucao: String(s.tempo_execucao ?? ''),
      })),
      produtos: (draft.produtos ?? []).map((p) => ({
        produto_id: String(p.produto_id ?? ''),
        qtd_produto: String(p.qtd_produto ?? ''),
        valor_unitario_produto: String(p.valor_unitario_produto ?? ''),
        subtotal_produto: String(p.subtotal_produto ?? ''),
      })),
      frete: {
        subtotal_servico: String(draft.frete?.subtotal_servico ?? ''),
        tempo_execucao: String(draft.frete?.tempo_execucao ?? ''),
        endereco_cliente: String(draft.frete?.endereco_cliente ?? ''),
      },
      data_agendamento: String(draft.data_agendamento ?? ''),
      horario_agendamento: String(draft.horario_agendamento ?? ''),
      horario_saida: String(draft.horario_saida ?? ''),
    }
  }

  return { draft, reset, toPayload }
}

