import PQueue from 'p-queue';
export declare const apiQueue: PQueue<import("p-queue/dist/priority-queue").default, import("p-queue").QueueAddOptions>;
export declare function queueApiCall<T>(fn: () => Promise<T>, name?: string): Promise<T>;
