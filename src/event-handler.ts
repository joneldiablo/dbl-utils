type EventCallback = (...data: any[]) => any | Function;

interface Pattern {
  pattern: RegExp;
  callbacks: Array<[EventCallback, string]>;
}

/**
 * Class EventHandler to manage event subscriptions and dispatching.
 */
export class EventHandler {
  private events: Record<string, Array<[EventCallback, string]>>;
  private patterns: Array<Pattern>;
  private cache: Record<string, Array<[EventCallback, string]>>;

  /**
   * Construct an instance of EventHandler.
   */
  constructor() {
    this.events = {};
    this.patterns = [];
    this.cache = {};
  }

  /**
   * Converts a wildcard string to a regular expression.
   * @param wildcardString - The wildcard string to convert.
   * @returns A RegExp object.
   */
  private wildcardToRegExp(wildcardString: string): RegExp {
    return new RegExp('^' + wildcardString.split('*').map(this.escapeRegExp).join('.*') + '$');
  }

  /**
   * Escapes special characters in a string for use in a regular expression.
   * @param string - The string to escape.
   * @return The escaped string.
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Dispatches an event to all subscribed callbacks.
   * @param event - The event name to dispatch.
   * @param data - Data to be passed to the callback function.
   * @returns A promise resolved with an array of callback responses.
   */
  async dispatch(event: string, ...data: any[]): Promise<any[]> {
    if (this.cache[event]) {
      const promises = this.cache[event].map(([callback, id]) => callback(...data, id));
      return await Promise.all(promises);
    }

    const callbacks = this.events[event] || [];
    const matchedPatterns = this.patterns.filter(({ pattern }) => pattern.test(event)).flatMap(p => p.callbacks);
    
    this.cache[event] = [...callbacks, ...matchedPatterns];

    const allCallbacks = [...callbacks, ...matchedPatterns];
    const promises = allCallbacks.map(([callback, id]) => callback(...data, id));
    return await Promise.all(promises);
  }

  /**
   * Subscribes to an event or a pattern of events.
   * @param eventString - The event name or pattern to subscribe to.
   * @param callback - The callback function to execute when the event is dispatched.
   * @param id - An identifier for the subscription, used for unsubscribing.
   */
  subscribe(eventString: string, callback: EventCallback, id: string): void {
    const events = eventString.split(/[\s,]+/);
    events.forEach(e => {
      if (e.includes('*')) {
        // Handle wildcard patterns
        const regex = this.wildcardToRegExp(e);
        const existingPattern = this.patterns.find(p => p.pattern.source === regex.source);
        if (existingPattern) {
          existingPattern.callbacks.push([callback, id]);
        } else {
          this.patterns.push({ pattern: regex, callbacks: [[callback, id]] });
        }
      } else {
        // Handle direct event subscriptions
        if (!this.events[e]) this.events[e] = [];
        this.events[e].push([callback, id]);
        if (!this.cache[e]) this.cache[e] = [];
        this.cache[e].push([callback, id]);
      }
    });
  }

  /**
   * Unsubscribes from an event or pattern of events.
   * @param eventString - The event name or pattern to unsubscribe from.
   * @param id - The identifier of the subscription to remove.
   */
  unsubscribe(eventString: string, id: string): void {
    const events = eventString.split(/[\s,]+/);
    events.forEach(e => {
      if (e.includes('*')) {
        const regex = this.wildcardToRegExp(e);
        this.patterns = this.patterns.filter(pattern => {
          if (pattern.pattern.source !== regex.source) return true;
          pattern.callbacks = pattern.callbacks.filter(([, callbackId]) => callbackId !== id);
          return pattern.callbacks.length > 0;
        });
        this.updateCacheWithPattern(regex, id);
      } else {
        if (!this.events[e]) return;
        this.events[e] = this.events[e].filter(([, eventId]) => eventId !== id);
        this.updateCache(e, id);
      }
    });
  }

  /**
   * Remove an event or pattern from the cache based on id.
   * @param event - The event name or pattern.
   * @param id - The identifier of the subscription to remove from the cache.
   */
  private updateCache(event: string, id: string): void {
    if (this.cache[event]) {
      this.cache[event] = this.cache[event].filter(([, eventId]) => eventId !== id);
      if (this.cache[event].length === 0) {
        delete this.cache[event];
      }
    }
  }

  /**
   * Update cache by removing pattern-matching events based on id.
   * @param regex - The regular expression pattern to match against.
   * @param id - The identifier for the subscription to be removed from the cache.
   */
  private updateCacheWithPattern(regex: RegExp, id: string): void {
    Object.keys(this.cache).forEach(cacheEvent => {
      if (regex.test(cacheEvent)) {
        this.cache[cacheEvent] = this.cache[cacheEvent].filter(([, callbackId]) => callbackId !== id);
        if (this.cache[cacheEvent].length === 0) {
          delete this.cache[cacheEvent];
        }
      }
    });
  }
}

export default new EventHandler();
