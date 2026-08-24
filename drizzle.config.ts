import type { Config } from 'drizzle-kit';

export default {
    schema: './drizzle/schema.ts',
    out: './drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tswBlcCx0G3L@ep-dry-silence-a1ej41wo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    },
} satisfies Config;
