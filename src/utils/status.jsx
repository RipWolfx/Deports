import { createContext, useContext, useMemo, useRef, useState } from 'react'

const StatusContext = createContext(null)

export function StatusProvider({ children }) {
  const [messages, setMessages] = useState([])
  const timers = useRef(new Map())

  const add = (type, title, message) => {
    const id = 'st-' + Math.random().toString(36).slice(2)
    setMessages(m => [...m, { id, type, title, message, ts: Date.now() }])
    const t = setTimeout(() => {
      setMessages(m => m.filter(x => x.id !== id))
      timers.current.delete(id)
    }, 4000)
    timers.current.set(id, t)
  }
  const remove = (id) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setMessages(m => m.filter(x => x.id !== id))
  }

  const api = useMemo(() => ({
    success: (title, message) => add('success', title, message),
    error: (title, message) => add('error', title, message),
    info: (title, message) => add('info', title, message),
    remove,
    messages,
  }), [messages])

  return <StatusContext.Provider value={api}>{children}</StatusContext.Provider>
}

export function useStatus() {
  const ctx = useContext(StatusContext)
  if (!ctx) throw new Error('useStatus must be used within StatusProvider')
  return ctx
}

export function StatusToasts() {
  const { messages, remove } = useStatus()
  return (
    <div className="toasts">
      {messages.map(m => (
        <div key={m.id} className={`toast ${m.type === 'error' ? 'error' : ''}`} onClick={() => remove(m.id)}>
          <h5>{m.title}</h5>
          <p>{m.message}</p>
        </div>
      ))}
    </div>
  )
}