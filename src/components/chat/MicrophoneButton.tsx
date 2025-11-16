/**
 * Microphone button component for recording audio
 * Supports speech-to-text for all models and STT-only mode for Whisper
 */

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square } from 'lucide-react'

export interface MicrophoneButtonProps {
  onAudioRecorded: (audioBlob: Blob, mimeType: string) => void
  disabled?: boolean
  className?: string
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onAudioRecorded,
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Use webm/opus for good browser support and quality
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        onAudioRecorded(audioBlob, mimeType)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Reset
        chunksRef.current = []
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-mono">{formatTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            title="Stop recording"
            type="button"
          >
            <Square size={18} className="text-white" />
          </button>
        </>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors ${
            disabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title="Record audio"
          type="button"
        >
          <Mic size={18} />
        </button>
      )}
    </div>
  )
}
