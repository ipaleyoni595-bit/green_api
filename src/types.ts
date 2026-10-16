export type Credentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type Chat = {
  chatId: string
  phone: string
  name: string
}

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'outgoing' | 'incoming'
}

export type NotificationBody = {
  typeWebhook?: string
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    sender?: string
    senderName?: string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
    extendedTextMessageData?: {
      text?: string
    }
  }
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null
