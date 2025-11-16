/**
 * Simple event bus for cross-component communication
 * From AIU implementation - enables decoupled component communication
 */

type EventCallback = (data: any) => void

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map()

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus()
