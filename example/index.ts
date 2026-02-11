import { env } from "../src";

// The env object is fully typed and validated!
console.log("🚀 Starting application...");
console.log("");
console.log("Configuration:");
console.log("  Environment:", env.NODE_ENV);
console.log("  Server:", `${env.HOST}:${env.PORT}`);
console.log("  Database:", env.DATABASE_URL);
console.log("  Pool Size:", env.DB_POOL_SIZE || "default");
console.log("  Redis:", env.REDIS_URL || "not configured");
console.log("  API Key:", env.API_KEY.slice(0, 4) + "***");
console.log("");

// TypeScript will autocomplete and type-check all of these!
// Try uncommenting this to see type errors:
// const invalid: number = env.NODE_ENV; // Type error!

console.log("✅ All environment variables are valid and loaded!");
