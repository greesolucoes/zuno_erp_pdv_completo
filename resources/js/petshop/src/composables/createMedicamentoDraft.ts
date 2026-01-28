import { reactive } from 'vue'

export type MedicamentoStatus = 'ativo' | 'inativo'

export type MedicamentoDraft = {
  produto_id: string
  nome_comercial: string
  nome_generico: string
  classe_terapeutica: string
  classe_farmacologica: string
  classificacao_controle: string
  via_administracao: string
  apresentacao: string
  concentracao: string
  forma_dispensacao: string
  dosagem: string
  frequencia: string
  duracao: string
  restricao_idade: string
  condicao_armazenamento: string
  validade: string
  fornecedor: string
  sku: string
  especies: string[]
  indicacoes: string
  contraindicacoes: string
  efeitos_adversos: string
  interacoes: string
  monitoramento: string
  orientacoes_tutor: string
  observacoes: string
  status: MedicamentoStatus
}

export type MedicamentoUpsertPayload = MedicamentoDraft

const emptyDraft: MedicamentoDraft = {
  produto_id: '',
  nome_comercial: '',
  nome_generico: '',
  classe_terapeutica: '',
  classe_farmacologica: '',
  classificacao_controle: '',
  via_administracao: '',
  apresentacao: '',
  concentracao: '',
  forma_dispensacao: '',
  dosagem: '',
  frequencia: '',
  duracao: '',
  restricao_idade: '',
  condicao_armazenamento: '',
  validade: '',
  fornecedor: '',
  sku: '',
  especies: [],
  indicacoes: '',
  contraindicacoes: '',
  efeitos_adversos: '',
  interacoes: '',
  monitoramento: '',
  orientacoes_tutor: '',
  observacoes: '',
  status: 'ativo',
}

export function createMedicamentoDraft(initial?: Partial<MedicamentoDraft>) {
  const draft = reactive<MedicamentoDraft>({
    ...emptyDraft,
    ...(initial ?? {}),
    especies: Array.isArray(initial?.especies) ? [...initial.especies] : [],
  })

  function reset(next?: Partial<MedicamentoDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
    draft.especies = Array.isArray(next?.especies) ? [...next!.especies] : []
  }

  function toPayload(): MedicamentoUpsertPayload {
    return {
      ...draft,
      produto_id: draft.produto_id.trim(),
      nome_comercial: draft.nome_comercial.trim(),
      nome_generico: draft.nome_generico.trim(),
      classe_terapeutica: draft.classe_terapeutica.trim(),
      classe_farmacologica: draft.classe_farmacologica.trim(),
      classificacao_controle: draft.classificacao_controle.trim(),
      via_administracao: draft.via_administracao.trim(),
      apresentacao: draft.apresentacao.trim(),
      concentracao: draft.concentracao.trim(),
      forma_dispensacao: draft.forma_dispensacao.trim(),
      dosagem: draft.dosagem.trim(),
      frequencia: draft.frequencia.trim(),
      duracao: draft.duracao.trim(),
      restricao_idade: draft.restricao_idade.trim(),
      condicao_armazenamento: draft.condicao_armazenamento.trim(),
      validade: draft.validade.trim(),
      fornecedor: draft.fornecedor.trim(),
      sku: draft.sku.trim(),
      especies: [...(draft.especies ?? [])],
      indicacoes: draft.indicacoes.trim(),
      contraindicacoes: draft.contraindicacoes.trim(),
      efeitos_adversos: draft.efeitos_adversos.trim(),
      interacoes: draft.interacoes.trim(),
      monitoramento: draft.monitoramento.trim(),
      orientacoes_tutor: draft.orientacoes_tutor.trim(),
      observacoes: draft.observacoes.trim(),
      status: draft.status === 'inativo' ? 'inativo' : 'ativo',
    }
  }

  return { draft, reset, toPayload }
}

