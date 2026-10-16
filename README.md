# GREEN-API Chat

Веб-чат на React для отправки и получения текстовых сообщений через [GREEN-API](https://green-api.com/).

## Стек

- React + TypeScript
- Vite
- GREEN-API: `SendMessage`, `ReceiveNotification`, `DeleteNotification`

## Возможности

- вход по `idInstance`, `apiTokenInstance`, `apiUrl`
- чат по номеру телефона
- отправка и приём текстовых сообщений

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно `http://127.0.0.1:5173`).

```bash
npm run build
npm run preview
```

## Настройка инстанса

1. Создайте и авторизуйте инстанс в [консоли GREEN-API](https://console.green-api.com/)
2. Оставьте webhook URL пустым
3. Включите уведомления о входящих сообщениях
4. Скопируйте `idInstance`, `apiTokenInstance`, `apiUrl`

## Использование

1. Войдите с данными инстанса
2. Создайте чат по номеру, например `79991234567`
3. Отправьте сообщение
4. Ответ из мессенджера появится в интерфейсе автоматически

Номер — в международном формате с кодом страны `7`, без `+` и без ведущей `8`.

## Структура

```text
src/
  api/greenApi.ts          # клиент GREEN-API
  components/              # UI
  hooks/useNotificationPolling.ts
  App.tsx
server/forwardGreenApi.js  # общий proxy (Vite + Vercel)
api/green-api.js           # Vercel serverless proxy
```

Запросы к GREEN-API идут через same-origin proxy, чтобы обойти CORS.
