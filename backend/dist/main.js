"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
const security_1 = require("./middleware/security");
const planets_1 = __importDefault(require("./routes/planets"));
const news_1 = __importDefault(require("./routes/news"));
const settings_1 = __importDefault(require("./routes/settings"));
// Load environment variables
dotenv_1.default.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const app = (0, express_1.default)();
const PORT = parseInt(process.env.API_PORT || '5001', 10);
// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================
// Security headers (helmet + CSP)
(0, security_1.setupSecurityHeaders)(app);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// CORS (allow frontend dev server)
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
        logger_1.default.info('HTTP Request', {
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
    logger_1.default.error('Unhandled Error', {
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
app.use('/api/planets', planets_1.default);
app.use('/api/news', news_1.default);
app.use('/api/settings', settings_1.default);
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
const server = app.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`🚀 Esther Backend Server Started`, {
        port: PORT,
        host: '0.0.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, gracefully shutting down');
    server.close(() => {
        logger_1.default.info('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, gracefully shutting down');
    server.close(() => {
        logger_1.default.info('Server closed');
        process.exit(0);
    });
});
