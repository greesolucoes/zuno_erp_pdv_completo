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

async function parseJsonSafely(resp: Response): Promise<unknown> {
  const contentType = resp.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await resp.text().catch(() => '')
    return text ? { message: text } : null
  }
  return await resp.json().catch(() => null)
}

async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: JsonValue): Promise<T> {
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

  if (!resp.ok) {
    const payload = await parseJsonSafely(resp)
    const message =
      (payload as any)?.message ??
      (typeof payload === 'string' ? payload : null) ??
      `Erro HTTP ${resp.status}`
    const err: ApiError = { status: resp.status, message, details: payload }
    throw err
  }

  return (await parseJsonSafely(resp)) as T
}

export function apiGet<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
  const qs = params ? toQuery(params) : ''
  return request<T>('GET', `${path}${qs}`)
}

export function apiPost<T>(path: string, body: JsonValue): Promise<T> {
  return request<T>('POST', path, body)
}

export function apiPut<T>(path: string, body: JsonValue): Promise<T> {
  return request<T>('PUT', path, body)
}
