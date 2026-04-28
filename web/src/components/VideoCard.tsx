/**
 * VideoCard — displays a single recording in the library.
 * Shows thumbnail placeholder, title, duration, size, and delete action.
 */

import { useState } from 'react'
import { Trash2, Download, Play, Clock, HardDrive, Layers, Share2 } from 'lucide-react'
import type { Video } from '../api/endpoints'
import { CustomVideoPlayer } from './CustomVideoPlayer'

interface Props {
  video: Video
  onDelete: (id: string | number) => void
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

function fmtBytes(b: number): string {
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function VideoCard({ video, onDelete, onToast }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const [showPreviewInCard, setShowPreviewInCard] = useState(false) // Toggle for card hover
  const [deleting, setDeleting]       = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${sanitizeUrl(video.file_url)}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this recording: ${video.title}`,
          url: shareUrl,
        })
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        onToast('Video link copied to clipboard!', 'success')
      } catch (err) {
        onToast('Failed to copy link', 'error')
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${video.title}"?`)) return
    setDeleting(true)
    try {
      onDelete(video.id)
      onToast('Recording deleted.', 'info')
    } catch {
      onToast('Failed to delete recording.', 'error')
      setDeleting(false)
    }
  }

  const sanitizeUrl = (url: string) => {
    if (!url) return ''
    // Strip backend host so the URL becomes relative (e.g. /uploads/file.webm)
    // Works in dev (Vite proxy) and production (Netlify proxy → Render)
    const hosts = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://screencast-backend-957x.onrender.com',  // Render backend
    ]
    for (const host of hosts) {
      if (url.startsWith(host)) return url.slice(host.length)
    }
    return url
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href  = sanitizeUrl(video.file_url)
    // Ensure clean filename: remove special chars and add extension
    const cleanTitle = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.download = `${cleanTitle}.webm`
    a.target = '_blank'
    a.click()
  }

  return (
    <>
      <div className="glass card-hover" style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {/* Video Thumbnail / Preview */}
        <div
          onClick={() => setShowPreview(true)}
          style={{
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid var(--glass-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {video.thumbnail_url ? (
            <img 
              src={sanitizeUrl(video.thumbnail_url)} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #1e1e1e, #2a2a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={40} color="var(--glass-border)" />
            </div>
          )}

          <video
            src={sanitizeUrl(video.file_url)}
            style={{ 
              width: '100%', height: '100%', objectFit: 'cover', 
              position: 'absolute', inset: 0,
              opacity: showPreviewInCard ? 1 : 0, 
              transition: 'opacity 0.3s ease'
            }}
            onMouseOver={e => {
              setShowPreviewInCard(true)
              const playPromise = e.currentTarget.play()
              if (playPromise !== undefined) {
                playPromise.catch(() => { /* Silence */ })
              }
            }}
            onMouseOut={e => { 
                setShowPreviewInCard(false)
                e.currentTarget.pause()
                e.currentTarget.currentTime = 0 
            }}
            muted
            playsInline
          />
          
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
            transition: 'background 0.3s ease',
          }} className="thumbnail-overlay">
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <Play size={18} color="white" fill="white" style={{ marginLeft: 2 }} />
            </div>
          </div>
          
          {/* Duration badge */}
          <div style={{
            position: 'absolute', bottom: '0.6rem', right: '0.6rem',
            background: 'rgba(0,0,0,0.75)', borderRadius: '6px',
            padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#fff',
            fontFamily: 'SF Mono, monospace', fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {fmtDuration(video.duration)}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '0 0.25rem' }}>
          <h3 style={{
            marginBottom: '0.3rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text-primary)',
          }}>
            {video.title}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={11} /> {fmtDate(video.created_at)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <HardDrive size={11} /> {fmtBytes(video.file_size)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem' }}>
          <button
            className="btn btn-ghost"
            onClick={handleShare}
            style={{ flex: 1, height: '32px', fontSize: '0.75rem', padding: '0 0.4rem', borderRadius: '10px' }}
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-ghost"
            style={{ flex: 1, height: '32px', fontSize: '0.75rem', padding: '0 0.4rem', borderRadius: '10px' }}
          >
            <Download size={13} /> Download
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-ghost"
            disabled={deleting}
            style={{ height: '32px', padding: '0 0.6rem', borderRadius: '10px', color: 'var(--rec-red)', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Inline video preview modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div
            className="modal glass"
            style={{ maxWidth: '800px', padding: '1.5rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{video.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded on {fmtDuration(video.duration)}</span>
              </div>
              <div className="flex gap-2">
                <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={handleShare}
                    title="Share Video"
                >
                    <Share2 size={18} />
                </button>
                <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={handleDelete}
                    style={{ color: 'var(--rec-red)', border: 'none' }}
                >
                    <Trash2 size={18} />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowPreview(false)} style={{ border: 'none' }}>✕</button>
              </div>
            </div>
            <div style={{ width: '100%', height: 'auto' }}>
              <CustomVideoPlayer
                src={video.file_url}
                title={video.title}
                onDownload={handleDownload}
                autoPlay
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
