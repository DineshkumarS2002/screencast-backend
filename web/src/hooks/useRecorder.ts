/**
 * useRecorder — Custom hook for screen + microphone recording.
 *
 * Features:
 *  - Screen capture via getDisplayMedia
 *  - Microphone audio via getUserMedia
 *  - Combined via AudioContext for synchronized recording
 *  - Webcam overlay (optional)
 *  - Pause / Resume support
 *  - Real-time timer
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

export interface RecorderOptions {
  includeMic: boolean
  includeWebcam: boolean
  videoQuality: 'low' | 'medium' | 'high'
}

export interface RecorderResult {
  state: RecordingState
  duration: number          // seconds elapsed
  recordingBlob: Blob | null
  previewUrl: string | null
  webcamStream: MediaStream | null
  error: string | null

  start: (opts: RecorderOptions) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

// Map quality label to video constraints
const QUALITY_MAP = {
  low:    { width: 1280, height: 720,  frameRate: 15, bits: 1000000 }, // 1.0 Mbps
  medium: { width: 1280, height: 720,  frameRate: 25, bits: 2000000 }, // 2.0 Mbps
  high:   { width: 1920, height: 1080, frameRate: 30, bits: 4000000 }, // 4.0 Mbps
}

export function useRecorder(): RecorderResult {
  const [state, setState]           = useState<RecordingState>('idle')
  const [duration, setDuration]     = useState(0)
  const [recordingBlob, setBlob]    = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [webcamStream, setWebcam]   = useState<MediaStream | null>(null)
  const [error, setError]           = useState<string | null>(null)

  // Refs — don't trigger re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const screenStreamRef  = useRef<MediaStream | null>(null)
  const micStreamRef     = useRef<MediaStream | null>(null)
  const webcamStreamRef  = useRef<MediaStream | null>(null)
  const audioCtxRef      = useRef<AudioContext | null>(null)
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef     = useRef<number>(0)
  const pausedAtRef      = useRef<number>(0)

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  const stopAllStreams = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    webcamStreamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    screenStreamRef.current  = null
    micStreamRef.current     = null
    webcamStreamRef.current  = null
    audioCtxRef.current      = null
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => () => {
    clearTimer()
    stopAllStreams()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, []) // eslint-disable-line

  // ─── Start Recording ─────────────────────────────────────────────────────
  const start = useCallback(async (opts: RecorderOptions) => {
    setError(null)
    const quality = QUALITY_MAP[opts.videoQuality]

    try {
      // 1. Capture screen (prompts the OS picker)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { ...quality, cursor: 'always' } as any,
        audio: true,  // system audio (if supported)
      })
      screenStreamRef.current = screenStream

      // 2. Combine audio tracks via AudioContext
      const audioCtx = new AudioContext()
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }
      const destination = audioCtx.createMediaStreamDestination()
      audioCtxRef.current = audioCtx

      // Add system audio (from screen share) if present
      screenStream.getAudioTracks().forEach(track => {
        const src = audioCtx.createMediaStreamSource(new MediaStream([track]))
        src.connect(destination)
      })

      // 3. Optionally capture microphone
      if (opts.includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          micStreamRef.current = micStream
          micStream.getAudioTracks().forEach(track => {
            const src = audioCtx.createMediaStreamSource(new MediaStream([track]))
            src.connect(destination)
          })
        } catch {
          // Mic access denied — continue without mic
        }
      }

      // 4. Optionally capture webcam
      if (opts.includeWebcam) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 240, height: 180, facingMode: 'user' },
          })
          webcamStreamRef.current = camStream
          setWebcam(camStream)
        } catch {
          // Webcam access denied — continue without webcam
        }
      }

      // 5. Build combined stream: video from screen + audio from destination
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ])

      // 6. Set up MediaRecorder
      // VP8 is more widely compatible and stable than VP9 on older hardware
      const types = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ]
      const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'

      const recorder = new MediaRecorder(combinedStream, { 
        mimeType,
        videoBitsPerSecond: quality.bits
      })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setBlob(blob)
        setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) })
        setState('stopped')
        stopAllStreams()
        clearTimer()
      }

      // When user stops sharing the screen, auto-stop recording
      screenStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }

      recorder.start(1000) // Collect chunks every 1 second

      // 7. Start timer
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      setState('recording')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.includes('Permission denied') || msg.includes('NotAllowed')) {
        setError('Screen capture permission denied. Please allow screen sharing.')
      } else if (msg.includes('NotSupportedError')) {
        setError('Screen recording is not supported in this browser.')
      } else {
        setError(`Failed to start recording: ${msg}`)
      }
      stopAllStreams()
    }
  }, [stopAllStreams, clearTimer])

  // ─── Stop ─────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // ─── Pause ────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      clearTimer()
      pausedAtRef.current = Date.now() - startTimeRef.current
      setState('paused')
    }
  }, [clearTimer])

  // ─── Resume ───────────────────────────────────────────────────────────────
  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimeRef.current = Date.now() - pausedAtRef.current
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
      setState('recording')
    }
  }, [])

  // ─── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearTimer()
    stopAllStreams()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setBlob(null)
    setPreviewUrl(null)
    setDuration(0)
    setWebcam(null)
    setError(null)
    setState('idle')
    chunksRef.current = []
  }, [clearTimer, stopAllStreams, previewUrl])

  return {
    state, duration, recordingBlob, previewUrl, webcamStream, error,
    start, stop, pause, resume, reset,
  }
}
