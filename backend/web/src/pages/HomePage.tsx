/**
 * HomePage — Landing + Recorder page.
 *
 * Unauthenticated users see a hero section.
 * Authenticated users jump straight to the recorder panel.
 */

import { Link } from 'react-router-dom'
import { Monitor, Upload, Library, ArrowRight, Zap } from 'lucide-react'
import { RecorderPanel } from '../components/RecorderPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ToastContainer'

const FEATURES = [
  { icon: <Monitor size={24} />, title: 'Advanced Capture', desc: 'Zero-latency HD recording with smart system audio routing.' },
  { icon: <Zap      size={24} />, title: 'AI Smart Summary', desc: 'Automatically generate concise summaries and meeting notes from your videos.' },
  { icon: <Upload   size={24} />, title: 'Intelligent Vault', desc: 'Deep-searchable cloud library with AI-powered file organization.' },
  { icon: <Library  size={24} />, title: 'Quick Insights', desc: 'Get automated action items and transcription for every session.' },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  if (isAuthenticated) {
    return (
      <>
        <main style={{ flex: 1, padding: '2rem 0' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ marginBottom: '0.5rem' }}>New Recording</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Choose your settings below, then hit <strong>Start Recording</strong> to begin.
              </p>
            </div>
            <RecorderPanel
              onToast={addToast}
              onUploaded={() => {}}
            />
          </div>
        </main>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <main style={{ flex: 1 }}>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{ padding: '5rem 0 4rem', textAlign: 'center' }}>
          <div className="container">
            {/* Pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(0, 210, 255, 0.12)', border: '1px solid rgba(0, 210, 255, 0.3)',
              borderRadius: '999px', padding: '0.35rem 1rem',
              fontSize: '0.8rem', color: 'var(--accent)',
              marginBottom: '1.5rem',
            }}>
              <Zap size={13} fill="currentColor" />
              Professional Screen Capture
            </div>

            <h1 style={{ marginBottom: '1.25rem', maxWidth: 800, margin: '0 auto 1.25rem', fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1 }}>
              Record Screen with{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-alt))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Ultra-Precision
              </span>
            </h1>

            <p style={{
              fontSize: '1.25rem', color: 'var(--text-secondary)',
              maxWidth: 620, margin: '0 auto 2.5rem', lineHeight: 1.7,
            }}>
              A clean, high-performance screen recorder that keeps your privacy intact. Capture, manage, and share your recordings with ease.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* ── Feature grid ──────────────────────────────────────────────── */}
        <section style={{ padding: '3rem 0 5rem' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="glass" style={{ padding: '1.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem', color: 'var(--accent-light)',
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
