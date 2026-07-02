// ========================================
// LUMYN BAND - SECURE BACKEND HANDLER
// Vercel Serverless Function
// ========================================

import { sql } from '@vercel/postgres';

/**
 * POST /api/signup
 * Handles email signup with secure Neon database connection
 * 
 * Expected request body:
 * { email: "user@example.com" }
 * 
 * Environment variables required:
 * - POSTGRES_URL_NO_SSL (Neon connection string)
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // ===== VALIDATION =====
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Sanitize and validate email
        const sanitizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (sanitizedEmail.length > 255) {
            return res.status(400).json({ message: 'Email too long' });
        }

        // ===== DATABASE INSERTION =====
        // Using parameterized queries to prevent SQL injection
        const result = await sql`
            INSERT INTO subscribers (email, created_at)
            VALUES (${sanitizedEmail}, NOW())
            ON CONFLICT (email) DO UPDATE
            SET updated_at = NOW()
            RETURNING id, email, created_at;
        `;

        if (result.rows && result.rows.length > 0) {
            const subscriber = result.rows[0];
            console.log(`✓ Subscriber added: ${subscriber.email}`);

            return res.status(201).json({
                message: 'Successfully registered for early access',
                subscriber: {
                    id: subscriber.id,
                    email: subscriber.email,
                    created_at: subscriber.created_at
                }
            });
        } else {
            return res.status(500).json({ message: 'Failed to insert subscriber' });
        }

    } catch (error) {
        console.error('Signup error:', error);

        // Handle specific database errors
        if (error.code === 'UNIQUE_VIOLATION') {
            return res.status(409).json({
                message: 'This email is already registered for early access'
            });
        }

        if (error.code === 'UNDEFINED_TABLE') {
            return res.status(500).json({
                message: 'Database not initialized. Run setup script first.',
                hint: 'Execute: node scripts/setup-db.js'
            });
        }

        // Generic error response
        return res.status(500).json({
            message: 'An error occurred processing your request. Please try again later.'
        });
    }
}
