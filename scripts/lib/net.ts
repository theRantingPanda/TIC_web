/**
 * Shared networking for the capture scripts.
 *
 * These scripts talk to hosts that may be blocked by an egress policy. When that
 * happens the failure should be obvious and actionable rather than a bare stack trace,
 * so `fetchText` translates connection refusals into a named-host message.
 */

const USER_AGENT = 'TIC-web-capture/1.0 (+https://www.asktic.com; site migration)'

export class EgressBlockedError extends Error {
  constructor(host: string, detail: string) {
    super(
      `Cannot reach ${host}.\n\n` +
        `  ${detail}\n\n` +
        `A 403 or 407 here is what a policy-enforcing egress proxy returns for a host ` +
        `that is not\n  allowlisted. Allowlist the host on the environment's network ` +
        `settings rather than routing\n  around it. See content/_inventory/README.md.`,
    )
    this.name = 'EgressBlockedError'
  }
}

/** 403/407 on a capture target is an egress denial, not something to retry. */
function assertNotBlocked(url: string, response: Response): void {
  if (response.status === 403 || response.status === 407) {
    throw new EgressBlockedError(
      new URL(url).host,
      `HTTP ${response.status} ${response.statusText}`,
    )
  }
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  attempts = 4,
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      const backoffMs = 2000 * 2 ** (attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers: { 'User-Agent': USER_AGENT, ...(init.headers ?? {}) },
      })

      assertNotBlocked(url, response)

      // Other 4xx are real answers, not transport problems — do not burn retries.
      if (response.status >= 400 && response.status < 500) return response
      if (response.ok) return response

      lastError = new Error(`HTTP ${response.status} ${response.statusText}`)
    } catch (error) {
      if (error instanceof EgressBlockedError) throw error
      lastError = error
    }
  }

  throw new EgressBlockedError(
    new URL(url).host,
    lastError instanceof Error ? lastError.message : String(lastError),
  )
}

async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetchWithRetry(url, init)
  if (!response.ok) {
    throw new Error(`GET ${url} -> HTTP ${response.status} ${response.statusText}`)
  }
  return response
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  return (await fetchOk(url, init)).text()
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return (await fetchOk(url, init)).json() as Promise<T>
}

/** Modest politeness delay between requests to a third-party host. */
export function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
