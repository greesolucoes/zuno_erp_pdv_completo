import { reactive } from 'vue'

export type AtendimentoStatus = 'em_triagem' | 'em_atendimento' | 'finalizado'

export type AtendimentoTriagem = {
  peso: string
  temperatura: string
  frequencia_cardiaca: string
  frequencia_respiratoria: string
  observacoes_triagem: string
  checklists: Record<string, string[]>
}

export type AtendimentoDraft = {
  paciente_id: string
  veterinario_id: string
  servico_id: string
  sala_id: string

  tutor_id: string
  tutor_nome: string
  contato_tutor: string
  email_tutor: string

  data_atendimento: string
  horario: string
  motivo_visita: string
  quick_attachments: string[]

  triagem: AtendimentoTriagem

  status: AtendimentoStatus
}

export type AtendimentoUpsertPayload = AtendimentoDraft

const emptyDraft: AtendimentoDraft = {
  paciente_id: '',
  veterinario_id: '',
  servico_id: '',
  sala_id: '',
  tutor_id: '',
  tutor_nome: '',
  contato_tutor: '',
  email_tutor: '',
  data_atendimento: '',
  horario: '',
  motivo_visita: '',
  quick_attachments: [],
  triagem: {
    peso: '',
    temperatura: '',
    frequencia_cardiaca: '',
    frequencia_respiratoria: '',
    observacoes_triagem: '',
    checklists: {},
  },
  status: 'em_triagem',
}

function normalizeDraft(input?: Partial<AtendimentoDraft>): AtendimentoDraft {
  const triagem = input?.triagem ?? ({} as any)
  return {
    ...emptyDraft,
    ...(input ?? {}),
    quick_attachments: Array.isArray(input?.quick_attachments) ? (input!.quick_attachments as any).map(String) : [],
    triagem: {
      ...emptyDraft.triagem,
      ...(triagem ?? {}),
      checklists: typeof triagem?.checklists === 'object' && triagem?.checklists ? (triagem.checklists as any) : {},
    },
    status: (input?.status ?? emptyDraft.status) as any,
  }
}

export function createAtendimentoDraft(initial?: Partial<AtendimentoDraft>) {
  const draft = reactive<AtendimentoDraft>(normalizeDraft(initial))

  function reset(next?: Partial<AtendimentoDraft>) {
    Object.assign(draft, normalizeDraft(next))
  }

  function toPayload(): AtendimentoUpsertPayload {
    return {
      paciente_id: String(draft.paciente_id ?? ''),
      veterinario_id: String(draft.veterinario_id ?? ''),
      servico_id: String(draft.servico_id ?? ''),
      sala_id: String(draft.sala_id ?? ''),
      tutor_id: String(draft.tutor_id ?? ''),
      tutor_nome: String(draft.tutor_nome ?? ''),
      contato_tutor: String(draft.contato_tutor ?? ''),
      email_tutor: String(draft.email_tutor ?? ''),
      data_atendimento: String(draft.data_atendimento ?? ''),
      horario: String(draft.horario ?? ''),
      motivo_visita: String(draft.motivo_visita ?? ''),
      quick_attachments: (draft.quick_attachments ?? []).map(String),
      triagem: {
        peso: String(draft.triagem?.peso ?? ''),
        temperatura: String(draft.triagem?.temperatura ?? ''),
        frequencia_cardiaca: String(draft.triagem?.frequencia_cardiaca ?? ''),
        frequencia_respiratoria: String(draft.triagem?.frequencia_respiratoria ?? ''),
        observacoes_triagem: String(draft.triagem?.observacoes_triagem ?? ''),
        checklists: draft.triagem?.checklists ?? {},
      },
      status: draft.status === 'finalizado' ? 'finalizado' : draft.status === 'em_atendimento' ? 'em_atendimento' : 'em_triagem',
    }
  }

  return { draft, reset, toPayload }
}

