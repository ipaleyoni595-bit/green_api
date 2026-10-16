export function forwardGreenApi(params: {
  pathWithQuery: string
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: Buffer | Uint8Array | string
}): Promise<{
  status: number
  headers: Record<string, string>
  body: Buffer
}>
