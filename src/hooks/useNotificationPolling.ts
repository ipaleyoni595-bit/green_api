import { useEffect, useRef } from 'react'
import {
  deleteNotification,
  extractTextMessage,
  receiveNotification,
} from '../api/greenApi'
import type { Chat, ChatMessage, Credentials } from '../types'

type Params = {
  credentials: Credentials | null
  enabled: boolean
  onIncomingMessage: (message: ChatMessage, chatMeta: Partial<Chat>) => void
}

export function useNotificationPolling({
  credentials,
  enabled,
  onIncomingMessage,
}: Params) {
  const onIncomingRef = useRef(onIncomingMessage)

  useEffect(() => {
    onIncomingRef.current = onIncomingMessage
  }, [onIncomingMessage])

  useEffect(() => {
    if (!credentials || !enabled) return

    let cancelled = false

    const poll = async () => {
      while (!cancelled) {
        try {
          const notification = await receiveNotification(credentials, 5)
          if (cancelled || !notification) continue

          const { receiptId, body } = notification

          try {
            if (body.typeWebhook !== 'incomingMessageReceived') continue

            const text = extractTextMessage(body)
            const chatId = body.senderData?.chatId
            if (!text || !chatId) continue

            onIncomingRef.current(
              {
                id: body.idMessage || String(receiptId),
                chatId,
                text,
                timestamp: (body.timestamp || Date.now() / 1000) * 1000,
                direction: 'incoming',
              },
              {
                chatId,
                name:
                  body.senderData?.senderName ||
                  body.senderData?.chatName ||
                  chatId,
                phone: chatId.replace(/@c\.us$/, ''),
              },
            )
          } finally {
            await deleteNotification(credentials, receiptId)
          }
        } catch (error) {
          if (cancelled) break
          console.error('Polling error:', error)
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
    }
  }, [credentials, enabled])
}
