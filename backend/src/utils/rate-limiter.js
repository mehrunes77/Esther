import PQueue from 'p-queue';
// Allow 50 requests per minute
export const apiQueue = new PQueue({
    interval: 60000,
    intervalCap: 50,
    concurrency: 2,
    timeout: 15000, // 15 second timeout per request
});
export async function queueApiCall(fn, name = 'API Call') {
    console.log(`Queued: ${name}`);
    return apiQueue.add(fn);
}
