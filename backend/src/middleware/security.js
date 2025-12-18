import helmet from 'helmet';
export function setupSecurityHeaders(app) {
    // Use helmet for standard security headers
    app.use(helmet());
    // Custom headers
    app.use((req, res, next) => {
        // Strict Content Security Policy
        res.setHeader('Content-Security-Policy', "default-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' https:; " +
            "connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov https://www.nasa.gov https://www.esa.int https://www.space.com https://arxiv.org; " +
            "font-src 'self'; " +
            "frame-ancestors 'none';");
        // Additional security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    });
}
