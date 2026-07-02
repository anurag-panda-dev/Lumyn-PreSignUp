#!/usr/bin/env node

// ========================================
// LUMYN BAND - LOCAL DEVELOPMENT SERVER
// Simple HTTP server for static files
// For local dev - no database required
// ========================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// In-memory storage for demo (dev only)
const demoEmails = new Set();

// MIME types
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

// Demo signup handler (no database required for local dev)
function handleSignup(reqBody) {
    try {
        const { email } = JSON.parse(reqBody);

        // Validation
        if (!email || typeof email !== 'string') {
            return {
                status: 400,
                data: { message: 'Email is required' }
            };
        }

        const sanitizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitizedEmail)) {
            return {
                status: 400,
                data: { message: 'Invalid email format' }
            };
        }

        if (sanitizedEmail.length > 255) {
            return {
                status: 400,
                data: { message: 'Email too long' }
            };
        }

        // Check if already registered (demo only)
        if (demoEmails.has(sanitizedEmail)) {
            return {
                status: 409,
                data: { message: 'This email is already registered for early access' }
            };
        }

        // Add to demo storage
        demoEmails.add(sanitizedEmail);
        console.log(`✓ Demo signup: ${sanitizedEmail} (Total: ${demoEmails.size})`);

        return {
            status: 201,
            data: {
                message: 'Successfully registered for early access',
                subscriber: {
                    id: Math.random().toString(36).substr(2, 9),
                    email: sanitizedEmail,
                    created_at: new Date().toISOString()
                }
            }
        };

    } catch (error) {
        console.error('Signup error:', error);
        return {
            status: 500,
            data: { message: 'An error occurred processing your request. Please try again later.' }
        };
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API Routes
    if (pathname === '/api/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const result = handleSignup(body);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.data));
        });
        return;
    }

    // Static file serving
    let filePath = path.join(ROOT_DIR, pathname);

    // Default to index.html for root
    if (pathname === '/') {
        filePath = path.join(ROOT_DIR, 'index.html');
    }

    // Security: prevent directory traversal and API/script access
    if (!filePath.startsWith(ROOT_DIR) || 
        filePath.includes('/api/') || 
        filePath.includes('/scripts/') ||
        filePath.includes('/node_modules/')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Try index.html for directories
                const indexPath = path.join(filePath, 'index.html');
                fs.readFile(indexPath, (innerErr, indexContent) => {
                    if (innerErr) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 - Not Found</h1>', 'utf-8');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error', 'utf-8');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   LUMYN BAND - DEV SERVER RUNNING      ║
╚════════════════════════════════════════╝

🚀 Local Server: http://localhost:${PORT}
📝 Docs: http://localhost:${PORT}/

✓ Demo Mode (No database required for local testing)
✓ Static files served from root directory
✓ API endpoint: POST /api/signup

💡 Tip: The dev server supports:
   • HTML, CSS, JS files from root
   • API endpoint: POST /api/signup (demo mode)
   • Hot reload support with --watch flag

Press Ctrl+C to stop the server
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Server shutting down...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});
