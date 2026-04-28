import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Upload, Settings, SkipBack, SkipForward } from 'lucide-react'

// Replace standard <video> with this custom player
interface Props {
  src: string
  title?: string
  onDownload?: () => void
  onUpload?: () => void
  autoPlay?: boolean
}

function fmtTime(sec: number): string {
  if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function CustomVideoPlayer({ src, title, onDownload, onUpload, autoPlay }: Props) {
  // Force URL to be relative so it goes through the Vite proxy (solving COEP/CORP issues)
  const sanitizeUrl = (url: string) => {
    if (!url) return ''
    // Strip backend host so the URL becomes relative (e.g. /uploads/file.webm)
    // Works in dev (Vite proxy) and production (Netlify proxy → Render)
    const hosts = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://screencast-backend-1.onrender.com', // Your Render backend
    ]
    for (const host of hosts) {
      if (url.startsWith(host)) return url.slice(host.length)
    }
    return url
  }

  const videoSrc = sanitizeUrl(src)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay || false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  useEffect(() => {
    let active = true
    if (autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (active && error.name !== 'AbortError') {
            setIsPlaying(false)
          }
        })
      }
    }
    return () => { active = false }
  }, [autoPlay, videoSrc])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false)
          })
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration || 0)
      if (videoRef.current.duration > 0) {
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
      }
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualChange = Number(e.target.value)
    if (videoRef.current && isFinite(duration) && duration > 0) {
      const seekTime = (manualChange / 100) * duration
      if (isFinite(seekTime)) {
        videoRef.current.currentTime = seekTime
        setProgress(manualChange)
      }
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds))
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          skip(-10)
          break
        case 'ArrowRight':
          skip(10)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying]) // Re-bind if need access to state, but refs are better here

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSpeedMenu(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '10px', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoSrc}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', display: 'block', maxHeight: '400px', cursor: 'pointer' }}
        onClick={togglePlay}
      />

      {/* Title overlay — top-left, shown only when title is provided */}
      {title && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)',
          padding: '0.6rem 1rem',
          color: '#fff', fontSize: '0.85rem', fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {title}
        </div>
      )}
      
      {/* Custom Control Bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
        padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '0.8rem', minWidth: '40px' }}>{fmtTime(currentTime)}</span>
          <input 
            type="range" min="0" max="100" value={progress}
            onChange={handleProgressChange}
            style={{ flex: 1, cursor: 'pointer', height: '4px' }}
          />
          <span style={{ color: '#fff', fontSize: '0.8rem', minWidth: '40px' }}>{fmtTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={togglePlay} className="btn-icon" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => skip(-10)} className="btn-icon" title="Back 10s" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <SkipBack size={18} />
            </button>
            <button onClick={() => skip(10)} className="btn-icon" title="Forward 10s" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <SkipForward size={18} />
            </button>

            {/* Playback Speed Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Settings size={16} /> {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, background: '#1e1e1e', borderRadius: '8px', padding: '0.5rem', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                    <button 
                      key={rate} 
                      onClick={() => changeSpeed(rate)}
                      style={{ background: rate === playbackRate ? 'var(--accent)' : 'transparent', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      {rate}x Speed
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onDownload && (
              <button onClick={onDownload} title="Download" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Download size={18} />
              </button>
            )}
            {onUpload && (
              <button onClick={onUpload} title="Upload" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Upload size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
