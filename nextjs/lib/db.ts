import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';
import { authSchema } from '../drizzle/auth-schema';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema: { ...schema, ...authSchema } });
