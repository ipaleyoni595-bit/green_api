import { useCallback, useState } from 'react'
import { phoneToChatId, sendMessage } from './api/greenApi'
import { ChatWindow } from './components/ChatWindow'
import { LoginForm } from './components/LoginForm'
import { NewChatModal } from './components/NewChatModal'
import { Sidebar } from './components/Sidebar'
import { useNotificationPolling } from './hooks/useNotificationPolling'
import type { Chat, ChatMessage, Credentials } from './types'
import './styles.css'

const CREDENTIALS_KEY = 'green-api-credentials'

function loadCredentials(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(CREDENTIALS_KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)
  const [chats, setChats] = useState<Chat[]>([])
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >({})
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null
  const activeMessages = activeChatId ? (messagesByChat[activeChatId] ?? []) : []

  const handleLogin = (next: Credentials) => {
    sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(next))
    setCredentials(next)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(CREDENTIALS_KEY)
    setCredentials(null)
    setChats([])
    setMessagesByChat({})
    setActiveChatId(null)
    setError(null)
  }

  const upsertChat = useCallback((chat: Chat) => {
    setChats((prev) => {
      const index = prev.findIndex((item) => item.chatId === chat.chatId)
      if (index === -1) return [chat, ...prev]

      const next = [...prev]
      next[index] = { ...next[index], ...chat }
      return next
    })
  }, [])

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessagesByChat((prev) => {
      const list = prev[message.chatId] ?? []
      if (list.some((item) => item.id === message.id)) return prev

      return {
        ...prev,
        [message.chatId]: [...list, message],
      }
    })
  }, [])

  const handleIncoming = useCallback(
    (message: ChatMessage, chatMeta: Partial<Chat>) => {
      upsertChat({
        chatId: message.chatId,
        phone: chatMeta.phone || message.chatId.replace(/@c\.us$/, ''),
        name: chatMeta.name || chatMeta.phone || message.chatId,
      })
      appendMessage(message)
      setActiveChatId((current) => current ?? message.chatId)
    },
    [appendMessage, upsertChat],
  )

  useNotificationPolling({
    credentials,
    enabled: Boolean(credentials),
    onIncomingMessage: handleIncoming,
  })

  const handleCreateChat = (phone: string) => {
    try {
      const chatId = phoneToChatId(phone)
      const digits = phone.replace(/\D/g, '')
      upsertChat({ chatId, phone: digits, name: digits })
      setActiveChatId(chatId)
      setIsNewChatOpen(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать чат')
    }
  }

  const handleSend = async (text: string) => {
    if (!credentials || !activeChat) return

    setSending(true)
    setError(null)

    try {
      const { idMessage } = await sendMessage(
        credentials,
        activeChat.chatId,
        text,
      )

      appendMessage({
        id: idMessage,
        chatId: activeChat.chatId,
        text,
        timestamp: Date.now(),
        direction: 'outgoing',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  if (!credentials) {
    return <LoginForm onSubmit={handleLogin} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={() => setIsNewChatOpen(true)}
        onLogout={handleLogout}
      />
      <ChatWindow
        chat={activeChat}
        messages={activeMessages}
        sending={sending}
        error={error}
        onSend={handleSend}
      />
      <NewChatModal
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreate={handleCreateChat}
      />
    </div>
  )
}
