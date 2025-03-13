import { md5 } from 'js-md5';

/**
 * Options for the fetch request.
 */
interface RequestOptions {
  url: string;
  options?: RequestInit;
  resolve: ((value: any) => void)[];
  reject: ((reason?: any) => void)[];
}

/**
 * A queue to manage fetch requests with unique identification.
 */
export default class FetchQueue {
  private queue: Record<string, RequestOptions> = {};
  private isRunning: boolean = false;
  private fetchFn: (url: string, options?: RequestInit) => Promise<any>;

  /**
   * 
   * @param {Function} fetchFn - A fetch function (e.g., node-fetch or window.fetch).
   */
  constructor(fetchFn: (url: string, options?: RequestInit) => Promise<any>) {
    this.fetchFn = fetchFn;
  }

  /**
   * Adds a fetch request to the queue.
   * @param {string} url - The URL to fetch.
   * @param {RequestInit} [options] - Optional fetch options.
   * @returns {Promise<any>} - A promise that resolves with the fetch response.
   */
  public addRequest(url: string, options?: RequestInit): Promise<any> {
    const hash = this.createHash(url, options);

    if (this.queue[hash]) {
      return new Promise((resolve, reject) => {
        this.queue[hash].resolve.push(resolve);
        this.queue[hash].reject.push(reject);
      });
    }

    return new Promise((resolve, reject) => {
      this.queue[hash] = { url, options, resolve: [resolve], reject: [reject] };
      this.runQueue();
    });
  }

  /**
   * Runs the queue of fetch requests.
   */
  private async runQueue(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (Object.keys(this.queue).length > 0) {
      const hash = Object.keys(this.queue)[0];
      const { url, options, resolve, reject } = this.queue[hash];

      try {
        const response = await this.fetchFn(url, options);
        resolve.forEach(r => r(response));
        delete this.queue[hash];
      } catch (error) {
        reject.forEach(r => r(error));
        delete this.queue[hash];
      }
    }

    this.isRunning = false;
  }

  /**
   * Creates a hash to uniquely identify a request.
   * @param {string} url - The URL to fetch.
   * @param {RequestInit} [options] - Optional fetch options.
   * @returns {string} - A hash representing the unique request.
   */
  private createHash(url: string, options?: RequestInit): string {
    const optionsString = JSON.stringify(options || {});
    return md5(url + optionsString);
  }
}
