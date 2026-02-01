import { reactive } from 'vue'
import type { ContaPagarUpsertPayload } from '../services/financeiro/contasPagar.service'

export type ContaPagarDraft = ContaPagarUpsertPayload & {
  id?: string
}

const emptyDraft: ContaPagarDraft = {
  local_id: '',
  descricao: '',
  fornecedor_id: '',
  categoria_conta_id: '',
  valor_integral: '0,00',
  valor_pago: '0,00',
  data_vencimento: '',
  data_pagamento: '',
  status: '0',
  tipo_pagamento: '01',
  observacao: '',
  observacao2: '',
  observacao3: '',
}

export function createContaPagarDraft(initial?: Partial<ContaPagarDraft>) {
  const draft = reactive<ContaPagarDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<ContaPagarDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): ContaPagarUpsertPayload {
    return {
      local_id: String(draft.local_id ?? ''),
      descricao: String(draft.descricao ?? ''),
      fornecedor_id: String(draft.fornecedor_id ?? ''),
      categoria_conta_id: String(draft.categoria_conta_id ?? ''),
      valor_integral: String(draft.valor_integral ?? ''),
      valor_pago: String(draft.valor_pago ?? ''),
      data_vencimento: String(draft.data_vencimento ?? ''),
      data_pagamento: String(draft.data_pagamento ?? ''),
      status: draft.status === '1' ? '1' : '0',
      tipo_pagamento: String(draft.tipo_pagamento ?? ''),
      observacao: String(draft.observacao ?? ''),
      observacao2: String(draft.observacao2 ?? ''),
      observacao3: String(draft.observacao3 ?? ''),
    }
  }

  return { draft, reset, toPayload }
}

