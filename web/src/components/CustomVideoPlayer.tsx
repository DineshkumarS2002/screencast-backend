import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Volume2, VolumeX, Maximize2, Upload } from 'lucide-react'

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
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [muted, setMuted] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const sanitizeUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('https://res.cloudinary.com')) return url
    const hosts = ['http://localhost:8000', 'http://127.0.0.1:8000', 'https://screencast-backend-1.onrender.com', 'http://screencast-backend-1.onrender.com']
    for (const host of hosts) { if (url.startsWith(host)) return url.slice(host.length) }
    return url
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause()
      else videoRef.current.play()
      setPlaying(!playing)
      setShowOverlay(true)
      setTimeout(() => setShowOverlay(false), 500)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(p)
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration
      videoRef.current.currentTime = time
      setProgress(parseFloat(e.target.value))
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen()
  }

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }, [autoPlay, src])

  const safeSrc = sanitizeUrl(src)

  return (
    <div 
      ref={containerRef}
      className="custom-player-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        aspectRatio: '16/9'
      }}
    >
      <video
        ref={videoRef}
        src={safeSrc}
        className="w-full h-full cursor-pointer"
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '30px 20px 60px 20px',
        background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 600,
        pointerEvents: 'none',
        opacity: (isHovered || !playing) && title ? 1 : 0,
        transition: 'opacity 0.3s'
      }}>
        {title}
      </div>

      <div 
        onClick={togglePlay}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: showOverlay ? 'rgba(0,0,0,0.1)' : 'transparent',
          transition: 'all 0.3s ease',
          pointerEvents: isHovered || !playing ? 'auto' : 'none',
          opacity: (isHovered || !playing) ? 1 : 0
        }}
      >
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '50%',
          padding: '20px',
          transform: showOverlay ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}>
          {playing ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" style={{ marginLeft: '4px' }} />}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        opacity: isHovered || !playing ? 1 : 0,
        transition: 'opacity 0.3s'
      }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              appearance: 'none',
              background: `linear-gradient(to right, #ff0000 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
              cursor: 'pointer',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
              {playing ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <span style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace' }}>
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {onUpload && (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpload(); }} 
                title="Save to Library"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
              >
                <Upload size={22} />
              </button>
            )}
            {onDownload && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                title="Download"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
              >
                <Download size={22} />
              </button>
            )}
            <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
              <Maximize2 size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
