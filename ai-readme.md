# UIWindows - Technical Architecture Guide for LLMs

This document provides a comprehensive technical overview of the UIWindows library, specifically designed for AI assistants and LLMs to understand the architecture, patterns, and best practices for implementation.

## Architecture Overview

UIWindows is a modular React window management system built with TypeScript. The architecture follows these key principles:

1. **Component-Based Architecture**: Each feature is encapsulated in self-contained components
2. **Hook-Based State Management**: Custom hooks manage window and workspace state
3. **Event-Driven Communication**: Event bus enables decoupled cross-component communication
4. **Theme-First Design**: All UI elements respect theme configuration
5. **Type Safety**: Full TypeScript coverage with exported types for consumers

## Directory Structure

```
src/
├── components/
│   ├── WindowManager.tsx        # Main window container with grid layout
│   ├── MinimizedBar.tsx          # Minimized window display
│   ├── ResizableSidebar.tsx      # Sidebar with resize/collapse
│   └── chat/
│       ├── ChatWindow.tsx        # Complete chat interface
│       ├── MessageList.tsx       # Message display with markdown
│       ├── MessageInput.tsx      # Input with image/audio support
│       ├── MessageBubble.tsx     # Individual message rendering
│       ├── MicrophoneButton.tsx  # Audio recording component
│       └── EmbeddingComparison.tsx # Embedding similarity panel
├── hooks/
│   ├── useWindows.ts             # Window state management
│   └── useWorkspaces.ts          # Workspace persistence
├── contexts/
│   └── ThemeContext.tsx          # Theme provider and hook
├── utils/
│   ├── similarity.ts             # Vector similarity calculations
│   └── event-bus.ts              # Event bus implementation
├── theme/
│   └── defaultTheme.ts           # Built-in theme definitions
├── types/
│   └── index.ts                  # All TypeScript type definitions
└── index.ts                      # Public API exports
```

## Component Hierarchy and Relationships

### Top-Level Structure

```
App (Consumer)
└── ThemeProvider
    └── Layout Container
        ├── ResizableSidebar
        │   └── [User Content]
        └── WindowManager
            ├── [Normal Windows Grid]
            │   └── renderWindow() → ChatWindow (or custom)
            ├── [Maximized Window]
            │   └── renderWindow() → ChatWindow (or custom)
            └── MinimizedBar[] (for each minimized window)
```

### ChatWindow Internal Structure

```
ChatWindow
├── Header
│   ├── Title/Subtitle
│   ├── Context Usage Display
│   ├── Control Buttons (export, import, code, settings, archive, clear)
│   └── Window Controls (minimize, maximize/restore, close)
├── MessageList
│   └── MessageBubble[] (for each message)
│       ├── User/Assistant/System/Error/Tool indicator
│       ├── Markdown content (react-markdown)
│       ├── Attached images (if any)
│       ├── Embedded audio player (if any)
│       └── Embedding data display (if any)
├── MessageInput
│   ├── Textarea (auto-expanding)
│   ├── Image attachment button
│   ├── Audio upload button (optional)
│   └── MicrophoneButton (optional)
└── Stop Button Overlay (when running)
```

## Type System Structure

### Core Window Types

```typescript
// Window state enum
type WindowState = 'normal' | 'minimized' | 'maximized'

// Generic window type with custom data
interface Window<TData = any> {
  id: string              // Unique identifier
  title: string           // Display title
  content: ReactNode      // Window content (usually ChatWindow)
  state?: WindowState     // Current state (default: 'normal')
  order: number           // Grid position (auto-assigned by useWindows)
  borderColor?: string    // Optional custom border
  icon?: ReactNode        // Optional header icon
  data?: TData            // Custom data payload
  onClose?: () => void    // Close callback
}
```

### Chat Types

