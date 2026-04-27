/**
 * LibraryPage — lists all recordings for the authenticated user.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Library, AlertCircle, RefreshCw, Layers } from 'lucide-react'
import { videoApi, type Video } from '../api/endpoints'
import { VideoCard } from '../components/VideoCard'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ToastContainer'

export function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await videoApi.list()
      setVideos(res.data.results)
    } catch (err: any) {
      setError('Failed to load recordings. Please try again.')
      addToast('Error fetching recordings', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleDelete = async (id: number) => {
    try {
      await videoApi.delete(id)
      setVideos(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      addToast('Failed to delete recording', 'error')
    }
  }

  return (
    <>
    <main style={{ flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div className="card-hover" style={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-alt))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px var(--accent-glow)',
              }}>
                <Library size={24} color="white" />
              </div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>My Library</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', paddingLeft: '3.75rem' }}>
              Managing <strong>{videos.length}</strong> cloud session{videos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            className="btn btn-ghost" 
            onClick={fetchVideos}
            disabled={loading}
            style={{ borderRadius: '12px', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} style={{ marginRight: '0.5rem' }} />
            Sync Library
          </button>
        </header>

        {loading && videos.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
            <div className="spin-slow" style={{ width: 48, height: 48, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontWeight: 500 }}>Decrypting your vault...</p>
          </div>
        ) : error ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertCircle size={32} color="#fca5a5" />
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Connection established, but...</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchVideos}>Retry Connection</button>
          </div>
        ) : videos.length === 0 ? (
          <div className="glass" style={{ padding: '6rem 2rem', textAlign: 'center', borderStyle: 'dashed', background: 'transparent', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ 
              width: 80, height: 80, background: 'rgba(255,255,255,0.02)', borderRadius: '24px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
              border: '1px solid var(--glass-border)'
            }}>
              <Layers size={40} color="var(--text-muted)" />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>No recordings found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '380px', margin: '0 auto 2.5rem' }}>
              Your cloud library is empty. Start your first high-precision recording session today.
            </p>
            <Link to="/" className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px' }}>Start Recording</Link>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}>
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onDelete={handleDelete}
                onToast={addToast}
              />
            ))}
          </div>
        )}
      </div>
    </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        .spin-slow { animation: spin 1.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
