/**
 * Validate URL for SSRF attacks
 * - Only allow http/https
 * - Block localhost/private IPs
 * - Block reserved IP ranges
 */
export declare function isValidUrl(urlString: string): boolean;
/**
 * Validate planet/asteroid body name (alphanumeric + spaces/hyphens only)
 */
export declare function validateBodyName(bodyName: string): boolean;
/**
 * Sanitize numeric input with range validation
 */
export declare function validateNumberInRange(value: any, min: number, max: number): number | null;
