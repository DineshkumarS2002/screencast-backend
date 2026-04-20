import React from 'react'
import { X } from 'lucide-react'
import type { Toast } from '../hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      pointerEvents: 'none'
    }}>
      {toasts.map((t) => (
        <div key={t.id} className={`glass overflow-hidden`} style={{
          padding: '1rem 1.25rem',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          pointerEvents: 'auto',
          animation: 'slideIn 0.3s ease-out forwards',
          borderLeft: `4px solid ${
            t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : 'var(--accent)'
          }`
        }}>
          <span style={{ fontSize: '0.9rem' }}>{t.message}</span>
          <button 
            onClick={() => onRemove(t.id)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', padding: '0.2rem'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
