export type HttpError = Error & { status?: number; payload?: unknown }

function getCsrfToken(): string | null {
  try {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
    return meta?.content ?? null
  } catch {
    return null
  }
}

export async function httpJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const csrf = getCsrfToken()

  const res = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  const payload = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const err: HttpError = new Error(`HTTP ${res.status}`)
    err.status = res.status
    err.payload = payload
    throw err
  }

  return payload as T
}

