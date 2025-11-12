import PQueue from 'p-queue';

// Allow 50 requests per minute
export const apiQueue = new PQueue({
  interval: 60000,        // 1 minute
  intervalCap: 50,        // 50 requests max
  concurrency: 2,         // 2 concurrent requests
  timeout: 15000,         // 15 second timeout per request
});

export async function queueApiCall<T>(
  fn: () => Promise<T>,
  name: string = 'API Call'
): Promise<T> {
  console.log(`Queued: ${name}`);
  return apiQueue.add(fn);
}
