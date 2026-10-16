import { useState } from 'react'
import type { FormEvent } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (phone: string) => void
}

export function NewChatModal({ open, onClose, onCreate }: Props) {
  const [phone, setPhone] = useState('')

  if (!open) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onCreate(phone.trim())
    setPhone('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>Новый чат</h2>
        <p>Номер в международном формате, например 79991234567</p>

        <label className="field">
          <span>Телефон</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="79991234567"
            required
            autoFocus
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn-primary">
            Создать
          </button>
        </div>
      </form>
    </div>
  )
}
