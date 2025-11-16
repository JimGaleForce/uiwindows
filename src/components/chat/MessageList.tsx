/**
 * Chat message list component
 * Renders a scrollable list of messages with auto-scroll behavior
 */

import React, { useRef, useEffect, useState } from 'react'
import { ChatMessage, Theme, EmbeddingData } from '../../types'
import { MessageBubble } from './MessageBubble'
import { EmbeddingComparison } from './EmbeddingComparison'

export interface MessageListProps {
  messages: ChatMessage[]
  theme: Theme
  isRunning?: boolean
}

/**
 * Message list - displays chat messages with smart auto-scrolling
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  theme,
  isRunning = false,
}) => {
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  // Check if user is scrolled near the bottom
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return true

    const threshold = 150 // pixels from bottom (increased for better UX)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    isNearBottomRef.current = isNearBottom
    return isNearBottom
  }

  // Auto-scroll to bottom ONLY if user is already at the bottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const isAtBottom = isNearBottomRef.current

    if (isAtBottom) {
      // Use scrollTop to ensure we always scroll to the actual bottom
      const scrollToBottom = () => {
        container.scrollTop = container.scrollHeight
      }

      if (isRunning) {
        // Instant scroll during streaming
        scrollToBottom()
      } else {
        // Smooth scroll for new messages
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [messages, isRunning])

  // Track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      checkIfNearBottom()
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSelectionChange = (messageId: string, selected: boolean) => {
    setSelectedMessageIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(messageId)
      } else {
        newSet.delete(messageId)
      }
      return newSet
    })
  }

  const selectedEmbeddings: EmbeddingData[] = messages
    .filter(m => selectedMessageIds.has(m.id) && m.embedding)
    .map(m => m.embedding!)

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No messages yet. Start a conversation!
      </div>
    )
  }

  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-modern"
        style={{ backgroundColor: theme.colors.background }}
      >
        {messages.map((message) => {
          // Debug: Log each message to see if audio is present
          if (message.audio) {
            console.log('📨 MessageList passing message with audio:', {
              id: message.id,
              hasAudio: !!message.audio,
              audioDataLength: message.audio.data.length
            })
          }
          return (
            <MessageBubble
              key={message.id}
              message={message}
              theme={theme}
              isSelected={selectedMessageIds.has(message.id)}
              onSelectionChange={handleSelectionChange}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Comparison panel */}
      {selectedEmbeddings.length > 0 && (
        <EmbeddingComparison
          embeddings={selectedEmbeddings}
          onClose={() => setSelectedMessageIds(new Set())}
        />
      )}
    </>
  )
}
