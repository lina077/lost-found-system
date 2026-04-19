import { useState, useEffect } from 'react'

// Global toast state — works outside React tree
let addToastFn = null
export function showToast(message, type = 'info') {
  if (addToastFn) addToastFn({ message, type, id: Date.now() })
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    addToastFn = (toast) => {
      setToasts(prev => [...prev, toast])
      // Auto remove after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 4000)
    }
    return () => { addToastFn = null }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          background: toast.type === 'success' ? '#065f46'
                    : toast.type === 'error'   ? '#dc2626'
                    : '#1a1a2e',
          color: 'white',
          padding: '18px 32px',
          borderRadius: '16px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '420px',
          textAlign: 'center',
          animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: 'auto',
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {toast.type === 'success' ? '✅'
           : toast.type === 'error'   ? '❌'
           : '🔔'}
          </span>
          {toast.message}
        </div>
      ))}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}