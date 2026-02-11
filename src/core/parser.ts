import * as fs from "fs";
import * as path from "path";
import { ParsedEnvFile } from "./types";

/**
 * Parse a .env file and return variables with metadata
 */
export function parseEnvFile(filepath: string): ParsedEnvFile {
  const absolutePath = path.resolve(process.cwd(), filepath);

  if (!fs.existsSync(absolutePath)) {
    return {
      filepath,
      exists: false,
      variables: {},
    };
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  const variables: Record<string, string> = {};
  const lines = new Map<string, number>();

  const fileLines = content.split("\n");

  fileLines.forEach((line, index) => {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;

      // Remove quotes if present
      let cleanValue = value.trim();
      if (
        (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
        (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
      ) {
        cleanValue = cleanValue.slice(1, -1);
      }

      variables[key] = cleanValue;
      lines.set(key, index + 1); // Line numbers are 1-indexed
    }
  });

  return {
    filepath,
    exists: true,
    variables,
    lines,
  };
}

/**
 * Load and merge multiple env files (first file wins for duplicate keys)
 */
export function loadEnvFiles(filepaths: string[]): {
  merged: Record<string, string>;
  sources: Record<string, string>; // variable -> filepath
} {
  const merged: Record<string, string> = {};
  const sources: Record<string, string> = {};

  // Load in reverse order so first file wins
  for (const filepath of [...filepaths].reverse()) {
    const parsed = parseEnvFile(filepath);
    if (parsed.exists) {
      Object.entries(parsed.variables).forEach(([key, value]) => {
        merged[key] = value;
        sources[key] = filepath;
      });
    }
  }

  // First pass wins (reverse back)
  const result: Record<string, string> = {};
  const finalSources: Record<string, string> = {};

  for (const filepath of filepaths) {
    const parsed = parseEnvFile(filepath);
    if (parsed.exists) {
      Object.entries(parsed.variables).forEach(([key, value]) => {
        if (!(key in result)) {
          result[key] = value;
          finalSources[key] = filepath;
        }
      });
    }
  }

  return {
    merged: result,
    sources: finalSources,
  };
}

/**
 * Expand variables in format ${VAR_NAME}
 */
export function expandVariables(
  variables: Record<string, string>,
): Record<string, string> {
  const expanded: Record<string, string> = {};

  Object.entries(variables).forEach(([key, value]) => {
    let expandedValue = value;

    // Match ${VAR_NAME} or $VAR_NAME
    const matches = expandedValue.matchAll(
      /\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g,
    );

    for (const match of matches) {
      const varName = match[1] || match[2];
      const replacement = variables[varName] || process.env[varName] || "";
      expandedValue = expandedValue.replace(match[0], replacement);
    }

    expanded[key] = expandedValue;
  });

  return expanded;
}
