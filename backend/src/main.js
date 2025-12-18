import express from 'express';
import dotenv from 'dotenv';
import { setupSecurityHeaders } from './middleware/security.js';
import planetsRouter from './routes/planets.js';
import newsRouter from './routes/news.js';
import settingsRouter from './routes/settings.js';
// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 5001;
// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================
// Security headers (helmet + CSP)
setupSecurityHeaders(app);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// CORS (allow Electron dev server and frontend on 3001)
app.use((req, res, next) => {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',');
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.info('HTTP Request', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
});
// ============================================================================
// ROUTES
// ============================================================================
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/planets', planetsRouter);
app.use('/api/news', newsRouter);
app.use('/api/settings', settingsRouter);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        message: 'This endpoint does not exist',
    });
});
// ============================================================================
// SERVER STARTUP
// ============================================================================
const server = app.listen(PORT, () => {
    console.log(`🚀 Esther Backend Server Started on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM received, gracefully shutting down');
    server.close(() => {
        console.info('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.info('SIGINT received, gracefully shutting down');
    server.close(() => {
        console.info('Server closed');
        process.exit(0);
    });
});
export default app;
