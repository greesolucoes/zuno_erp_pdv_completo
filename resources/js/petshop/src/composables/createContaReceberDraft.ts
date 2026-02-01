import { reactive } from 'vue'
import type { ContaReceberUpsertPayload } from '../services/financeiro/contasReceber.service'

export type ContaReceberDraft = ContaReceberUpsertPayload & {
  id?: string
}

const emptyDraft: ContaReceberDraft = {
  local_id: '',
  descricao: '',
  cliente_id: '',
  categoria_conta_id: '',
  valor_integral: '0,00',
  valor_recebido: '0,00',
  data_vencimento: '',
  data_recebimento: '',
  status: '0',
  tipo_pagamento: '01',
  observacao: '',
  observacao2: '',
  observacao3: '',
}

export function createContaReceberDraft(initial?: Partial<ContaReceberDraft>) {
  const draft = reactive<ContaReceberDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<ContaReceberDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): ContaReceberUpsertPayload {
    return {
      local_id: String(draft.local_id ?? ''),
      descricao: String(draft.descricao ?? ''),
      cliente_id: String(draft.cliente_id ?? ''),
      categoria_conta_id: String(draft.categoria_conta_id ?? ''),
      valor_integral: String(draft.valor_integral ?? ''),
      valor_recebido: String(draft.valor_recebido ?? ''),
      data_vencimento: String(draft.data_vencimento ?? ''),
      data_recebimento: String(draft.data_recebimento ?? ''),
      status: draft.status === '1' ? '1' : '0',
      tipo_pagamento: String(draft.tipo_pagamento ?? ''),
      observacao: String(draft.observacao ?? ''),
      observacao2: String(draft.observacao2 ?? ''),
      observacao3: String(draft.observacao3 ?? ''),
    }
  }

  return { draft, reset, toPayload }
}

