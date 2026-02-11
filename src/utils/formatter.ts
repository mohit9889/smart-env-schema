import { ValidationError } from "../core/types";

// Simple color helpers (we'll use basic ANSI codes since chalk might not be available)
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

/**
 * Format validation errors for console output
 */
export function formatErrors(errors: ValidationError[]): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(colors.red(colors.bold("❌ Environment validation failed:")));
  lines.push("");

  errors.forEach((error, index) => {
    if (index > 0) {
      lines.push("");
    }

    // Variable name
    lines.push(`  ${colors.bold(error.variable)}`);

    // Error message
    lines.push(`    ${colors.red("✗")} ${error.message}`);

    // File location
    if (error.file) {
      const location = error.line
        ? `${error.file} (line ${error.line})`
        : error.file;
      lines.push(`    ${colors.gray("📄")} Found in: ${colors.gray(location)}`);
    } else {
      lines.push(`    ${colors.gray("📄")} Not found in any .env file`);
    }

    // Current value (if available and not redacted)
    if (error.value && !error.value.includes("redacted")) {
      lines.push(
        `    ${colors.gray("💡")} Current value: ${colors.yellow(`"${error.value}"`)}`,
      );
    } else if (error.value) {
      lines.push(`    ${colors.gray("🔒")} ${colors.gray(error.value)}`);
    }

    // Suggestion
    if (error.suggestion) {
      lines.push(`    ${colors.blue("💡")} ${error.suggestion}`);
    }
  });

  lines.push("");
  lines.push(
    colors.gray("Run: npx smart-env fix (to auto-fix missing variables)"),
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * Format success message
 */
export function formatSuccess(loadedFrom?: Record<string, string>): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(colors.green("✓ All environment variables are valid"));

  if (loadedFrom) {
    const files = new Set(Object.values(loadedFrom));
    if (files.size > 0) {
      const fileCounts: Record<string, number> = {};
      Object.values(loadedFrom).forEach((file) => {
        fileCounts[file] = (fileCounts[file] || 0) + 1;
      });

      const fileInfo = Array.from(files)
        .map((file) => `${file} (${fileCounts[file]} vars)`)
        .join(", ");

      lines.push(colors.gray(`Loaded from: ${fileInfo}`));
    }
  }

  lines.push("");

  return lines.join("\n");
}
