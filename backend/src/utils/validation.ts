import { URL as URLClass } from 'url';

/**
 * Validate URL for SSRF attacks
 * - Only allow http/https
 * - Block localhost/private IPs
 * - Block reserved IP ranges
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URLClass(urlString);

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
  } catch (error) {
    console.warn(`Invalid URL format: ${urlString}`);
    return false;
  }
}

/**
 * Validate planet/asteroid body name (alphanumeric + spaces/hyphens only)
 */
export function validateBodyName(bodyName: string): boolean {
  if (typeof bodyName !== 'string') return false;
  if (bodyName.length === 0 || bodyName.length > 100) return false;

  // Only allow: letters, numbers, spaces, hyphens, parentheses
  return /^[a-zA-Z0-9\s\-()]+$/.test(bodyName);
}

/**
 * Sanitize numeric input with range validation
 */
export function validateNumberInRange(
  value: any,
  min: number,
  max: number
): number | null {
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
