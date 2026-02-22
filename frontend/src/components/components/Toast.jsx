import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'
import '../styles/toast.css'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'info', timeout = 3500) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    if (timeout > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id))
      }, timeout)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__pushToastInternal = push
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.__pushToastInternal = undefined
      }
    }
  }, [push])

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider

// expose simple global push function for callers outside provider
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__pushToast', {
    configurable: true,
    enumerable: false,
    get() { return window.__pushToastInternal },
    set(v) { window.__pushToastInternal = v }
  })
}
