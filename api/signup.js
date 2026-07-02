// ========================================
// LUMYN BAND - EMAIL SIGNUP HANDLER
// Vercel Serverless Function
// 
// Works in 2 modes:
// 1. DEMO MODE (default) - no database required
// 2. DATABASE MODE (optional) - with Neon PostgreSQL
// ========================================

/**
 * POST /api/signup
 * Handles email signup registration
 * 
 * Expected request body:
 * { email: "user@example.com" }
 * 
 * Optional environment variables:
 * - POSTGRES_URL_NO_SSL or POSTGRES_URL (enables database mode)
 */

// In-memory storage for demo mode (resets on deployment)
const demoSubscribers = new Set();

async function handleDatabaseMode(email) {
    try {
        const { sql } = await import('@vercel/postgres');
        
        const result = await sql`
            INSERT INTO subscribers (email, created_at)
            VALUES (${email}, NOW())
            ON CONFLICT (email) DO UPDATE
            SET updated_at = NOW()
            RETURNING id, email, created_at;
        `;

        if (result.rows && result.rows.length > 0) {
            const subscriber = result.rows[0];
            // after: const subscriber = result.rows[0];
            console.log(`✓ Subscriber added: ${subscriber.email}`);

            // fire webhook to Apps Script to send email
            (async () => {
              try {
                const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
                const webhookSecret = process.env.APPS_SCRIPT_SECRET;
                if (webhookUrl && webhookSecret) {
                  // Use global fetch (Node 18+ on Vercel). If not available, install node-fetch.
                  await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      secret: webhookSecret,
                      email: subscriber.email,
                      name: '', // optional: if you collect name add it here
                      created_at: subscriber.created_at,
                      event: 'signup',
                      // optional: ip_address, user_agent
                    })
                  });
                  console.log('✓ Webhook posted to Apps Script');
                } else {
                  console.log('APPS_SCRIPT_WEBHOOK_URL or APPS_SCRIPT_SECRET not set — skipping email webhook.');
                }
              } catch (err) {
                // Do not crash signup if webhook fails — just log the error.
                console.error('Webhook error:', err);
              }
            })();
            
            return res.status(201).json({
              message: 'Successfully registered for early access',
              subscriber: {
                id: subscriber.id,
                email: subscriber.email,
                created_at: subscriber.created_at
              }
            });
        }
        
        return {
            status: 500,
            data: { message: 'Failed to insert subscriber' }
        };
    } catch (dbError) {
        console.error('Database error:', dbError.message);
        
        if (dbError.message?.includes('UNIQUE') || dbError.code === '23505') {
            return {
                status: 409,
                data: { message: 'This email is already registered for early access' }
            };
        }

        return {
            status: 500,
            data: { message: 'Database error. Please try again later.' }
        };
    }
}

function handleDemoMode(email) {
    if (demoSubscribers.has(email)) {
        return {
            status: 409,
            data: { message: 'This email is already registered for early access' }
        };
    }

    demoSubscribers.add(email);
    console.log(`✓ Demo signup: ${email} (Total: ${demoSubscribers.size})`);

    return {
        status: 201,
        data: {
            message: 'Successfully registered for early access',
            subscriber: {
                id: Math.random().toString(36).substr(2, 9),
                email: email,
                created_at: new Date().toISOString()
            }
        }
    };
}

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

        const sanitizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (sanitizedEmail.length > 255) {
            return res.status(400).json({ message: 'Email too long' });
        }

        // ===== DETERMINE MODE =====
        const hasDatabase = process.env.POSTGRES_URL_NO_SSL || process.env.POSTGRES_URL;

        let result;
        if (hasDatabase) {
            result = await handleDatabaseMode(sanitizedEmail);
        } else {
            result = handleDemoMode(sanitizedEmail);
        }

        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            message: 'An error occurred processing your request. Please try again later.'
        });
    }
}
