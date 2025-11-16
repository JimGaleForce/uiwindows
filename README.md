# UIWindows

A complete React window management system with built-in chat support, audio recording, embedding comparison, and responsive grid layouts. Perfect for building IDE-like applications, multi-panel dashboards, or AI chat interfaces.

## Features

- Multi-Panel Windows - Automatic responsive grid layout (1-6+ windows)
- Built-in Chat - Full-featured chat components with message history and markdown support
- Audio Recording - Microphone button with speech-to-text integration
- Embedding Analysis - Visual comparison of semantic embeddings with similarity metrics
- Resizable Sidebar - Drag-to-resize with collapse functionality
- Workspace Management - Save/load window layouts with localStorage persistence
- Window States - Normal, minimized, maximized support
- Multi-Window Sync - Synchronize input across multiple chat windows
- Themeable - Dark/light themes with full customization
- TypeScript - Fully typed for excellent developer experience
- Event Bus - Simple cross-component communication
- Mobile Responsive - Automatic single-column layout on mobile devices

## Installation

```bash
npm install uiwindows
# or
yarn add uiwindows
# or
pnpm add uiwindows
```

## Quick Start

```tsx
import {
  WindowManager,
  ChatWindow,
  ResizableSidebar,
  ThemeProvider,
  useWindows,
  useWorkspaces,
  darkTheme
} from 'uiwindows'

function App() {
  const { windows, openWindow, closeWindow } = useWindows()
  const { saveWorkspace, loadWorkspace } = useWorkspaces('my-session-id')

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex h-screen">
        <ResizableSidebar theme={darkTheme}>
          <h2>Sidebar Content</h2>
          <button onClick={() => saveWorkspace('Layout 1', windows)}>
            Save Layout
          </button>
        </ResizableSidebar>

        <WindowManager
          windows={windows}
          theme={darkTheme}
          renderWindow={(window) => (
            <ChatWindow
              session={window.data}
              title={window.title}
              theme={darkTheme}
              windowId={window.id}
              onSendMessage={(msg) => console.log('Send:', msg)}
            />
          )}
          onWindowClose={closeWindow}
        />
      </div>
    </ThemeProvider>
  )
}
```

## Core Components

### WindowManager

Main container for managing multiple windows with automatic grid layout.

```tsx
<WindowManager
  windows={windows}
  theme={theme}
  renderWindow={(window) => <YourContent {...window.data} />}
  getBorderColor={(window) => window.isActive ? 'green' : 'gray'}
  getSubtitle={(window) => window.data?.subtitle}
  onWindowClose={handleClose}
  onWindowMinimize={handleMinimize}
  onWindowMaximize={handleMaximize}
  onWindowRestore={handleRestore}
  isWindowRunning={(windowId) => runningWindows.has(windowId)}
/>
```

**Props:**
- `windows`: Array of window objects to display
- `theme`: Theme configuration object
- `renderWindow`: Function to render window content
- `getBorderColor?`: Function to determine border color based on window state
- `getSubtitle?`: Function to get subtitle for minimized windows
- `onWindowClose?`: Callback when window is closed
- `onWindowMinimize?`: Callback when window is minimized
- `onWindowMaximize?`: Callback when window is maximized
- `onWindowRestore?`: Callback when window is restored
- `isWindowRunning?`: Function to check if a window is processing

**Grid Layout:**
- 1 window: Full width
- 2 windows: 2 columns on desktop, stacked on mobile
- 3 windows: 2 top, 1 bottom (spanning 2 columns) on desktop
- 4 windows: 2x2 grid on desktop
- 5-6 windows: 2-3 columns based on screen size
- Responsive breakpoints: 1024px (lg), 1280px (xl)

### ChatWindow

Complete chat interface with message history, input, and header controls.

