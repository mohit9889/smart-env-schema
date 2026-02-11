import * as path from "path";
import * as fs from "fs";
import { validateEnv } from "../../core/validator";
import { formatErrors, formatSuccess } from "../../utils/formatter";

export function validateCommand() {
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

    // Validate
    const result = validateEnv(config);

    if (!result.success) {
      console.error(formatErrors(result.errors!));
      process.exit(1);
    }

    console.log(formatSuccess(result.loadedFrom));
  } catch (error) {
    console.error("❌ Failed to validate environment:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
