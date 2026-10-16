import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Credentials } from '../types'

type Props = {
  onSubmit: (credentials: Credentials) => void
}

function suggestApiUrl(idInstance: string): string {
  const digits = idInstance.replace(/\D/g, '')
  if (digits.length < 4) return ''
  return `https://${digits.slice(0, 4)}.api.green-api.com`
}

export function LoginForm({ onSubmit }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [apiUrlTouched, setApiUrlTouched] = useState(false)

  const handleIdChange = (value: string) => {
    setIdInstance(value)
    if (!apiUrlTouched) {
      setApiUrl(suggestApiUrl(value))
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const trimmedId = idInstance.trim()
    const trimmedUrl = (apiUrl.trim() || suggestApiUrl(trimmedId)).replace(
      /\/$/,
      '',
    )

    if (!trimmedUrl) return

    onSubmit({
      idInstance: trimmedId,
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: trimmedUrl,
    })
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-brand">GREEN-API Chat</h1>
        <p className="login-subtitle">
          Введите данные инстанса из личного кабинета GREEN-API
        </p>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => handleIdChange(e.target.value)}
            placeholder="410022766652"
            required
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="apiTokenInstance"
            required
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>apiUrl</span>
          <input
            value={apiUrl}
            onChange={(e) => {
              setApiUrlTouched(true)
              setApiUrl(e.target.value)
            }}
            placeholder="https://4100.api.green-api.com"
            required
            autoComplete="off"
          />
        </label>

        <button type="submit" className="btn-primary">
          Войти
        </button>
      </form>
    </div>
  )
}
