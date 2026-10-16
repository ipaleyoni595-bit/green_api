import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Chat, ChatMessage } from '../types'

type Props = {
  chat: Chat | null
  messages: ChatMessage[]
  sending: boolean
  error: string | null
  onSend: (text: string) => Promise<void>
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChatWindow({ chat, messages, sending, error, onSend }: Props) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chat?.chatId])

  if (!chat) {
    return (
      <section className="chat-window empty">
        <div className="empty-state">
          <h2>Выберите чат</h2>
          <p>Или создайте новый по номеру телефона</p>
        </div>
      </section>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending) return

    setText('')
    await onSend(value)
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <div className="avatar">{chat.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="chat-header-name">{chat.name}</div>
          <div className="chat-header-phone">{chat.phone}</div>
        </div>
      </header>

      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.direction === 'outgoing' ? 'bubble out' : 'bubble in'
            }
          >
            <div className="bubble-text">{message.text}</div>
            <div className="bubble-time">{formatTime(message.timestamp)}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение"
          disabled={sending}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={sending || !text.trim()}
        >
          {sending ? '...' : 'Отправить'}
        </button>
      </form>
    </section>
  )
}