```typescript
// Message type enum
type MessageType = 'user' | 'assistant' | 'system' | 'error' | 'tool'

// Chat message with optional attachments
interface ChatMessage {
  id: string
  type: MessageType
  content: string                    // Markdown-formatted text
  timestamp: string                  // ISO 8601 format
  images?: AttachedImage[]          // Optional image attachments
  audio?: AttachedAudio             // Optional audio attachment
  embedding?: EmbeddingData         // Optional embedding vector
}

// Chat session state
interface ChatSession {
  id: string
  messages: ChatMessage[]
  isRunning: boolean                 // Is LLM generating?
  sessionId?: string                 // Backend session ID
  contextUsage?: {                   // Token usage stats
    totalInputTokens: number
    contextWindow: number
    percentUsed: number
  }
}

// Image attachment
interface AttachedImage {
  id: string
  name: string
  data: string                       // base64-encoded image data
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  size: number                       // Bytes
  preview?: string                   // Optional thumbnail base64
}

// Audio attachment
interface AttachedAudio {
  id: string
  data: string                       // base64-encoded audio data
  format: 'wav' | 'pcm16' | 'mp3'
  voice?: string                     // Voice identifier (for TTS)
  duration?: number                  // Seconds
}

// Embedding vector data
interface EmbeddingData {
  id: string
  model: string                      // e.g., 'text-embedding-ada-002'
  dimension: number                  // Vector size (e.g., 1536)
  vector: number[]                   // The actual embedding
  inputText: string                  // Original text that was embedded
  timestamp: string                  // ISO 8601 format
}
```

### Workspace Types

```typescript
// Saved workspace (named layout)
interface SavedWorkspace {
  name: string
  windows: Window[]
  createdAt: string
  updatedAt: string
}

// Active workspace (session-specific)
interface Workspace {
  sessionId: string                  // Browser tab ID
  name?: string                      // Optional name if saved
  windows: Window[]
  closedItemIds?: string[]          // Manually closed items
  collapsedItemIds?: string[]       // Collapsed sidebar items
  createdAt: string
  updatedAt: string
  isSaved: boolean                   // Is this a named workspace?
}
```

## How Components Work Together

### 1. Window Management Flow

```
User Action → useWindows hook → Update windows state → WindowManager re-renders

Example: Opening a window
1. User clicks "New Chat" button
2. Calls openWindow({ id, title, content, data })
3. Hook adds window with auto-assigned order
4. WindowManager receives updated windows array
5. Calculates grid layout based on count
6. Renders window using renderWindow() callback
```

### 2. Chat Message Flow

```
User Input → ChatWindow → Parent Handler → State Update → Re-render

Example: Sending a message
1. User types in MessageInput and presses Enter
2. MessageInput calls onSubmit(message, images)
3. ChatWindow calls onSendMessage(message, images)
4. Parent component receives message and images
5. Parent adds user message to session.messages
6. Parent calls LLM API
7. Parent adds assistant message to session.messages
8. MessageList re-renders with new messages
```

### 3. Audio Recording Flow

```
User Click → MicrophoneButton → Browser API → ChatWindow → Parent

Example: Recording audio
1. User clicks microphone button
2. MicrophoneButton requests mic permissions
3. Starts MediaRecorder with WebM/Opus format
4. User clicks stop button
5. MicrophoneButton calls onAudioRecorded(blob, mimeType)
6. ChatWindow calls parent's onAudioRecorded callback
7. Parent sends to STT API and receives text
8. Parent returns transcribed text
9. ChatWindow fills input or auto-submits based on mode
```

### 4. Multi-Window Sync Flow

```
Input Change → Event Bus → Other Windows → Update State

Example: Syncing input across windows
1. User types in window A (isSelected=true)
2. ChatWindow calls handleInputChange(value)
3. Updates local input state
4. Emits 'sync-input' event via eventBus
5. Window B's ChatWindow receives event
6. Checks if it's selected and not the source
7. Updates its input state to match
```

### 5. Workspace Persistence Flow

```
State Change → useWorkspaces hook → localStorage → Restore on load

Example: Auto-saving session
1. User opens/closes windows
2. Parent calls saveSessionWorkspace(windows)
3. Hook creates Workspace object
4. Saves to localStorage['window-manager-session-{sessionId}']
5. On page reload, call loadSessionWorkspace()
6. Hook reads from localStorage
7. Returns Workspace with windows array
8. Parent applies windows to useWindows hook
```

## Best Practices for Usage

### 1. State Management

