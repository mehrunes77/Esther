"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNumberInRange = exports.validateBodyName = exports.isValidUrl = void 0;
const url_1 = require("url");
/**
 * Validate URL for SSRF attacks
 * - Only allow http/https
 * - Block localhost/private IPs
 * - Block reserved IP ranges
 */
function isValidUrl(urlString) {
    try {
        const url = new url_1.URL(urlString);
        // Only allow http/https
        if (!['http:', 'https:'].includes(url.protocol)) {
            console.warn(`Invalid protocol: ${url.protocol}`);
            return false;
        }
        // Block localhost/private IPs
        const hostname = url.hostname;
        const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
        if (blockedHosts.includes(hostname)) {
            console.warn(`Blocked private hostname: ${hostname}`);
            return false;
        }
        // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
        const privateIpPattern = /^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./;
        if (privateIpPattern.test(hostname)) {
            console.warn(`Blocked private IP: ${hostname}`);
            return false;
        }
        return true;
    }
    catch (error) {
        console.warn(`Invalid URL format: ${urlString}`);
        return false;
    }
}
exports.isValidUrl = isValidUrl;
/**
 * Validate planet/asteroid body name (alphanumeric + spaces/hyphens only)
 */
function validateBodyName(bodyName) {
    if (typeof bodyName !== 'string')
        return false;
    if (bodyName.length === 0 || bodyName.length > 100)
        return false;
    // Only allow: letters, numbers, spaces, hyphens, parentheses
    return /^[a-zA-Z0-9\s\-()]+$/.test(bodyName);
}
exports.validateBodyName = validateBodyName;
/**
 * Sanitize numeric input with range validation
 */
function validateNumberInRange(value, min, max) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        console.warn(`Invalid number: ${value}`);
        return null;
    }
    if (num < min || num > max) {
        console.warn(`Number out of range: ${num} (${min}-${max})`);
        return null;
    }
    return num;
}
exports.validateNumberInRange = validateNumberInRange;
