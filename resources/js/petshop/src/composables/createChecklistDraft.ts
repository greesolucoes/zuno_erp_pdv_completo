import { reactive } from 'vue'

export type ChecklistStatus = 'ativo' | 'inativo'
export type ChecklistTipo = 'pre_atendimento' | 'internacao' | 'cirurgia' | 'banho_tosa'

export type ChecklistItemDraft = {
  texto: string
}

export type ChecklistDraft = {
  titulo: string
  tipo: ChecklistTipo | ''
  status: ChecklistStatus
  descricao: string
  itens: ChecklistItemDraft[]
}

export type ChecklistUpsertPayload = ChecklistDraft

const emptyDraft: ChecklistDraft = {
  titulo: '',
  tipo: '',
  status: 'ativo',
  descricao: '',
  itens: [{ texto: '' }],
}

export function createChecklistDraft(initial?: Partial<ChecklistDraft>) {
  const draft = reactive<ChecklistDraft>({
    ...emptyDraft,
    ...(initial ?? {}),
    itens: Array.isArray(initial?.itens) ? initial!.itens.map((i) => ({ texto: String(i?.texto ?? '') })) : [{ texto: '' }],
  })

  function reset(next?: Partial<ChecklistDraft>) {
    Object.assign(draft, emptyDraft, next ?? {})
    draft.itens = Array.isArray(next?.itens) ? next!.itens.map((i) => ({ texto: String(i?.texto ?? '') })) : [{ texto: '' }]
  }

  function toPayload(): ChecklistUpsertPayload {
    const itens = (draft.itens ?? [])
      .map((i) => ({ texto: (i?.texto ?? '').trim() }))
      .filter((i) => i.texto.length > 0)

    return {
      ...draft,
      titulo: draft.titulo.trim(),
      descricao: draft.descricao.trim(),
      status: draft.status === 'inativo' ? 'inativo' : 'ativo',
      tipo: (draft.tipo || '') as any,
      itens,
    }
  }

  return { draft, reset, toPayload }
}

