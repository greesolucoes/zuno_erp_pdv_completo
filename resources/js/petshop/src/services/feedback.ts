import { reactive } from 'vue'

export type FeedbackType = 'success' | 'error' | 'info'

export type FeedbackItem = {
  id: string
  type: FeedbackType
  message: string
  title?: string
  createdAt: number
}

type FeedbackState = {
  items: FeedbackItem[]
}

const state = reactive<FeedbackState>({
  items: [],
})

function createId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

function remove(id: string): void {
  const idx = state.items.findIndex((x) => x.id === id)
  if (idx >= 0) state.items.splice(idx, 1)
}

function push(type: FeedbackType, message: string, opts?: { title?: string; timeoutMs?: number | null }): string {
  const id = createId()
  state.items.push({
    id,
    type,
    message,
    title: opts?.title,
    createdAt: Date.now(),
  })

  const timeoutMs = opts?.timeoutMs ?? (type === 'error' ? 9000 : 4500)
  if (timeoutMs && timeoutMs > 0) {
    window.setTimeout(() => remove(id), timeoutMs)
  }

  return id
}

export const feedback = {
  state,
  push,
  remove,
  success(message: string, opts?: { title?: string; timeoutMs?: number | null }): string {
    return push('success', message, opts)
  },
  error(message: string, opts?: { title?: string; timeoutMs?: number | null }): string {
    return push('error', message, opts)
  },
  info(message: string, opts?: { title?: string; timeoutMs?: number | null }): string {
    return push('info', message, opts)
  },
  clear(): void {
    state.items.splice(0, state.items.length)
  },
}

export function useFeedbackStore(): FeedbackState {
  return state
}

