import { reactive } from 'vue'
import type { ServicoUpsertPayload } from '../services/servicos/servicos.service'

export type ServicoDraft = Omit<ServicoUpsertPayload, 'image'> & {
  id?: string
}

const emptyDraft: ServicoDraft = {
  nome: '',
  valor: '0,00',
  tempo_servico: '',
  comissao: '0,00',
  unidade_cobranca: 'UND',
  categoria_id: '',
  tempo_adicional: '',
  valor_adicional: '0,00',
  tempo_tolerancia: '',
  codigo_servico: '',
  codigo_tributacao_municipio: '',
  status: '1',
  reserva: '0',
  padrao_reserva_nfse: '0',
  marketplace: '0',
  destaque_marketplace: '0',
  descricao: '',
  aliquota_iss: '0,00',
  aliquota_pis: '0,00',
  aliquota_cofins: '0,00',
  aliquota_inss: '0,00',
  aliquota_ir: '0,00',
  aliquota_csll: '0,00',
  valor_deducoes: '0,00',
  desconto_incondicional: '0,00',
  desconto_condicional: '0,00',
  outras_retencoes: '0,00',
  codigo_cnae: '',
  estado_local_prestacao_servico: '',
  natureza_operacao: '',
}

export function createServicoDraft(initial?: Partial<ServicoDraft>) {
  const draft = reactive<ServicoDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<ServicoDraft>) {
    Object.assign(draft, { ...emptyDraft, ...(next ?? {}) })
  }

  function toPayload(): ServicoUpsertPayload {
    return {
      nome: String(draft.nome ?? '').trim(),
      valor: String(draft.valor ?? ''),
      tempo_servico: String(draft.tempo_servico ?? ''),
      comissao: String(draft.comissao ?? ''),
      unidade_cobranca: String(draft.unidade_cobranca ?? 'UND'),
      categoria_id: String(draft.categoria_id ?? ''),
      tempo_adicional: String(draft.tempo_adicional ?? ''),
      valor_adicional: String(draft.valor_adicional ?? ''),
      tempo_tolerancia: String(draft.tempo_tolerancia ?? ''),
      codigo_servico: String(draft.codigo_servico ?? ''),
      codigo_tributacao_municipio: String(draft.codigo_tributacao_municipio ?? ''),
      status: draft.status === '0' ? '0' : '1',
      reserva: draft.reserva === '1' ? '1' : '0',
      padrao_reserva_nfse: draft.padrao_reserva_nfse === '1' ? '1' : '0',
      marketplace: draft.marketplace === '1' ? '1' : '0',
      destaque_marketplace: draft.destaque_marketplace === '1' ? '1' : '0',
      descricao: String(draft.descricao ?? ''),
      aliquota_iss: String(draft.aliquota_iss ?? ''),
      aliquota_pis: String(draft.aliquota_pis ?? ''),
      aliquota_cofins: String(draft.aliquota_cofins ?? ''),
      aliquota_inss: String(draft.aliquota_inss ?? ''),
      aliquota_ir: String(draft.aliquota_ir ?? ''),
      aliquota_csll: String(draft.aliquota_csll ?? ''),
      valor_deducoes: String(draft.valor_deducoes ?? ''),
      desconto_incondicional: String(draft.desconto_incondicional ?? ''),
      desconto_condicional: String(draft.desconto_condicional ?? ''),
      outras_retencoes: String(draft.outras_retencoes ?? ''),
      codigo_cnae: String(draft.codigo_cnae ?? ''),
      estado_local_prestacao_servico: String(draft.estado_local_prestacao_servico ?? ''),
      natureza_operacao: String(draft.natureza_operacao ?? ''),
    }
  }

  return { draft, reset, toPayload }
}