**DO:**
```typescript
// Use separate state for each window's session
const [sessions, setSessions] = useState<Map<string, ChatSession>>(new Map())

// Update immutably
const updateSession = (windowId: string, updates: Partial<ChatSession>) => {
  setSessions(prev => new Map(prev).set(windowId, {
    ...prev.get(windowId)!,
    ...updates
  }))
}
```

**DON'T:**
```typescript
// Don't mutate session state directly
const session = sessions.get(windowId)
session.messages.push(newMessage) // ❌ Mutates state
setSessions(sessions) // ❌ Doesn't trigger re-render
```

### 2. Window Creation

**DO:**
```typescript
// Let useWindows assign order
openWindow({
  id: `chat-${Date.now()}`,
  title: 'New Chat',
  content: null, // Will be rendered by WindowManager
  data: {
    id: sessionId,
    messages: [],
    isRunning: false
  }
})
```

**DON'T:**
```typescript
// Don't manually assign order
openWindow({
  id: 'chat-1',
  title: 'Chat',
  content: null,
  order: 5, // ❌ Type error - order is auto-assigned
  data: session
})
```

### 3. Theme Usage

**DO:**
```typescript
// Always use theme from context or props
function MyComponent() {
  const theme = useTheme()

  return (
    <div style={{ backgroundColor: theme.colors.panel }}>
      <button style={{ color: theme.colors.accent }}>
        Click Me
      </button>
    </div>
  )
}
```

**DON'T:**
```typescript
// Don't hardcode colors
function MyComponent() {
  return (
    <div style={{ backgroundColor: '#161616' }}> {/* ❌ Hardcoded */}
      <button style={{ color: '#D4FF48' }}> {/* ❌ Hardcoded */}
        Click Me
      </button>
    </div>
  )
}
```

### 4. Event Bus Usage

**DO:**
```typescript
// Clean up event listeners
useEffect(() => {
  const handleEvent = (data: any) => {
    console.log('Event received:', data)
  }

  eventBus.on('my-event', handleEvent)

  return () => {
    eventBus.off('my-event', handleEvent)
  }
}, [])
```

**DON'T:**
```typescript
// Don't forget cleanup
useEffect(() => {
  eventBus.on('my-event', (data) => {
    console.log(data)
  })
  // ❌ No cleanup - creates memory leak
}, [])
```

### 5. Workspace Management

**DO:**
```typescript
// Initialize workspace on mount
useEffect(() => {
  const initWorkspace = async () => {
    const workspace = await loadSessionWorkspace()
    if (workspace.windows.length > 0) {
      // Apply windows to useWindows
      workspace.windows.forEach(w => openWindow(w))
    }
  }

  initWorkspace()
}, [])

// Auto-save on changes
useEffect(() => {
  if (windows.length > 0) {
    saveSessionWorkspace(windows)
  }
}, [windows])
```

**DON'T:**
```typescript
// Don't manually manage localStorage
useEffect(() => {
  const saved = localStorage.getItem('my-windows') // ❌ Manual storage
  if (saved) {
    setWindows(JSON.parse(saved))
  }
}, [])
```

## Common Patterns and Use Cases

### Pattern 1: Multi-Model Chat Interface

```typescript
interface ModelConfig {
  name: string
  model: string
  apiKey: string
}

function MultiModelChat() {
  const { windows, openWindow, closeWindow } = useWindows()
  const [sessions, setSessions] = useState<Map<string, ChatSession>>(new Map())
  const [models] = useState<ModelConfig[]>([
    { name: 'GPT-4', model: 'gpt-4', apiKey: 'sk-...' },
    { name: 'Claude', model: 'claude-3', apiKey: 'sk-...' }
  ])

  const createChat = (modelConfig: ModelConfig) => {
    const sessionId = `${modelConfig.model}-${Date.now()}`
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      isRunning: false
    }

    sessions.set(sessionId, session)

    openWindow({
      id: sessionId,
      title: modelConfig.name,
      data: session,
      borderColor: getBorderColor(modelConfig.model)
    })
  }

  const handleSendMessage = async (windowId: string, message: string) => {
    const session = sessions.get(windowId)!
    const model = windows.find(w => w.id === windowId)!.title

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    updateSession(windowId, {
      messages: [...session.messages, userMsg],
      isRunning: true
    })

    // Call API
    const response = await callLLMAPI(model, message)

    // Add assistant message
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    }

    updateSession(windowId, {
      messages: [...session.messages, userMsg, assistantMsg],
      isRunning: false
    })
  }

  return (
    <WindowManager
      windows={windows}
      theme={darkTheme}
      renderWindow={(window) => (
        <ChatWindow
          session={window.data}
          title={window.title}
          theme={darkTheme}
          windowId={window.id}
          onSendMessage={(msg) => handleSendMessage(window.id, msg)}
          onClose={() => closeWindow(window.id)}
        />
      )}
      onWindowClose={closeWindow}
    />
  )
}
```

