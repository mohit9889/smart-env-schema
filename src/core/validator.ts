import { z } from "zod";
import { EnvConfig, ValidationError, ValidationResult } from "./types";
import { loadEnvFiles, expandVariables } from "./parser";

/**
 * Validate environment variables against schema
 */
export function validateEnv<T extends z.ZodRawShape>(
  config: EnvConfig<T>,
  customEnv?: Record<string, string>,
): ValidationResult<z.infer<z.ZodObject<T>>> {
  const errors: ValidationError[] = [];

  // Determine which env files to load
  const envFiles = getEnvFiles(config);

  // Load and merge env files
  const { merged, sources } = customEnv
    ? { merged: customEnv, sources: {} }
    : loadEnvFiles(envFiles);

  // Expand variables if enabled
  const variables = config.expand ? expandVariables(merged) : merged;

  // Merge with process.env (process.env takes precedence)
  const finalEnv = { ...variables, ...process.env };

  // Create Zod object schema
  const schema = z.object(config.schema);

  // Validate
  const result = schema.safeParse(finalEnv);

  if (!result.success) {
    // Transform Zod errors into our format
    result.error.issues.forEach((issue) => {
      const variable = issue.path[0] as string;
      const file = sources[variable];

      errors.push({
        variable,
        message: issue.message,
        file,
        value: redactIfSecret(variable, finalEnv[variable]),
        suggestion: generateSuggestion(variable, issue, config),
      });
    });

    return {
      success: false,
      errors,
      loadedFrom: sources,
    };
  }

  // Check strict mode - fail if env has keys not in schema
  if (config.strict) {
    const schemaKeys = new Set(Object.keys(config.schema));
    Object.keys(variables).forEach((key) => {
      if (!schemaKeys.has(key)) {
        errors.push({
          variable: key,
          message: "Variable not defined in schema (strict mode)",
          file: sources[key],
          suggestion: "Remove this variable or add it to your schema",
        });
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        loadedFrom: sources,
      };
    }
  }

  // Check production requirements
  if (process.env.NODE_ENV === "production" && config.requiredInProduction) {
    config.requiredInProduction.forEach((key) => {
      if (!finalEnv[key]) {
        errors.push({
          variable: key,
          message: "Required in production but not set",
          suggestion: `Set ${key} in your production environment`,
        });
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        loadedFrom: sources,
      };
    }
  }

  return {
    success: true,
    data: result.data,
    loadedFrom: sources,
  };
}

/**
 * Get list of env files to load based on config and NODE_ENV
 */
function getEnvFiles<T extends z.ZodRawShape>(config: EnvConfig<T>): string[] {
  if (!config.envFiles) {
    return [".env.local", ".env"];
  }

  if (Array.isArray(config.envFiles)) {
    return config.envFiles;
  }

  // Object with per-environment files
  const nodeEnv = process.env.NODE_ENV || "development";
  return config.envFiles[nodeEnv] || [".env"];
}

/**
 * Redact sensitive values in error messages
 */
function redactIfSecret(
  key: string,
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  const secretPatterns = [
    /secret/i,
    /password/i,
    /token/i,
    /key/i,
    /api[_-]?key/i,
  ];

  const isSecret = secretPatterns.some((pattern) => pattern.test(key));

  if (isSecret && value.length > 4) {
    return `${value.slice(0, 2)}***${value.slice(-2)} (redacted)`;
  }

  return value;
}

/**
 * Generate helpful suggestions based on error type
 */
function generateSuggestion<T extends z.ZodRawShape>(
  variable: string,
  issue: z.ZodIssue,
  config: EnvConfig<T>,
): string {
  // Missing/required
  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return `Add ${variable} to your .env file`;
  }

  // Wrong type
  if (issue.code === "invalid_type") {
    return `Expected ${issue.expected}, received ${issue.received}`;
  }

  // String too short/long
  if (issue.code === "too_small" || issue.code === "too_big") {
    return issue.message;
  }

  // Invalid enum
  if (issue.code === "invalid_enum_value") {
    const options = (issue as any).options;
    return `Must be one of: ${options.join(", ")}`;
  }

  return issue.message;
}
