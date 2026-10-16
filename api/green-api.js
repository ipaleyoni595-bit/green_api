import { forwardGreenApi } from '../server/forwardGreenApi.js'

export default async function handler(req, res) {
  try {
    let pathParam = req.query.path
    if (Array.isArray(pathParam)) {
      pathParam = pathParam.join('/')
    }

    if (!pathParam || typeof pathParam !== 'string') {
      res.statusCode = 400
      res.end('Missing path')
      return
    }

    const url = new URL(req.url, 'http://localhost')
    url.searchParams.delete('path')
    const search = url.searchParams.toString()
    const pathWithQuery = `${pathParam}${search ? `?${search}` : ''}`

    const method = req.method || 'GET'
    const body =
      method === 'GET' || method === 'HEAD' ? undefined : await readBody(req)

    const result = await forwardGreenApi({
      pathWithQuery,
      method,
      headers: req.headers,
      body,
    })

    res.statusCode = result.status
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value)
    }
    res.end(result.body)
  } catch (error) {
    console.error('[api/green-api]', error)
    res.statusCode = error?.statusCode || 502
    res.end(error instanceof Error ? error.message : 'Proxy failed')
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