### Pattern 2: Embedding-Enhanced Chat

```typescript
function EmbeddingChat() {
  const [selectedEmbeddings, setSelectedEmbeddings] = useState<EmbeddingData[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const handleSendWithEmbedding = async (message: string) => {
    // Get embedding
    const embeddingResponse = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    })

    const { embedding } = await embeddingResponse.json()

    const embeddingData: EmbeddingData = {
      id: Date.now().toString(),
      model: 'text-embedding-ada-002',
      dimension: 1536,
      vector: embedding,
      inputText: message,
      timestamp: new Date().toISOString()
    }

    // Create message with embedding
    const msg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      embedding: embeddingData
    }

    // Add to session
    // ... (add message to session state)

    return msg
  }

  const handleCompareEmbeddings = (embeddings: EmbeddingData[]) => {
    setSelectedEmbeddings(embeddings)
    setShowComparison(true)
  }

  return (
    <>
      <ChatWindow
        session={session}
        title="Embedding Chat"
        theme={darkTheme}
        windowId="embed-chat"
        onSendMessage={handleSendWithEmbedding}
      />

      {showComparison && (
        <EmbeddingComparison
          embeddings={selectedEmbeddings}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  )
}
```

### Pattern 3: STT-Only Voice Chat

```typescript
function VoiceChat() {
  const [session, setSession] = useState<ChatSession>({
    id: 'voice-1',
    messages: [],
    isRunning: false
  })

  const handleAudioRecorded = async (audioBlob: Blob, mimeType: string) => {
    // Send to Whisper API
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    })

    const { text } = await response.json()
    return text // Return transcribed text for auto-submit
  }

  return (
    <ChatWindow
      session={session}
      title="Voice Chat"
      theme={darkTheme}
      windowId="voice-1"
      onSendMessage={(msg) => {
        // Handle transcribed text
        console.log('Sending:', msg)
      }}
      onAudioRecorded={handleAudioRecorded}
      enableMicrophone={true}
      disableTextInput={true} // STT-only mode
    />
  )
}
```

### Pattern 4: Synchronized Multi-Window Chat

```typescript
function SyncedChat() {
  const { windows, openWindow } = useWindows()
  const [selectedWindows, setSelectedWindows] = useState<Set<string>>(new Set())

  const handleInputClick = (windowId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+Click to add to selection
      setSelectedWindows(prev => {
        const next = new Set(prev)
        if (next.has(windowId)) {
          next.delete(windowId)
        } else {
          next.add(windowId)
        }
        return next
      })
    } else {
      // Regular click clears selection
      setSelectedWindows(new Set([windowId]))
    }
  }

  return (
    <WindowManager
      windows={windows}
      theme={darkTheme}
      renderWindow={(window) => (
        <ChatWindow
          session={window.data}
          title={window.title}
          theme={darkTheme}
          windowId={window.id}
          onSendMessage={(msg) => {
            // Send to all selected windows
            selectedWindows.forEach(id => {
              handleSendMessage(id, msg)
            })
          }}
          onInputClick={(e) => handleInputClick(window.id, e)}
          isSelected={selectedWindows.has(window.id)}
          selectedWindowIds={selectedWindows}
        />
      )}
      onWindowClose={closeWindow}
    />
  )
}
```

## Integration Guidelines

### 1. Adding to Existing React App

