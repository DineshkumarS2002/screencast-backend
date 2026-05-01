/**
 * useRecorder — Hook that consumes the global RecorderContext.
 */
import { useRecorderContext } from '../context/RecorderContext'

export type { RecordingState, RecorderOptions, RecorderResult } from '../context/RecorderContext'

export function useRecorder() {
  return useRecorderContext()
}