```tsx
<ChatWindow
  session={{
    id: '1',
    messages: [],
    isRunning: false,
    contextUsage: {
      totalInputTokens: 1500,
      contextWindow: 8000,
      percentUsed: 18.75
    }
  }}
  title="Chat Window"
  subtitle="gpt-4"
  theme={theme}
  windowId="window-1"
  onSendMessage={(msg, images) => {/* send to LLM */}}
  onAudioRecorded={async (blob, mimeType) => {
    const text = await transcribeAudio(blob)
    return text
  }}
  onStop={() => {/* stop generation */}}
  onSettings={() => {/* open settings */}}
  onClear={() => {/* clear messages */}}
  onArchive={() => {/* archive chat */}}
  onExport={() => {/* export chat */}}
  onImport={() => {/* import chat */}}
  onShowCodeExamples={() => {/* show examples */}}
  enableImages={true}
  enableMicrophone={true}
  enableAudioUpload={false}
  disableTextInput={false}
/>
```

**Key Props:**
- `session`: Chat session data (messages, running state, context usage)
- `windowId`: Unique window identifier for multi-window sync
- `onSendMessage`: Callback for sending messages with optional images
- `onAudioRecorded?`: Async callback for handling recorded audio, returns transcribed text
- `enableImages?`: Enable image attachments (default: true)
- `enableMicrophone?`: Enable microphone recording (default: true)
- `enableAudioUpload?`: Enable audio file upload for STT (default: false)
- `disableTextInput?`: Disable text input for STT-only mode (default: false)
- `onInputClick?`: Input click handler with modifier keys for multi-window selection
- `isSelected?`: Whether window is part of multi-selection
- `selectedWindowIds?`: Set of selected window IDs for sync coordination

**Multi-Window Sync:**
Chat windows support synchronizing input across multiple windows. When windows are selected (via `isSelected` and `selectedWindowIds`), typing in one window updates all selected windows using the event bus.

### MicrophoneButton

Audio recording button with visual feedback and time display.

```tsx
<MicrophoneButton
  onAudioRecorded={(audioBlob, mimeType) => {
    console.log('Recorded:', audioBlob.size, 'bytes as', mimeType)
    // Send to speech-to-text API
  }}
  disabled={isRunning}
  className="my-custom-class"
/>
```

**Features:**
- Uses WebM with Opus codec for best browser support
- Visual recording indicator with elapsed time
- Automatic microphone permissions request
- Stops all audio tracks on completion

### EmbeddingComparison

Visual panel for comparing semantic embeddings with similarity metrics.

```tsx
<EmbeddingComparison
  embeddings={[
    {
      id: '1',
      model: 'text-embedding-ada-002',
      dimension: 1536,
      vector: [0.1, 0.2, ...],
      inputText: 'First message',
      timestamp: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      model: 'text-embedding-ada-002',
      dimension: 1536,
      vector: [0.15, 0.25, ...],
      inputText: 'Second message',
      timestamp: '2024-01-01T00:01:00Z'
    }
  ]}
  onClose={() => setShowComparison(false)}
/>
```

**Metrics Displayed:**
- **Cosine Similarity**: 1 = identical direction, 0 = orthogonal, -1 = opposite
- **Euclidean Distance**: 0 = identical, lower is more similar
- **Dot Product**: Higher values indicate more similarity
- **Manhattan Distance**: 0 = identical, lower is more similar

Each metric includes visual indicators (trending up/down/neutral) based on similarity level.

### ResizableSidebar

Sidebar with drag-to-resize and collapse functionality.

```tsx
<ResizableSidebar
  theme={theme}
  minWidth={200}
  maxWidth={600}
  defaultWidth={256}
  storageKey="my-sidebar-width"
  collapsedLabel="Projects"
>
  <div className="p-4">
    <h2>Sidebar Content</h2>
    <nav>{/* navigation items */}</nav>
  </div>
</ResizableSidebar>
```

**Features:**
- Drag handle for resizing
- Collapse/expand button
- Persists width and collapsed state to localStorage
- Smooth transitions
- Hover effects on resize handle

