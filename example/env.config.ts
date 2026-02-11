import { defineConfig, z } from "../dist";

export default defineConfig({
    schema: {
        // Server
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        PORT: z.coerce.number().default(3000),
        HOST: z.string().default('localhost'),

        // Database
        DATABASE_URL: z.string().url(),

        // API
        API_KEY: z.string().min(20),
        API_SECRET: z.string().min(32),

        // Optional
        DB_POOL_SIZE: z.coerce.number().optional(),
        REDIS_URL: z.string().url().optional(),
    },

    envFiles: ['.env.local', '.env'],

    requiredInProduction: ['DATABASE_URL', 'API_KEY', 'API_SECRET'],

    descriptions: {
        DATABASE_URL: 'PostgreSQL connection string',
        PORT: 'Server port number',
        API_KEY: 'API authentication key (min 20 chars)',
        API_SECRET: 'API secret key (min 32 chars)',
    },
});
