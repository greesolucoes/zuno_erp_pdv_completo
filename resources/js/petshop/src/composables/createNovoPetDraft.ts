import { reactive } from 'vue'

export type PetDraft = {
  nome: string
  sexo: '' | 'M' | 'F' | 'I'
  cliente_id: '' | string

  especie_id: '' | string
  raca_id: '' | string

  pelagem_id: '' | string
  cor: string

  peso: string
  porte: '' | 'P' | 'M' | 'G' | 'OUTRO'
  porte_outro: string

  origem_tipo: '' | 'NASCIMENTO' | 'ADOCAO' | 'RESGATE' | 'NAO_INFORMADO'
  origem_detalhe: string
  origem: string

  data_nascimento_pet: string
  chip: string

  tem_pedigree: '' | 'S' | 'N'
  pedigree: string

  observacao: string
}

export type PetUpsertPayload = PetDraft

const emptyDraft: PetDraft = {
  nome: '',
  sexo: '',
  cliente_id: '',

  especie_id: '',
  raca_id: '',

  pelagem_id: '',
  cor: '',

  peso: '',
  porte: '',
  porte_outro: '',

  origem_tipo: '',
  origem_detalhe: '',
  origem: '',

  data_nascimento_pet: '',
  chip: '',

  tem_pedigree: '',
  pedigree: '',

  observacao: '',
}

export function createNovoPetDraft(initial?: Partial<PetDraft>) {
  const draft = reactive<PetDraft>({ ...emptyDraft, ...(initial ?? {}) })

  function reset(next?: Partial<PetDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
  }

  function toPayload(): PetUpsertPayload {
    return { ...draft }
  }

  return { draft, reset, toPayload }
}

