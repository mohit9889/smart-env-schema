import { z } from "zod";

/**
 * Configuration for smart-env-schema
 */
export interface EnvConfig<T extends z.ZodRawShape> {
  /** Zod schema defining environment variables */
  schema: T;

  /** Environment files to load (in priority order, first wins) */
  envFiles?: string[] | Record<string, string[]>;

  /** Variables required in production environment */
  requiredInProduction?: string[];

  /** Fail if .env contains keys not in schema */
  strict?: boolean;

  /** Expand variables like ${VAR_NAME} */
  expand?: boolean;

  /** Custom error handler */
  onError?: (errors: ValidationError[]) => void;

  /** Descriptions for documentation generation */
  descriptions?: Record<string, string>;
}

/**
 * Validation error with contextual information
 */
export interface ValidationError {
  /** Variable name */
  variable: string;

  /** Error message */
  message: string;

  /** File where the variable was found (if any) */
  file?: string;

  /** Line number in file (if available) */
  line?: number;

  /** Current value (potentially redacted) */
  value?: string;

  /** Suggested fix */
  suggestion?: string;
}

/**
 * Result of environment validation
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  loadedFrom?: Record<string, string>; // variable -> file mapping
}

/**
 * Parsed environment file information
 */
export interface ParsedEnvFile {
  filepath: string;
  exists: boolean;
  variables: Record<string, string>;
  lines?: Map<string, number>; // variable -> line number
}
