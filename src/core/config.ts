import { z } from "zod";
import { EnvConfig } from "./types";

/**
 * Define environment configuration with type safety
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   schema: {
 *     NODE_ENV: z.enum(['development', 'production']),
 *     PORT: z.coerce.number().default(3000),
 *     DATABASE_URL: z.string().url(),
 *   }
 * });
 * ```
 */
export function defineConfig<T extends z.ZodRawShape>(
  config: EnvConfig<T>,
): EnvConfig<T> {
  return config;
}

// Re-export zod for convenience
export { z };
