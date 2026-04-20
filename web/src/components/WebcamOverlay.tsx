import { useEffect, useRef } from 'react'

interface WebcamOverlayProps {
  stream: MediaStream
}

/**
 * WebcamOverlay — displays a floating webcam feed during recording.
 * Supports dragging and resizing in a real app, but here we provide a fixed bottom-right circle.
 */
export function WebcamOverlay({ stream }: WebcamOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '4px solid var(--accent)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 1000,
      background: '#000',
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirror effect
        }}
      />
    </div>
  )
}