## Hooks

### useWindows

Manage window state (open, close, minimize, maximize, restore).

```tsx
const {
  windows,
  openWindow,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  restoreWindow,
  updateWindow
} = useWindows()

// Open a new window
openWindow({
  id: 'chat-1',
  title: 'Chat',
  content: <ChatWindow />,
  borderColor: '#D4FF48',
  data: { sessionId: '123' }
})

// Close a window
closeWindow('chat-1')

// Minimize a window
minimizeWindow('chat-1')

// Maximize a window
maximizeWindow('chat-1')

// Restore to normal state
restoreWindow('chat-1')

// Update window properties
updateWindow('chat-1', { title: 'New Title', borderColor: '#FF0000' })
```

### useWorkspaces

Save and load window layouts with localStorage persistence.

```tsx
const {
  savedWorkspaces,
  currentWorkspaceName,
  isDirty,
  saveWorkspace,
  loadWorkspace,
  deleteWorkspace,
  renameWorkspace,
  loadSessionWorkspace,
  saveSessionWorkspace
} = useWorkspaces('unique-session-id')

// Save current layout
await saveWorkspace('My Layout', windows)

// Load a saved layout
const loadedWindows = await loadWorkspace('My Layout')
if (loadedWindows) {
  // Apply loaded windows to your state
}

// Delete a workspace
await deleteWorkspace('My Layout')

// Rename a workspace
await renameWorkspace('My Layout', 'New Name')

// Load session-specific workspace (auto-restores on page load)
const sessionWorkspace = await loadSessionWorkspace()

// Save current session state
saveSessionWorkspace(windows, closedIds, collapsedIds)
```

## Theming

Customize the look and feel with themes.

### Using Built-in Themes

```tsx
import { ThemeProvider, darkTheme, lightTheme } from 'uiwindows'

<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>
```

### Creating Custom Themes

```tsx
import { Theme } from 'uiwindows'

const customTheme: Theme = {
  name: 'Custom Dark',
  colors: {
    background: '#000000',
    panel: '#111111',
    accent: '#00ff00',
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      muted: '#888888'
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(0, 255, 0, 0.3)'
    }
  }
}

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Using Theme in Components

```tsx
import { useTheme } from 'uiwindows'

function MyComponent() {
  const theme = useTheme()

  return (
    <div style={{ backgroundColor: theme.colors.panel }}>
      <h1 style={{ color: theme.colors.text.primary }}>
        Themed Content
      </h1>
    </div>
  )
}
```

### Available Themes

- `darkTheme`: Dark theme with lime accent (#D4FF48)
- `lightTheme`: Light theme with green accent (#4CAF50)

## TypeScript

Fully typed with excellent IntelliSense support.

### Window Types

```tsx
import type { Window, ChatSession, Theme } from 'uiwindows'

interface MyWindowData {
  chatSession: ChatSession
  userId: string
  model: string
}

const window: Window<MyWindowData> = {
  id: '1',
  title: 'Chat',
  content: <ChatWindow />,
  state: 'normal',
  order: 0,
  borderColor: '#D4FF48',
  data: {
    chatSession: {
      id: '1',
      messages: [],
      isRunning: false
    },
    userId: 'user-123',
    model: 'gpt-4'
  }
}
```

### Chat Message Types

```tsx
import type { ChatMessage, AttachedImage, AttachedAudio, EmbeddingData } from 'uiwindows'

