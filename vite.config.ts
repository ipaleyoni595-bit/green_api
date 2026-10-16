import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import { forwardGreenApi } from './server/forwardGreenApi.js'

function greenApiProxy(): Plugin {
  const middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    void (async () => {
      const url = req.url ?? ''
      if (!url.startsWith('/green-api/')) {
        next()
        return
      }

      try {
        const pathWithQuery = url.slice('/green-api/'.length)
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }

        const result = await forwardGreenApi({
          pathWithQuery,
          method: req.method,
          headers: req.headers as Record<string, string | string[] | undefined>,
          body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
        })

        res.statusCode = result.status
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, value)
        }
        res.end(result.body)
      } catch (error) {
        console.error('[green-api-proxy]', error)
        const statusCode =
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          typeof error.statusCode === 'number'
            ? error.statusCode
            : 502
        res.statusCode = statusCode
        res.end(error instanceof Error ? error.message : 'Proxy failed')
      }
    })()
  }

  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), greenApiProxy()],
})
