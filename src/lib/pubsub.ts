type EventCallback = (...args: unknown[]) => void;

class PubSub {
  private events: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  publish(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  unsubscribe(event: string): void {
    this.events.delete(event);
  }
}

export const pubsub = new PubSub();

// Toast events
export const TOAST_EVENTS = {
  SHOW_TOAST: 'show_toast',
} as const;

export interface ToastData {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
