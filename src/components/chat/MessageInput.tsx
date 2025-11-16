/**
 * Chat message input component
 * Text input with image attachment and audio file upload support
 */

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Send, Loader2, ImagePlus, X, FileAudio } from 'lucide-react'
import { AttachedImage, Theme } from '../../types'
import { MicrophoneButton } from './MicrophoneButton'

export interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string, images?: AttachedImage[]) => void
  onAudioRecorded?: (audioBlob: Blob, mimeType: string) => Promise<void>
  isRunning?: boolean
  theme: Theme
  placeholder?: string
  enableImages?: boolean
  enableAudioUpload?: boolean
  enableMicrophone?: boolean
  disableTextInput?: boolean
  onClick?: (event: React.MouseEvent) => void
  isSelected?: boolean
}

/**
 * Message input - text area with send button and optional image attachments
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  onAudioRecorded,
  isRunning = false,
  theme,
  placeholder = 'Type a message...',
  enableImages = true,
  enableAudioUpload = false,
  enableMicrophone = true,
  disableTextInput = false,
  onClick,
  isSelected = false,
}) => {
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  // Debug: Log props to troubleshoot button visibility
  React.useEffect(() => {
    console.log('🎤 MessageInput Props:', {
      enableImages,
      enableAudioUpload,
      enableMicrophone,
      disableTextInput,
      hasOnAudioRecorded: !!onAudioRecorded
    })
  }, [enableImages, enableAudioUpload, enableMicrophone, disableTextInput, onAudioRecorded])

  // Handle mouse down for selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e)
    }
  }

  // Handle paste events for images
  React.useEffect(() => {
    if (!enableImages) return

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageItems: DataTransferItem[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          imageItems.push(items[i])
        }
      }

      if (imageItems.length > 0) {
        e.preventDefault()
        const files: File[] = []
        for (const item of imageItems) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
        if (files.length > 0) {
          await handleImageFiles(files)
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [enableImages])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (value.trim() || attachedImages.length > 0) {
      onSubmit(value.trim(), attachedImages.length > 0 ? attachedImages : undefined)
      onChange('')
      setAttachedImages([])
    }
  }

  const handleImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'))

    for (const file of imageFiles) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" is too large (max 5MB)`)
        continue
      }

      // Check if supported format
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert(
          `Image "${file.name}" has unsupported format. Supported: JPEG, PNG, GIF, WebP`
        )
        continue
      }

      try {
        const reader = new FileReader()
        const result = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const image: AttachedImage = {
          id: crypto.randomUUID(),
          name: file.name,
          data: result,
          mediaType: file.type as AttachedImage['mediaType'],
          size: file.size,
          preview: result,
        }

        setAttachedImages((prev) => [...prev, image])
      } catch (error) {
        console.error('Failed to read image:', error)
        alert(`Failed to load image: ${file.name}`)
      }
    }
  }

  const removeImage = (imageId: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  // Handle audio file upload (for STT models like Whisper)
  const handleAudioFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const audioFiles = fileArray.filter((f) => f.type.startsWith('audio/'))

    for (const file of audioFiles) {
      // Check file size (25MB limit for Whisper)
      if (file.size > 25 * 1024 * 1024) {
        alert(`Audio file "${file.name}" is too large (max 25MB)`)
        continue
      }

      // Check if supported format
      const supportedFormats = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/x-m4a']
      if (!supportedFormats.includes(file.type)) {
        alert(
          `Audio file "${file.name}" has unsupported format. Supported: MP3, MP4, M4A, WAV, WebM`
        )
        continue
      }

      try {
        // For audio files, we'll pass them directly to onAudioRecorded
        if (onAudioRecorded) {
          await onAudioRecorded(file, file.type)
        }
      } catch (error) {
        console.error('Failed to process audio file:', error)
        alert(`Failed to load audio file: ${file.name}`)
      }
    }
  }

  return (
    <div
      className="border-t p-4 space-y-2"
      style={{
        borderColor: theme.colors.border.default,
        backgroundColor: theme.colors.panel,
      }}
    >
      {/* Image attachments preview */}
      {attachedImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachedImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.preview || img.data}
                alt={img.name}
                className="w-20 h-20 object-cover rounded border border-white/10"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
              <div className="text-xs text-slate-500 mt-1 truncate max-w-[80px]">
                {img.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          placeholder={disableTextInput ? 'Use microphone to speak...' : placeholder}
          disabled={disableTextInput}
          className={`flex-1 bg-white/5 text-white border rounded-lg px-3 py-2 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
            isSelected
              ? 'border-[#D4FF48] shadow-[0_0_10px_rgba(212,255,72,0.5)]'
              : 'border-white/10 focus:border-[#D4FF48]'
          }`}
          rows={1}
          style={{ minHeight: '40px', maxHeight: '200px' }}
        />

        {enableMicrophone && onAudioRecorded && (
          <MicrophoneButton
            onAudioRecorded={onAudioRecorded}
            disabled={isRunning}
          />
        )}

        {enableImages && !enableAudioUpload && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRunning}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-2 rounded hover:bg-white/5 disabled:opacity-50"
              aria-label="Attach image"
              title="Attach image (max 5MB)"
            >
              <ImagePlus size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
            />
          </>
        )}

        {enableAudioUpload && onAudioRecorded && (
          <>
            <button
              onClick={() => audioFileInputRef.current?.click()}
              disabled={isRunning}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-2 rounded hover:bg-white/5 disabled:opacity-50"
              aria-label="Upload audio file"
              title="Upload audio file (max 25MB, MP3/WAV/M4A/WebM)"
            >
              <FileAudio size={20} />
            </button>
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files && handleAudioFiles(e.target.files)}
            />
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={isRunning || (!value.trim() && attachedImages.length === 0)}
          className="bg-[#D4FF48] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#c4ef38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Send message"
        >
          {isRunning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Sending</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