const message: ChatMessage = {
  id: '1',
  type: 'user',
  content: 'Hello, world!',
  timestamp: new Date().toISOString(),
  images: [{
    id: 'img-1',
    name: 'screenshot.png',
    data: 'base64-encoded-data',
    mediaType: 'image/png',
    size: 12345,
    preview: 'base64-preview'
  }],
  audio: {
    id: 'audio-1',
    data: 'base64-encoded-audio',
    format: 'wav',
    duration: 5.2
  },
  embedding: {
    id: 'emb-1',
    model: 'text-embedding-ada-002',
    dimension: 1536,
    vector: [0.1, 0.2, /* ... */],
    inputText: 'Hello, world!',
    timestamp: new Date().toISOString()
  }
}
```

### All Exported Types

```tsx
import type {
  // Core
  Window,
  WindowState,
  WindowManagerConfig,
  Theme,
  ThemeColors,

  // Chat
  ChatMessage,
  ChatSession,
  AttachedImage,
  AttachedAudio,
  EmbeddingData,

  // Sidebar
  SidebarItem,
  SidebarConfig,

  // Workspace
  Workspace,
  SavedWorkspace,

  // Hooks
  UseWindowsReturn,
  UseWorkspacesReturn,
} from 'uiwindows'
```

## Utilities

### Similarity Functions

Calculate vector similarity for embedding comparison.

```tsx
import {
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
  manhattanDistance,
  calculateAllMetrics
} from 'uiwindows'

const vector1 = [0.1, 0.2, 0.3]
const vector2 = [0.15, 0.25, 0.35]

// Individual metrics
const similarity = cosineSimilarity(vector1, vector2)
const distance = euclideanDistance(vector1, vector2)
const product = dotProduct(vector1, vector2)
const manhattan = manhattanDistance(vector1, vector2)

// All metrics at once
const metrics = calculateAllMetrics(vector1, vector2)
// {
//   cosineSimilarity: 0.999847,
//   euclideanDistance: 0.086603,
//   dotProduct: 0.245,
//   manhattanDistance: 0.15
// }
```

**Functions:**
- `cosineSimilarity(a, b)`: Returns -1 to 1 (1 = identical direction)
- `euclideanDistance(a, b)`: Returns 0+ (0 = identical)
- `dotProduct(a, b)`: Higher = more similar
- `manhattanDistance(a, b)`: Returns 0+ (0 = identical)
- `calculateAllMetrics(a, b)`: Returns all four metrics
- `formatMetric(value, metric)`: Format metric for display
- `getMetricDescription(metric)`: Get human-readable description

### Event Bus

Simple event bus for cross-component communication.

```tsx
import { eventBus } from 'uiwindows'

// Subscribe to event
eventBus.on('sync-input', (data) => {
  console.log('Input synced:', data)
})

// Emit event
eventBus.emit('sync-input', {
  windowId: 'window-1',
  text: 'Hello'
})

// Unsubscribe
const callback = (data) => console.log(data)
eventBus.on('my-event', callback)
eventBus.off('my-event', callback)

// Clear all listeners for an event
eventBus.clear('my-event')

// Clear all listeners for all events
eventBus.clear()
```

**Events Used Internally:**
- `sync-input`: Multi-window input synchronization

## Examples

### Basic Multi-Window Chat

```tsx
import { WindowManager, ChatWindow, useWindows, darkTheme } from 'uiwindows'

