import type { Chat } from '../types'

type Props = {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onLogout: () => void
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Чаты</div>
        <button type="button" className="btn-ghost" onClick={onNewChat}>
          + Новый
        </button>
      </div>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            Нет чатов. Создайте новый по номеру телефона.
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.chatId}
              type="button"
              className={
                activeChatId === chat.chatId
                  ? 'chat-list-item active'
                  : 'chat-list-item'
              }
              onClick={() => onSelectChat(chat.chatId)}
            >
              <div className="avatar">
                {chat.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="chat-list-meta">
                <div className="chat-list-name">{chat.name}</div>
                <div className="chat-list-phone">{chat.phone}</div>
              </div>
            </button>
          ))
        )}
      </div>

      <button type="button" className="btn-logout" onClick={onLogout}>
        Выйти
      </button>
    </aside>
  )
}
