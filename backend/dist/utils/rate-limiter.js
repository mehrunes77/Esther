"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueApiCall = exports.apiQueue = void 0;
const p_queue_1 = __importDefault(require("p-queue"));
// Allow 50 requests per minute
exports.apiQueue = new p_queue_1.default({
    interval: 60000,
    intervalCap: 50,
    concurrency: 2,
    timeout: 15000, // 15 second timeout per request
});
async function queueApiCall(fn, name = 'API Call') {
    console.log(`Queued: ${name}`);
    const result = await exports.apiQueue.add(fn);
    return result;
}
exports.queueApiCall = queueApiCall;