function ChatApp() {
  const { windows, openWindow, closeWindow, maximizeWindow, restoreWindow } = useWindows()
  const [sessions, setSessions] = useState(new Map())

  const handleSendMessage = (windowId: string, message: string) => {
    const session = sessions.get(windowId)
    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setSessions(new Map(sessions.set(windowId, {
      ...session,
      messages: [...session.messages, newMessage]
    })))
  }

  return (
    <WindowManager
      windows={windows}
      theme={darkTheme}
      renderWindow={(window) => (
        <ChatWindow
          session={sessions.get(window.id)}
          title={window.title}
          theme={darkTheme}
          windowId={window.id}
          onSendMessage={(msg) => handleSendMessage(window.id, msg)}
          onClose={() => closeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onRestore={() => restoreWindow(window.id)}
        />
      )}
      onWindowClose={closeWindow}
    />
  )
}
```

### With Sidebar and Workspaces

```tsx
import {
  WindowManager,
  ChatWindow,
  ResizableSidebar,
  useWindows,
  useWorkspaces,
  darkTheme
} from 'uiwindows'

function App() {
  const { windows, openWindow, closeWindow } = useWindows()
  const {
    savedWorkspaces,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace
  } = useWorkspaces('my-app-session')

  return (
    <div className="flex h-screen">
      <ResizableSidebar theme={darkTheme}>
        <div className="p-4">
          <h2 className="text-white mb-4">Workspaces</h2>

          <button
            onClick={() => saveWorkspace('Current Layout', windows)}
            className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Layout
          </button>

          <div className="space-y-2">
            {savedWorkspaces.map(ws => (
              <div key={ws.name} className="flex gap-2">
                <button
                  onClick={async () => {
                    const loaded = await loadWorkspace(ws.name)
                    if (loaded) {
                      // Apply loaded windows
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded"
                >
                  {ws.name}
                </button>
                <button
                  onClick={() => deleteWorkspace(ws.name)}
                  className="px-3 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </ResizableSidebar>

      <WindowManager
        windows={windows}
        theme={darkTheme}
        renderWindow={(window) => (
          <ChatWindow
            session={window.data}
            title={window.title}
            theme={darkTheme}
            windowId={window.id}
            onSendMessage={(msg) => console.log('Send:', msg)}
          />
        )}
        onWindowClose={closeWindow}
      />
    </div>
  )
}
```

### With Audio Recording

```tsx
import { ChatWindow, MicrophoneButton } from 'uiwindows'

function ChatWithAudio() {
  const [session, setSession] = useState({
    id: '1',
    messages: [],
    isRunning: false
  })

  const handleAudioRecorded = async (audioBlob: Blob, mimeType: string) => {
    // Send to speech-to-text API
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    const { text } = await response.json()
    return text // Return transcribed text
  }

  return (
    <ChatWindow
      session={session}
      title="Voice Chat"
      theme={darkTheme}
      windowId="voice-1"
      onSendMessage={(msg) => console.log('Send:', msg)}
      onAudioRecorded={handleAudioRecorded}
      enableMicrophone={true}
    />
  )
}
```

### With Embedding Comparison

```tsx
import { ChatWindow, EmbeddingComparison } from 'uiwindows'

function ChatWithEmbeddings() {
  const [selectedEmbeddings, setSelectedEmbeddings] = useState([])
  const [showComparison, setShowComparison] = useState(false)

  const handleMessageWithEmbedding = async (message: string) => {
    // Get embedding from API
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    })

    const { embedding } = await response.json()

    return {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      embedding: {
        id: Date.now().toString(),
        model: 'text-embedding-ada-002',
        dimension: 1536,
        vector: embedding,
        inputText: message,
        timestamp: new Date().toISOString()
      }
    }
  }

  return (
    <>
      <ChatWindow
        session={session}
        title="Chat with Embeddings"
        theme={darkTheme}
        windowId="embed-1"
        onSendMessage={async (msg) => {
          const messageWithEmbedding = await handleMessageWithEmbedding(msg)
          // Add to session
        }}
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

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.5+ for audio recording)
- **Mobile**: Responsive design with touch support

**Requirements:**
- React 18.2.0+
- Modern browser with ES6+ support
- WebRTC support for audio recording (optional feature)

## Styling

UIWindows uses Tailwind CSS classes internally. Make sure your project has Tailwind CSS configured, or the components will fall back to inline styles where possible.

### Tailwind Configuration

Add to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/uiwindows/**/*.{js,jsx,ts,tsx}' // Include uiwindows
  ],
  // ... rest of config
}
```

## License

MIT License - see LICENSE file for details

## Author

Jim Gale

## Contributing

Contributions are welcome! Please open an issue or pull request on GitHub.

## Support

- GitHub Issues: https://github.com/yourusername/uiwindows/issues
- Documentation: https://github.com/yourusername/uiwindows#readme
