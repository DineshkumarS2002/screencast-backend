import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { ScreenRecorder as SrikantRecorder } from '@srikant-kumar/capacitor-screen-recorder'
import { Capacitor } from '@capacitor/core'

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

export interface RecorderOptions {
  includeMic: boolean
  includeWebcam: boolean
  videoQuality: 'low' | 'medium' | 'high'
}

export interface RecorderResult {
  state: RecordingState
  duration: number
  recordingBlob: Blob | null
  previewUrl: string | null
  webcamStream: MediaStream | null
  error: string | null
  start: (opts: RecorderOptions & { useCameraOnly?: boolean }) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

const RecorderContext = createContext<RecorderResult | undefined>(undefined)

const QUALITY_MAP = {
  low:    { width: 1280, height: 720,  frameRate: 15, bits: 1000000 },
  medium: { width: 1280, height: 720,  frameRate: 25, bits: 2000000 },
  high:   { width: 1920, height: 1080, frameRate: 30, bits: 4000000 },
}

export function RecorderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState]           = useState<RecordingState>('idle')
  const [duration, setDuration]     = useState(0)
  const [recordingBlob, setBlob]    = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [webcamStream, setWebcam]   = useState<MediaStream | null>(null)
  const [error, setError]           = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const screenStreamRef  = useRef<MediaStream | null>(null)
  const micStreamRef     = useRef<MediaStream | null>(null)
  const webcamStreamRef  = useRef<MediaStream | null>(null)
  const audioCtxRef      = useRef<AudioContext | null>(null)
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef     = useRef<number>(0)
  const pausedAtRef      = useRef<number>(0)

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

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const completeHandle = (SrikantRecorder as any).addListener('onRecordingComplete', async (data: any) => {
        if (data.status && data.file_path) {
          try {
            const url = Capacitor.convertFileSrc(data.file_path);
            const resp = await fetch(url);
            const blob = await resp.blob();
            setBlob(blob);
            setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) });
          } catch (e) {
            console.error('Failed to process mobile recording:', e);
          }
        }
      });

      const errorHandle = (SrikantRecorder as any).addListener('onRecordingError', (data: any) => {
        setError(data.message || 'Native recording error');
        setState('idle');
        clearTimer();
      });

      return () => {
        completeHandle.remove();
        errorHandle.remove();
      };
    }
  }, [clearTimer]);

  useEffect(() => () => {
    clearTimer()
    stopAllStreams()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, []) // eslint-disable-line

  const start = useCallback(async (opts: RecorderOptions & { useCameraOnly?: boolean }) => {
    setError(null)
    const quality = QUALITY_MAP[opts.videoQuality]

    try {
      let screenStream: MediaStream | null = null;
      if (!opts.useCameraOnly) {
        if (Capacitor.isNativePlatform()) {
          if (opts.includeMic) {
            const perm = await (SrikantRecorder as any).requestPermissions({ permissions: ['audio'] });
            if (perm.audio !== 'granted') {
              setError('Microphone permission is required for audio recording.');
              return;
            }
          }
          await SrikantRecorder.start({ recordAudio: !!opts.includeMic })
          setState('recording')
          startTimeRef.current = Date.now()
          timerRef.current = setInterval(() => {
            setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
          }, 1000)
          return;
        }

        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { ...quality, cursor: 'always' } as any,
          audio: true,
        })
        screenStreamRef.current = screenStream
      }

      const audioCtx = new AudioContext()
      if (audioCtx.state === 'suspended') await audioCtx.resume()
      const destination = audioCtx.createMediaStreamDestination()
      audioCtxRef.current = audioCtx

      if (screenStream) {
        screenStream.getAudioTracks().forEach(track => {
          const src = audioCtx.createMediaStreamSource(new MediaStream([track]))
          src.connect(destination)
        })
      }

      if (opts.includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          micStreamRef.current = micStream
          micStream.getAudioTracks().forEach(track => {
            const src = audioCtx.createMediaStreamSource(new MediaStream([track]))
            src.connect(destination)
          })
        } catch {}
      }

      if (opts.includeWebcam) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 240, height: 180, facingMode: 'user' },
          })
          webcamStreamRef.current = camStream
          setWebcam(camStream)
        } catch {}
      }

      const videoTracks = screenStream 
        ? screenStream.getVideoTracks() 
        : (webcamStreamRef.current ? webcamStreamRef.current.getVideoTracks() : [])

      const combinedStream = new MediaStream([
        ...videoTracks,
        ...destination.stream.getAudioTracks(),
      ])

      const types = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
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

      if (screenStream) {
        screenStream.getVideoTracks()[0].onended = () => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
        }
      }

      recorder.start(1000)
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      setState('recording')
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to start recording: ${msg}`)
      stopAllStreams()
    }
  }, [stopAllStreams, clearTimer])

  const stop = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SrikantRecorder.stop({})
        setState('stopped')
        clearTimer()
      } catch (err) {
        setError('Failed to stop native recording')
      }
      return
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [clearTimer])

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      clearTimer()
      pausedAtRef.current = Date.now() - startTimeRef.current
      setState('paused')
    }
  }, [clearTimer])

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

  return (
    <RecorderContext.Provider value={{
      state, duration, recordingBlob, previewUrl, webcamStream, error,
      start, stop, pause, resume, reset
    }}>
      {children}
    </RecorderContext.Provider>
  )
}

export const useRecorderContext = () => {
  const context = useContext(RecorderContext)
  if (!context) throw new Error('useRecorderContext must be used within RecorderProvider')
  return context
}
