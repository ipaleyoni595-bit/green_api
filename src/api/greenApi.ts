import type {
  Credentials,
  NotificationBody,
  ReceiveNotificationResponse,
} from '../types'

function buildUrl(
  credentials: Credentials,
  method: string,
  suffix = '',
): string {
  const host = new URL(credentials.apiUrl.replace(/\/$/, '')).host
  return `/green-api/${host}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`
}

async function request(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Сервер не ответил вовремя. Проверьте apiUrl и интернет.')
    }
    if (error instanceof TypeError) {
      throw new Error(
        'Не удалось связаться с GREEN-API. Проверьте apiUrl и соединение.',
      )
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

async function readApiError(response: Response): Promise<never> {
  let details = response.statusText

  try {
    const data = await response.json()
    details = data.message || data.error || JSON.stringify(data)
  } catch {
    try {
      details = await response.text()
    } catch {
      /* ignore */
    }
  }

  throw new Error(`GREEN-API ${response.status}: ${details}`)
}

export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) {
    throw new Error('Введите номер телефона')
  }
  return `${digits}@c.us`
}

export function extractTextMessage(body: NotificationBody): string | null {
  const data = body.messageData
  if (!data) return null

  if (data.typeMessage === 'textMessage') {
    return data.textMessageData?.textMessage ?? null
  }

  if (data.typeMessage === 'extendedTextMessage') {
    return data.extendedTextMessageData?.text ?? null
  }

  return null
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  const response = await request(
    buildUrl(credentials, 'sendMessage'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    },
    20000,
  )

  if (!response.ok) {
    await readApiError(response)
  }

  return response.json()
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 5,
): Promise<ReceiveNotificationResponse> {
  const response = await request(
    `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`,
    { method: 'GET' },
    (receiveTimeout + 10) * 1000,
  )

  if (!response.ok) {
    await readApiError(response)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as ReceiveNotificationResponse) : null
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const response = await request(
    buildUrl(credentials, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE' },
    15000,
  )

  if (!response.ok) {
    await readApiError(response)
  }
}
