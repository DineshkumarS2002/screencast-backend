/**
 * VideoTrimmer — Browser-native video trimming component.
 * Uses captureStream() and MediaRecorder to re-record a segment of the video.
 */

import { useState, useRef, useEffect } from 'react'
import { Scissors, Play, Pause, X, Save, RefreshCw } from 'lucide-react'

interface Props {
  videoUrl: string
  onClose: () => void
  onSave: (trimmedBlob: Blob) => Promise<void>
}

export function VideoTrimmer({ videoUrl, onClose, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setEndTime(video.duration)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
  }, [videoUrl])

  const handlePlayPause = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const handleTrim = async () => {
    const video = videoRef.current
    if (!video) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // 1. Prepare stream
      const stream = (video as any).captureStream()
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' })
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const promise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }))
        }
      })

      // 2. Start at start point
      video.currentTime = startTime
      video.pause()

      // Wait for seek
      await new Promise(r => setTimeout(r, 500))

      mediaRecorder.start()
      video.play()

      // 3. Monitor progress and stop at end point
      const interval = setInterval(() => {
        const current = video.currentTime
        const total = endTime - startTime
        const elapsed = current - startTime
        setProgress(Math.min(100, (elapsed / total) * 100))

        if (current >= endTime) {
          video.pause()
          mediaRecorder.stop()
          clearInterval(interval)
        }
      }, 100)

      const trimmedBlob = await promise
      await onSave(trimmedBlob)
      onClose()
    } catch (err) {
      console.error('Trimming failed:', err)
      alert('Failed to trim video. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
      backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="glass" style={{ width: '100%', maxWidth: 800, padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Scissors size={24} color="var(--accent)" /> Trim Recording
        </h2>

        <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem' }}>
          <video 
            ref={videoRef} 
            src={videoUrl} 
            crossOrigin="anonymous"
            style={{ width: '100%', maxHeight: 400 }}
            onEnded={() => setIsPlaying(false)}
          />
          {isProcessing && (
            <div style={{ 
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' 
            }}>
              <RefreshCw size={48} className="spin" style={{ marginBottom: '1rem' }} />
              <p>Processing: {Math.round(progress)}%</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Timeline / Sliders */}
          <div style={{ position: 'relative', height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <input 
              type="range" 
              min={0} max={duration} step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              style={{ width: '100%', position: 'absolute', top: 0, zIndex: 2 }}
            />
            <input 
              type="range" 
              min={0} max={duration} step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              style={{ width: '100%', position: 'absolute', bottom: 0, zIndex: 2 }}
            />
          </div>

          <div className="flex-between">
            <div className="flex gap-2" style={{ alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>{Math.round(startTime)}s</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span>{Math.round(endTime)}s</span>
              <span style={{ marginLeft: '1rem', color: 'var(--accent)' }}>Selected: {Math.round(endTime - startTime)}s</span>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={handlePlayPause}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />} {isPlaying ? 'Pause' : 'Preview'}
              </button>
              <button className="btn btn-primary" onClick={handleTrim} disabled={isProcessing || endTime <= startTime}>
                <Save size={18} /> {isProcessing ? 'Saving...' : 'Save Trimmed'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
