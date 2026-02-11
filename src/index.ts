import * as path from "path";
import * as fs from "fs";
import { z } from "zod";
import { validateEnv } from "./core/validator";
import { formatErrors } from "./utils/formatter";
import { EnvConfig } from "./core/types";

// Re-exports
export { defineConfig, z } from "./core/config";
export { validateEnv } from "./core/validator";
export type {
  EnvConfig,
  ValidationError,
  ValidationResult,
} from "./core/types";

/**
 * Cached validated environment
 */
let cachedEnv: any = null;

/**
 * Load and validate environment based on config file
 */
function loadEnv<T extends z.ZodRawShape>(): z.infer<z.ZodObject<T>> {
  // Return cached if available
  if (cachedEnv !== null) {
    return cachedEnv;
  }

  // Look for env.config.ts or env.config.js
  const configPaths = [
    path.join(process.cwd(), "env.config.ts"),
    path.join(process.cwd(), "env.config.js"),
  ];

  let configPath: string | null = null;
  for (const p of configPaths) {
    if (fs.existsSync(p)) {
      configPath = p;
      break;
    }
  }

  if (!configPath) {
    throw new Error(
      "No env.config.ts or env.config.js found. Run: npx smart-env init",
    );
  }

  // Load config using jiti for native TypeScript support
  let config: EnvConfig<T>;
  try {
    // Use jiti to load both .ts and .js config files
    const createJiti = require("jiti");
    const jiti = createJiti(__filename, {
      interopDefault: true,
      esmResolve: true,
    });
    config = jiti(configPath);
  } catch (error) {
    throw new Error(
      `Failed to load ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Validate
  const result = validateEnv(config);

  if (!result.success) {
    // Format and display errors
    const errorMessage = formatErrors(result.errors!);
    console.error(errorMessage);

    // Call custom error handler if provided
    if (config.onError) {
      config.onError(result.errors!);
    } else {
      process.exit(1);
    }
  }

  // Cache and return
  cachedEnv = Object.freeze(result.data);
  return cachedEnv;
}

/**
 * Validated and typed environment variables
 * Automatically loads from env.config.ts/js on first access
 */
export const env = new Proxy({} as any, {
  get(_target, prop: string) {
    if (cachedEnv === null) {
      loadEnv();
    }
    return cachedEnv[prop];
  },
  set() {
    throw new Error("Environment variables are read-only");
  },
});
