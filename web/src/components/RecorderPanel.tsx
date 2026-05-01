/**
 * RecorderPanel — the main recording control center.
 * Shows status badge, timer, control buttons, settings, and progress bar.
 */

import { useState } from 'react'
import {
  Square, Pause, Play, Download, Upload,
  Mic, MicOff, Camera, CameraOff, Monitor, RotateCcw,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { useRecorder, type RecorderOptions } from '../hooks/useRecorder'
import { videoApi } from '../api/endpoints'
import { WebcamOverlay } from './WebcamOverlay'
import { CustomVideoPlayer } from './CustomVideoPlayer'

interface Props {
  onUploaded?: () => void
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

/** Format seconds → MM:SS */
function fmt(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/** Human-readable file size */
function fmtBytes(b: number): string {
  if (b < 1024)         return `${b} B`
  if (b < 1048576)      return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

export function RecorderPanel({ onUploaded, onToast }: Props) {
  const rec = useRecorder()

  // Options state
  const [opts, setOpts] = useState<RecorderOptions>({
    includeMic:     true,
    includeWebcam:  false, // Strictly off by default
    videoQuality:   'medium',
  })
  const [showOpts, setShowOpts]   = useState(false)
  const [title, setTitle]         = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)

  // ─── Derived state ─────────────────────────────────────────────────────────
  const isIdle      = rec.state === 'idle'
  const isRecording = rec.state === 'recording'
  const isPaused    = rec.state === 'paused'
  const isStopped   = rec.state === 'stopped'

  const statusConfig = {
    idle:      { text: 'Ready',     cls: 'badge-idle'   },
    recording: { text: 'REC',       cls: 'badge-rec'    },
    paused:    { text: 'Paused',    cls: 'badge-pause'  },
    stopped:   { text: 'Recorded',  cls: 'badge-done'   },
  }
  const status = statusConfig[rec.state]

  const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()
  const isWebSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
  const isSupported = isWebSupported || isNative
  const isMobile = !isWebSupported && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = async (useCameraOnly = false) => {
    try {
      const options: any = { ...opts }
      if (useCameraOnly) {
        options.useCameraOnly = true
        options.includeWebcam = true // Only for camera-only mode
      } else {
        options.includeWebcam = opts.includeWebcam // Respect manual setting
      }
      await rec.start(options)
    } catch (err: any) {
      // Error is already handled by the hook and exposed via rec.error
      console.error('Recording start failed:', err)
    }
  }

  const handleDownload = async () => {
    if (!rec.recordingBlob) return
    onToast('Downloading recording...', 'info')
    const url = URL.createObjectURL(rec.recordingBlob)
    const a = document.createElement('a')
    a.href = url
    // Ensure clean filename: remove special chars and add extension
    const cleanTitle = (title || 'recording').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.download = `${cleanTitle}-${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
    onToast('Download complete!', 'success')
  }

  const captureThumbnail = async (videoUrl: string): Promise<Blob | undefined> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = videoUrl
      video.crossOrigin = 'anonymous'
      video.muted = true
      
      video.onloadedmetadata = () => {
        // Seek to 1 second (or middle of video) to get a better frame
        video.currentTime = Math.min(1, rec.duration / 2)
      }
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => resolve(blob || undefined), 'image/jpeg', 0.8)
          } else {
            resolve(undefined)
          }
        } catch {
          resolve(undefined)
        }
      }
      
      video.onerror = () => resolve(undefined)
    })
  }

  const handleUpload = async () => {
    if (!rec.recordingBlob || !rec.previewUrl) return
    setUploading(true)
    setUploadPct(0)
    try {
      // Capture thumbnail first
      const thumbBlob = await captureThumbnail(rec.previewUrl)

      const defaultTitle = `Record - ${new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
      await videoApi.upload(
        rec.recordingBlob,
        title || defaultTitle,
        rec.duration,
        setUploadPct,
        thumbBlob
      )
      onToast('Recording uploaded successfully!', 'success')
      onUploaded?.()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      // Check if it's an auth error
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        onToast('Please log in to upload recordings.', 'error')
      } else {
        onToast(msg, 'error')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    rec.reset()
    setTitle('')
    setUploadPct(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <div style={{ 
        padding: '1.25rem', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        background: '#0a0a15', 
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--glass-border)'
      }}>

        {/* Background glow when recording */}
        {isRecording && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Status badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <span className={`badge ${status.cls}`}>
            {isRecording && <span className="rec-dot" />}
            {status.text}
          </span>
        </div>

        {/* Timer */}
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: '0',
          backgroundImage: isRecording
            ? 'linear-gradient(135deg, #f1f5f9, #ef4444)'
            : isStopped
            ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
            : 'linear-gradient(135deg, var(--text-secondary), var(--text-muted))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {fmt(rec.duration)}
        </div>

        {/* File size indicator when stopped */}
        {isStopped && rec.recordingBlob && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {fmtBytes(rec.recordingBlob.size)}
          </p>
        )}

        {/* Error */}
        {rec.error && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem',
          }}>
            ⚠️ {rec.error}
          </div>
        )}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div style={{ 
        padding: '1.25rem',
        background: '#0a0a15', 
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--glass-border)'
      }}>

        {/* Primary record controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {!isSupported && !isMobile ? (
            <div style={{ 
              padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '12px', textAlign: 'center', color: '#fca5a5', fontSize: '0.9rem', width: '100%' 
            }}>
              <Monitor size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
              <strong>Unsupported Device</strong>
              <p style={{ marginTop: '0.4rem', opacity: 0.9 }}>This browser does not support media recording. Please try a modern browser like Chrome or Safari.</p>
            </div>
          ) : isIdle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
              {isSupported ? (
                <>
                  <button id="btn-start-record" className="btn btn-primary" onClick={() => handleStart(false)} style={{ width: '100%', maxWidth: '320px', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem auto', whiteSpace: 'nowrap' }}>
                    <div className="pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'white', flexShrink: 0 }} />
                    Start Screen Recording
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                     Screen recording is not supported on mobile browsers, but you can still record using your camera!
                  </p>
                  <button id="btn-start-camera-record" className="btn btn-primary" onClick={() => handleStart(true)} style={{ width: '100%', maxWidth: '320px', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem auto', whiteSpace: 'nowrap' }}>
                    <div className="pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'white', flexShrink: 0 }} />
                    Start Camera Recording
                  </button>
                </div>
              )}
            </div>
          )}


          {isRecording && (
            <div className="flex gap-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <button id="btn-pause-record" className="btn btn-ghost" style={{ borderRadius: '14px' }} onClick={rec.pause}>
                <Pause size={16} /> Pause
              </button>
              <button id="btn-stop-record" className="btn btn-danger" style={{ borderRadius: '14px' }} onClick={rec.stop}>
                <Square size={16} fill="currentColor" /> Finish
              </button>
            </div>
          )}

          {isPaused && (
            <div className="flex gap-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <button id="btn-resume-record" className="btn btn-success" style={{ borderRadius: '14px' }} onClick={rec.resume}>
                <Play size={16} fill="currentColor" /> Resume
              </button>
              <button id="btn-stop-record" className="btn btn-ghost" style={{ borderRadius: '14px' }} onClick={rec.stop}>
                <Square size={16} fill="currentColor" /> Terminate
              </button>
            </div>
          )}
        </div>

        {/* Title input when stopped */}
        {isStopped && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              id="input-recording-title"
              className="input"
              placeholder="Recording title (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        )}

        {/* Post-recording actions */}
        {isStopped && rec.recordingBlob && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              id="btn-download" 
              className="btn btn-ghost" 
              onClick={handleDownload} 
              style={{ flex: '1 1 auto', minWidth: '120px', padding: '0.6rem' }}
            >
              <Download size={16} /> 
              Download
            </button>
            <button
              id="btn-upload"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
              style={{ flex: '1 1 auto', minWidth: '120px', padding: '0.6rem' }}
            >
              <Upload size={16} />
              {uploading ? `${uploadPct}%` : 'Upload'}
            </button>
            <button id="btn-reset" className="btn btn-ghost" onClick={handleReset} style={{ padding: '0.6rem' }}>
              <RotateCcw size={16} />
            </button>
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${uploadPct}%`
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Settings (collapsible) ─────────────────────────────────────────── */}
      {isIdle && (
        <div style={{ 
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--glass-border)',
          padding: '0 0.5rem' // Added safe zone padding
        }}>
          <button
            id="btn-toggle-settings"
            onClick={() => setShowOpts(p => !p)}
            style={{
              width: '100%', padding: '1rem 1.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Monitor size={16} /> Recording settings
            </span>
            {showOpts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showOpts && (
            <div style={{ padding: '0.75rem 1rem 1.75rem', display: 'grid', gridTemplateColumns: '1fr 75px', gap: '0.75rem', alignItems: 'center' }}>
              {/* Mic toggle */}
              <label className="flex gap-1" style={{ alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {opts.includeMic ? <Mic size={14} color="var(--accent-light)" /> : <MicOff size={14} />}
                Mic
              </label>
              <button
                id="btn-toggle-mic"
                className={`btn ${opts.includeMic ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', minWidth: '70px', justifyContent: 'center', justifySelf: 'end', margin: 0 }}
                onClick={() => setOpts(o => ({ ...o, includeMic: !o.includeMic }))}
              >
                {opts.includeMic ? 'On' : 'Off'}
              </button>

              {/* Webcam toggle */}
              <label className="flex gap-1" style={{ alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {opts.includeWebcam ? <Camera size={14} color="var(--accent-light)" /> : <CameraOff size={14} />}
                Webcam
              </label>
              <button
                id="btn-toggle-webcam"
                className={`btn ${opts.includeWebcam ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', minWidth: '70px', justifyContent: 'center', justifySelf: 'end', margin: 0 }}
                onClick={() => setOpts(o => ({ ...o, includeWebcam: !o.includeWebcam }))}
              >
                {opts.includeWebcam ? 'On' : 'Off'}
              </button>

              {/* Quality selector */}
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Quality</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end', justifySelf: 'end' }}>
                {(['low', 'medium', 'high'] as const).map(q => (
                  <button
                    key={q}
                    id={`btn-quality-${q}`}
                    className={`btn ${opts.videoQuality === q ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', textTransform: 'capitalize', minWidth: '70px', justifyContent: 'center', margin: 0 }}
                    onClick={() => setOpts(o => ({ ...o, videoQuality: q }))}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Webcam overlay preview ─────────────────────────────────────────── */}
      {rec.webcamStream && <WebcamOverlay stream={rec.webcamStream} />}

      {/* ── Video Preview ──────────────────────────────────────────────────── */}
      {rec.previewUrl && (
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Preview</h3>
          <CustomVideoPlayer
            src={rec.previewUrl}
            onDownload={handleDownload}
            onUpload={handleUpload}
            autoPlay
          />
        </div>
      )}
    </div>
  )
}
