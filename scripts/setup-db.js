#!/usr/bin/env node

// ========================================
// LUMYN BAND - DATABASE SETUP SCRIPT
// Run this once to initialize the Neon database
// ========================================

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.POSTGRES_URL_NO_SSL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL_NO_SSL or DATABASE_URL environment variable not set');
    console.error('   Please add your Neon connection string to .env file');
    process.exit(1);
}

const client = new pg.Client({
    connectionString,
    ssl: false,
});

async function setupDatabase() {
    try {
        console.log('🔄 Connecting to Neon database...');
        await client.connect();
        console.log('✓ Connected successfully\n');

        console.log('📦 Creating subscribers table...');
        
        // Create table with proper constraints
        await client.query(`
            CREATE TABLE IF NOT EXISTS subscribers (
                id BIGSERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT
            );
        `);

        console.log('✓ Subscribers table created\n');

        // Create index for faster queries
        console.log('📑 Creating indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_subscribers_email 
            ON subscribers(email);
        `);

        console.log('✓ Email index created\n');

        // Verify table structure
        console.log('🔍 Verifying table structure...');
        const result = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'subscribers'
            ORDER BY ordinal_position;
        `);

        console.log('Table structure:');
        result.rows.forEach(row => {
            console.log(`  • ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
        });

        console.log('\n✅ Database setup complete!');
        console.log('   You can now start the Lumyn Band landing page.');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('   (Table already exists - this is fine)');
        } else {
            process.exit(1);
        }
    } finally {
        await client.end();
    }
}

// Run setup
setupDatabase();
