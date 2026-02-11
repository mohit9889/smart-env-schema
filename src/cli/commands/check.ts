import * as path from "path";
import * as fs from "fs";
import { parseEnvFile } from "../../core/parser";

const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

export function checkCommand() {
  // Look for config file
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
    console.error("❌ No env.config.ts or env.config.js found");
    console.error("Run: npx smart-env init");
    process.exit(1);
  }

  try {
    // Load config using jiti for native TypeScript support
    const createJiti = require("jiti");
    const jiti = createJiti(__filename, {
      interopDefault: true,
      esmResolve: true,
    });
    const config = jiti(configPath);

    // Get schema keys
    const schemaKeys = new Set(Object.keys(config.schema));

    // Parse .env.example
    const examplePath = path.join(process.cwd(), ".env.example");
    if (!fs.existsSync(examplePath)) {
      console.log(colors.yellow("⚠ No .env.example file found"));
      console.log(
        colors.gray("Create one to track expected environment variables"),
      );
      process.exit(0);
    }

    const example = parseEnvFile(examplePath);
    const exampleKeys = new Set(Object.keys(example.variables));

    // Find missing (in schema but not in example)
    const missing: string[] = [];
    schemaKeys.forEach((key) => {
      if (!exampleKeys.has(key)) {
        missing.push(key);
      }
    });

    // Find extra (in example but not in schema)
    const extra: string[] = [];
    exampleKeys.forEach((key) => {
      if (!schemaKeys.has(key)) {
        extra.push(key);
      }
    });

    // Report
    console.log("");

    if (missing.length > 0) {
      console.log(colors.red(colors.bold("✗ Missing in .env.example:")));
      missing.forEach((key) => {
        const required = config.requiredInProduction?.includes(key);
        const suffix = required ? colors.red(" (required in production)") : "";
        console.log(`  - ${key}${suffix}`);
      });
      console.log("");
    }

    if (extra.length > 0) {
      console.log(
        colors.yellow(colors.bold("⚠ Extra in .env.example (not in schema):")),
      );
      extra.forEach((key) => {
        console.log(colors.gray(`  - ${key}`));
      });
      console.log("");
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log(colors.green("✓ .env.example matches schema"));
      console.log("");
    } else if (missing.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to check environment:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
