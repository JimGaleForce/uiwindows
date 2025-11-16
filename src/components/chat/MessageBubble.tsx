/**
 * Chat message bubble component
 * Renders individual messages with proper styling based on type
 */

import React from 'react'
import { ChatMessage, Theme, EmbeddingData } from '../../types'
import { User, Bot, Wrench, AlertCircle, Info, Volume2, Play, Pause, Download, ZoomIn, Copy, Check, FileDown, FileType, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export interface MessageBubbleProps {
  message: ChatMessage
  theme?: Theme // Optional - not currently used but kept for future styling
  isSelected?: boolean
  onSelectionChange?: (messageId: string, selected: boolean) => void
}

/**
 * Embedding display component with save and copy features
 */
const EmbeddingDisplay: React.FC<{ embedding: EmbeddingData }> = ({ embedding }) => {
  const [copiedArray, setCopiedArray] = React.useState(false)
  const [savedBinary, setSavedBinary] = React.useState(false)
  const [savedJSON, setSavedJSON] = React.useState(false)

  const handleCopyArray = async () => {
    try {
      const arrayText = `[${embedding.vector.join(', ')}]`
      await navigator.clipboard.writeText(arrayText)
      setCopiedArray(true)
      setTimeout(() => setCopiedArray(false), 2000)
    } catch (error) {
      console.error('Failed to copy array:', error)
    }
  }

  const handleSaveBinary = () => {
    try {
      // Create Float32Array from vector
      const float32Array = new Float32Array(embedding.vector)
      const blob = new Blob([float32Array.buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `embedding-${embedding.model.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.bin`
      link.click()
      URL.revokeObjectURL(url)
      setSavedBinary(true)
      setTimeout(() => setSavedBinary(false), 2000)
    } catch (error) {
      console.error('Failed to save binary:', error)
    }
  }

  const handleSaveJSON = () => {
    try {
      const jsonData = {
        id: embedding.id,
        model: embedding.model,
        dimension: embedding.dimension,
        vector: embedding.vector,
        inputText: embedding.inputText,
        timestamp: embedding.timestamp
      }
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `embedding-${embedding.model.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      setSavedJSON(true)
      setTimeout(() => setSavedJSON(false), 2000)
    } catch (error) {
      console.error('Failed to save JSON:', error)
    }
  }

  const vectorPreview = embedding.vector.slice(0, 10).map(v => v.toFixed(4)).join(', ')

  return (
    <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-400 mb-1">
            <span className="font-semibold">Input:</span> {embedding.inputText.substring(0, 100)}
            {embedding.inputText.length > 100 && '...'}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            [{vectorPreview}, ...]
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopyArray}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs"
          title="Copy as JavaScript/Python array"
        >
          {copiedArray ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-slate-300" />
              <span className="text-slate-300">Copy Array</span>
            </>
          )}
        </button>

        <button
          onClick={handleSaveBinary}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs"
          title="Save as binary file (Float32Array)"
        >
          {savedBinary ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Saved!</span>
            </>
          ) : (
            <>
              <FileDown size={14} className="text-slate-300" />
              <span className="text-slate-300">Binary (.bin)</span>
            </>
          )}
        </button>

        <button
          onClick={handleSaveJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs"
          title="Save as JSON file with metadata"
        >
          {savedJSON ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Saved!</span>
            </>
          ) : (
            <>
              <FileType size={14} className="text-slate-300" />
              <span className="text-slate-300">JSON (.json)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Generated image display component with preview, download, and copy URL
 */
const GeneratedImageDisplay: React.FC<{ imageUrl: string; revisedPrompt?: string }> = ({ imageUrl, revisedPrompt }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob to enable proper download
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `generated-image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Failed to download image:', error)
      // Fallback: open in new tab if download fails
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <>
      <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
        {revisedPrompt && (
          <div className="px-3 py-2 bg-slate-800/70 border-b border-slate-700">
            <p className="text-xs text-slate-400">
              <span className="font-semibold">Revised Prompt:</span> {revisedPrompt}
            </p>
          </div>
        )}
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Generated by AI"
            className="w-full h-auto max-h-96 object-contain bg-slate-900"
            onClick={() => setIsPreviewOpen(true)}
            style={{ cursor: 'pointer' }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3">
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Full Preview"
              >
                <ZoomIn size={16} className="text-white" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Download Image"
              >
                <Download size={16} className="text-white" />
              </button>
              <button
                onClick={handleCopyUrl}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full preview modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={imageUrl}
              alt="Generated by AI - Full Preview"
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleDownload}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Download Image"
              >
                <Download size={20} className="text-white" />
              </button>
              <button
                onClick={handleCopyUrl}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Copy size={20} className="text-white" />
                )}
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                title="Close Preview"
              >
                <span className="text-white font-bold text-xl">×</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Audio player component for playing audio attachments
 */
const AudioPlayer: React.FC<{ audio: NonNullable<ChatMessage['audio']> }> = ({ audio }) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    const audioUrl = `data:audio/${audio.format};base64,${audio.data}`
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `audio-${Date.now()}.${audio.format}`
    link.click()
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Convert base64 to data URL
  const audioUrl = `data:audio/${audio.format};base64,${audio.data}`

  return (
    <div className="mt-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center gap-3">
        <Volume2 size={18} className="text-slate-400 flex-shrink-0" />
        <button
          onClick={togglePlay}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {audio.voice && (
              <span className="text-xs text-slate-400">Voice: {audio.voice}</span>
            )}
            <span className="text-xs text-slate-500">
              {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'Loading...'}
            </span>
          </div>
          {duration > 0 && (
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          aria-label="Download audio"
          title="Download audio"
        >
          <Download size={16} className="text-slate-400" />
        </button>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  )
}

/**
 * Copy buttons component for copying message content
 */
const CopyButtons: React.FC<{ content: string }> = ({ content }) => {
  const [copiedText, setCopiedText] = React.useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = React.useState(false)

  const handleCopyText = async () => {
    try {
      // Strip markdown formatting for plain text copy
      const plainText = content
        .replace(/#+\s/g, '') // Remove headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/`(.+?)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]+?```/g, (match) => match.replace(/```\w*\n?/g, '')) // Remove code block markers
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
        .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
        .replace(/^>\s/gm, '') // Remove blockquotes
        .replace(/^[-*+]\s/gm, '') // Remove list markers
        .replace(/^\d+\.\s/gm, '') // Remove numbered list markers

      await navigator.clipboard.writeText(plainText.trim())
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch (error) {
      console.error('Failed to copy as text:', error)
    }
  }

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMarkdown(true)
      setTimeout(() => setCopiedMarkdown(false), 2000)
    } catch (error) {
      console.error('Failed to copy as markdown:', error)
    }
  }

  return (
    <div className="copy-buttons-container">
      <button
        onClick={handleCopyText}
        className="p-1.5 bg-slate-700/80 hover:bg-slate-600 rounded transition-colors"
        title="Copy as plain text"
      >
        {copiedText ? (
          <Check size={12} className="text-green-400" />
        ) : (
          <FileText size={12} className="text-slate-300" />
        )}
      </button>
      <button
        onClick={handleCopyMarkdown}
        className="p-1.5 bg-slate-700/80 hover:bg-slate-600 rounded transition-colors"
        title="Copy as markdown"
      >
        {copiedMarkdown ? (
          <Check size={12} className="text-green-400" />
        ) : (
          <Copy size={12} className="text-slate-300" />
        )}
      </button>
    </div>
  )
}

/**
 * Message bubble - renders a single chat message with appropriate styling
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelected = false, onSelectionChange }) => {
  const getMessageStyle = () => {
    switch (message.type) {
      case 'user':
        return {
          bg: 'bg-blue-600/20',
          border: 'border-blue-500/30',
          text: 'text-blue-100',
          icon: <User size={16} className="text-blue-400" />,
        }
      case 'assistant':
        return {
          bg: 'bg-purple-600/20',
          border: 'border-purple-500/30',
          text: 'text-purple-100',
          icon: <Bot size={16} className="text-purple-400" />,
        }
      case 'tool':
        return {
          bg: 'bg-yellow-600/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-100',
          icon: <Wrench size={16} className="text-yellow-400" />,
        }
      case 'error':
        return {
          bg: 'bg-red-600/20',
          border: 'border-red-500/30',
          text: 'text-red-100',
          icon: <AlertCircle size={16} className="text-red-400" />,
        }
      case 'system':
        return {
          bg: 'bg-slate-700/20',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          icon: <Info size={16} className="text-slate-400" />,
        }
      default:
        return {
          bg: 'bg-slate-700/20',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          icon: null,
        }
    }
  }

  const style = getMessageStyle()

  // Parse generated image from markdown
  const parseGeneratedImage = (content: string) => {
    // Match pattern: **Image Generated**\n\n(Revised Prompt: ...)\n\n![Generated Image](url)
    const imageMatch = content.match(/!\[Generated Image\]\(([^)]+)\)/)
    const revisedPromptMatch = content.match(/Revised Prompt:\s*([^\n]+)/)

    if (imageMatch) {
      const imageUrl = imageMatch[1]
      const revisedPrompt = revisedPromptMatch?.[1]
      // Remove the markdown from text content
      const textContent = content
        .replace(/!\[Generated Image\]\([^)]+\)/g, '')
        .replace(/Revised Prompt:[^\n]+\n*/g, '')
        .trim()

      return { imageUrl, revisedPrompt, textContent }
    }

    return null
  }

  const generatedImage = parseGeneratedImage(message.content)
  const hasEmbedding = !!message.embedding
  const showCheckbox = hasEmbedding && onSelectionChange

  const contentToRender = generatedImage ? generatedImage.textContent : message.content

  return (
    <div className={`message-bubble p-3 rounded-lg border ${style.bg} ${style.border} relative ${isSelected ? 'ring-2 ring-blue-500' : ''} group`}>
      <CopyButtons content={contentToRender} />
      <div className="flex items-start gap-2">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectionChange(message.id, e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            title="Select for comparison"
          />
        )}
        {style.icon && <div className="mt-0.5 flex-shrink-0">{style.icon}</div>}
        <div className="flex-1 min-w-0">
          <div className={`markdown-content text-sm leading-relaxed ${style.text} overflow-hidden`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {contentToRender}
            </ReactMarkdown>
          </div>
          {message.images && message.images.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {message.images.map(img => (
                <img
                  key={img.id}
                  src={img.preview || img.data}
                  alt={img.name}
                  className="rounded border border-white/10 max-h-32 object-cover"
                />
              ))}
            </div>
          )}
          {generatedImage && (
            <GeneratedImageDisplay
              imageUrl={generatedImage.imageUrl}
              revisedPrompt={generatedImage.revisedPrompt}
            />
          )}
          {message.embedding && <EmbeddingDisplay embedding={message.embedding} />}
          {message.audio && <AudioPlayer audio={message.audio} />}
          <div className="text-xs text-slate-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