```typescript
// 1. Wrap app with ThemeProvider
import { ThemeProvider, darkTheme } from 'uiwindows'

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <YourApp />
    </ThemeProvider>
  )
}

// 2. Create window management state
import { useWindows, useWorkspaces } from 'uiwindows'

function YourApp() {
  const { windows, openWindow, closeWindow } = useWindows()
  const { saveSessionWorkspace } = useWorkspaces('app-session')

  // 3. Auto-save on changes
  useEffect(() => {
    saveSessionWorkspace(windows)
  }, [windows])

  // 4. Add WindowManager to layout
  return (
    <div className="flex h-screen">
      <Sidebar />
      <WindowManager
        windows={windows}
        theme={darkTheme}
        renderWindow={(window) => (
          <ChatWindow {...window} />
        )}
        onWindowClose={closeWindow}
      />
    </div>
  )
}
```

### 2. Custom Window Content

```typescript
// You can render ANY content in windows, not just ChatWindow
interface CustomWindowData {
  type: 'editor' | 'preview' | 'terminal'
  content: string
}

function CustomApp() {
  const { windows, openWindow } = useWindows()

  const renderCustomWindow = (window: Window<CustomWindowData>) => {
    switch (window.data?.type) {
      case 'editor':
        return <CodeEditor content={window.data.content} />
      case 'preview':
        return <MarkdownPreview content={window.data.content} />
      case 'terminal':
        return <Terminal />
      default:
        return <ChatWindow session={window.data} />
    }
  }

  return (
    <WindowManager
      windows={windows}
      theme={darkTheme}
      renderWindow={renderCustomWindow}
      onWindowClose={closeWindow}
    />
  )
}
```

### 3. Backend Integration

```typescript
// Example: Integrating with Express backend
async function handleSendMessage(sessionId: string, message: string) {
  // 1. Add user message to local state immediately
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: message,
    timestamp: new Date().toISOString()
  }

  updateSession(sessionId, {
    messages: [...session.messages, userMsg],
    isRunning: true
  })

  // 2. Send to backend via SSE for streaming
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message,
      messages: session.messages
    })
  })

  // 3. Handle streaming response
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let assistantContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    assistantContent += chunk

    // Update message in real-time
    updateSession(sessionId, {
      messages: [...session.messages, userMsg, {
        id: 'assistant-' + Date.now(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      }],
      isRunning: true
    })
  }

  // 4. Mark as complete
  updateSession(sessionId, {
    isRunning: false
  })
}
```

## Performance Considerations

### 1. Memoization

```typescript
// Memoize expensive render functions
const renderWindow = useCallback((window: Window) => {
  return (
    <ChatWindow
      session={window.data}
      title={window.title}
      theme={theme}
      windowId={window.id}
      onSendMessage={handleSendMessage}
    />
  )
}, [theme, handleSendMessage])

// Memoize complex calculations
const borderColor = useMemo(() => {
  return getBorderColorForModel(window.data.model)
}, [window.data.model])
```

### 2. Virtual Scrolling for Large Message Lists

```typescript
// For very long conversations (1000+ messages), consider virtualization
import { FixedSizeList } from 'react-window'

function VirtualizedMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MessageBubble message={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

### 3. Debounce Workspace Saves

```typescript
// Don't save on every keystroke
const debouncedSave = useMemo(
  () => debounce((windows: Window[]) => {
    saveSessionWorkspace(windows)
  }, 1000),
  []
)

useEffect(() => {
  debouncedSave(windows)
}, [windows])
```

## Troubleshooting Guide

### Issue 1: Windows not rendering

**Symptom**: WindowManager shows "No windows open" even after calling `openWindow`

**Cause**: Not applying windows from hook to WindowManager

**Solution**:
```typescript
const { windows, openWindow } = useWindows()

return (
  <WindowManager
    windows={windows} // ✅ Pass windows from hook
    theme={darkTheme}
    renderWindow={renderWindow}
  />
)
```

### Issue 2: Multi-window sync not working

**Symptom**: Typing in one window doesn't update others

**Cause**: Not passing `isSelected` and `selectedWindowIds` props

**Solution**:
```typescript
<ChatWindow
  windowId={window.id}
  isSelected={selectedWindows.has(window.id)} // ✅ Required for sync
  selectedWindowIds={selectedWindows} // ✅ Required for sync
  onInputClick={handleInputClick} // ✅ Required for selection
  // ... other props
