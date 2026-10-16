const GREEN_API_HOST = /^[a-z0-9.-]+\.green-api\.com$/i

/**
 * Проксирует запрос на GREEN-API.
 * pathWithQuery: "4100.api.green-api.com/waInstance.../method/token?receiveTimeout=5"
 */
export async function forwardGreenApi({
  pathWithQuery,
  method = 'GET',
  headers = {},
  body,
}) {
  const slash = pathWithQuery.indexOf('/')
  if (slash <= 0) {
    throw Object.assign(new Error('Bad proxy path'), { statusCode: 400 })
  }

  const host = pathWithQuery.slice(0, slash)
  const rest = pathWithQuery.slice(slash + 1)

  if (!GREEN_API_HOST.test(host)) {
    throw Object.assign(new Error('Invalid GREEN-API host'), { statusCode: 400 })
  }

  const targetUrl = `https://${host}/${rest}`
  const upstreamHeaders = new Headers()

  for (const [key, value] of Object.entries(headers)) {
    if (!value) continue
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'connection' || lower === 'content-length') {
      continue
    }
    if (Array.isArray(value)) {
      for (const item of value) upstreamHeaders.append(key, item)
    } else {
      upstreamHeaders.set(key, value)
    }
  }

  const upstream = await fetch(targetUrl, {
    method,
    headers: upstreamHeaders,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
    signal: AbortSignal.timeout(70000),
  })

  const responseHeaders = {}
  upstream.headers.forEach((value, key) => {
    if (key === 'transfer-encoding' || key === 'content-encoding') return
    responseHeaders[key] = value
  })

  return {
    status: upstream.status,
    headers: responseHeaders,
    body: Buffer.from(await upstream.arrayBuffer()),
  }
}
