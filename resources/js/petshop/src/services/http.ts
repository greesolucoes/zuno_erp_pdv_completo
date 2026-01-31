import { feedback } from './feedback'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

declare global {
  interface Window {
    __ERP_BOOTSTRAP__?: {
      csrf_token?: string
      api?: {
        basePath?: string
      }
    }
  }
}

function resolveApiBasePath(): string {
  return window.__ERP_BOOTSTRAP__?.api?.basePath ?? '/v2/api'
}

function resolveCsrfToken(): string | null {
  const fromBootstrap = window.__ERP_BOOTSTRAP__?.csrf_token
  if (fromBootstrap) return fromBootstrap
  const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
  return meta?.content ?? null
}

function toQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    searchParams.set(key, String(value))
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

export type ApiRequestOptions = {
  suppressSuccessFeedback?: boolean
  suppressErrorFeedback?: boolean
  successMessage?: string
}

async function parseJsonSafely(resp: Response): Promise<unknown> {
  const contentType = resp.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await resp.text().catch(() => '')
    return text ? { message: text } : null
  }
  return await resp.json().catch(() => null)
}

function extractFirstValidationError(details: unknown): string | null {
  const errors = (details as any)?.errors
  if (!errors || typeof errors !== 'object') return null

  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key]
    if (Array.isArray(value) && value[0]) return String(value[0])
    if (typeof value === 'string' && value) return value
  }

  return null
}

function toUserMessage(err: ApiError): string {
  if (err.status === 401) return 'Sessão expirada. Faça login novamente.'
  if (err.status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (err.status === 429) return 'Muitas requisições. Tente novamente em instantes.'
  if (err.status === 422) return extractFirstValidationError(err.details) ?? err.message
  return err.message
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: JsonValue,
  options?: ApiRequestOptions,
): Promise<T> {
  const url = `${resolveApiBasePath()}${path.startsWith('/') ? path : `/${path}`}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }

  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json'
    const csrf = resolveCsrfToken()
    if (csrf) headers['X-CSRF-TOKEN'] = csrf
  }

  const resp = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await parseJsonSafely(resp)

  if (!resp.ok) {
    const message =
      (payload as any)?.message ??
      (typeof payload === 'string' ? payload : null) ??
      `Erro HTTP ${resp.status}`
    const err: ApiError = { status: resp.status, message, details: payload }
    if (!options?.suppressErrorFeedback) {
      feedback.error(toUserMessage(err))
    }
    throw err
  }

  const shouldShowSuccess = method !== 'GET' && !options?.suppressSuccessFeedback
  if (shouldShowSuccess) {
    const message = options?.successMessage ?? ((payload as any)?.message as string | undefined) ?? 'Operação realizada com sucesso.'
    feedback.success(message)
  }

  return payload as T
}

export function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
  options?: ApiRequestOptions,
): Promise<T> {
  const qs = params ? toQuery(params) : ''
  return request<T>('GET', `${path}${qs}`, undefined, options)
}

export function apiPost<T>(path: string, body: JsonValue, options?: ApiRequestOptions): Promise<T> {
  return request<T>('POST', path, body, options)
}

export function apiPut<T>(path: string, body: JsonValue, options?: ApiRequestOptions): Promise<T> {
  return request<T>('PUT', path, body, options)
}

export function apiDelete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>('DELETE', path, undefined, options)
}