/>
```

### Issue 3: Audio recording not working

**Symptom**: Microphone button shows error or doesn't record

**Cause**: Missing permissions or unsupported browser

**Solution**:
1. Check HTTPS (required for getUserMedia)
2. Ensure microphone permissions granted
3. Check browser compatibility (Chrome/Firefox/Safari 14.5+)
4. Add error handling:

```typescript
const handleAudioRecorded = async (blob: Blob, mimeType: string) => {
  try {
    const text = await transcribeAudio(blob)
    return text
  } catch (error) {
    console.error('Transcription failed:', error)
    alert('Failed to transcribe audio')
    return null
  }
}
```

### Issue 4: Theme not applying

**Symptom**: Components show default colors instead of theme colors

**Cause**: Not wrapped in ThemeProvider or missing theme prop

**Solution**:
```typescript
// Wrap entire app
<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>

// Pass theme to all components
<WindowManager theme={darkTheme} />
<ChatWindow theme={darkTheme} />
<ResizableSidebar theme={darkTheme} />
```

### Issue 5: Workspace not restoring on reload

**Symptom**: Windows disappear after page refresh

**Cause**: Not loading session workspace on mount

**Solution**:
```typescript
const { loadSessionWorkspace } = useWorkspaces('session-id')

useEffect(() => {
  const restore = async () => {
    const workspace = await loadSessionWorkspace()
    workspace.windows.forEach(w => openWindow(w))
  }

  restore()
}, []) // ✅ Run on mount
```

## Advanced Topics

### Custom Event Bus Events

```typescript
// Define custom events for your app
interface AppEvents {
  'model-changed': { windowId: string; model: string }
  'message-starred': { messageId: string; starred: boolean }
  'workspace-exported': { name: string; data: Workspace }
}

// Type-safe event emitters
function emitModelChanged(windowId: string, model: string) {
  eventBus.emit('model-changed', { windowId, model })
}

// Type-safe event listeners
eventBus.on('model-changed', (data: AppEvents['model-changed']) => {
  console.log(`Window ${data.windowId} changed to ${data.model}`)
})
```

### Custom Similarity Metrics

```typescript
// Add your own similarity calculations
import { SimilarityMetrics } from 'uiwindows'

interface ExtendedMetrics extends SimilarityMetrics {
  jaccardSimilarity: number
  pearsonCorrelation: number
}

function calculateExtendedMetrics(a: number[], b: number[]): ExtendedMetrics {
  const base = calculateAllMetrics(a, b)

  return {
    ...base,
    jaccardSimilarity: calculateJaccard(a, b),
    pearsonCorrelation: calculatePearson(a, b)
  }
}
```

### Custom Themes with CSS Variables

```typescript
// Create theme with CSS variables for dynamic switching
const dynamicTheme: Theme = {
  name: 'Dynamic',
  colors: {
    background: 'var(--bg-primary)',
    panel: 'var(--bg-secondary)',
    accent: 'var(--accent)',
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)'
    },
    border: {
      default: 'var(--border-default)',
      hover: 'var(--border-hover)'
    }
  }
}

// Then switch themes by changing CSS variables
document.documentElement.style.setProperty('--bg-primary', '#000000')
document.documentElement.style.setProperty('--accent', '#00ff00')
```

## Summary

UIWindows is a flexible, type-safe window management system designed for building complex multi-panel applications. Key takeaways:

1. **Use hooks for state**: `useWindows` and `useWorkspaces` handle all state logic
2. **Respect types**: TypeScript provides excellent guidance - follow the types
3. **Leverage event bus**: For cross-component communication without prop drilling
4. **Theme everything**: Always use theme colors, never hardcode
5. **Memoize renders**: For optimal performance with many windows
6. **Handle errors**: Especially for browser APIs like microphone access
7. **Auto-save workspaces**: For seamless user experience across sessions

The library is designed to be extended and customized while maintaining type safety and consistency.
