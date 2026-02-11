import * as fs from "fs";
import * as path from "path";
import { validateEnv } from "../../core/validator";
import { formatErrors } from "../../utils/formatter";

export async function fixCommand() {
    const prompts = require("prompts");

    // Load config
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
        console.log("Run: npx smart-env init");
        process.exit(1);
    }

    // Load config using jiti
    const createJiti = require("jiti");
    const jiti = createJiti(__filename, {
        interopDefault: true,
        esmResolve: true,
    });
    const config = jiti(configPath);

    // Validate current environment
    const result = validateEnv(config);

    if (result.success) {
        console.log("✓ All environment variables are valid");
        console.log("Nothing to fix!");
        return;
    }

    console.log("❌ Found missing or invalid environment variables:\n");
    console.log(formatErrors(result.errors!));
    console.log("");

    // Ask which file to update
    const { targetFile } = await prompts({
        type: "select",
        name: "targetFile",
        message: "Which file would you like to update?",
        choices: [
            { title: ".env.local (recommended)", value: ".env.local" },
            { title: ".env", value: ".env" },
            { title: ".env.development", value: ".env.development" },
            { title: ".env.production", value: ".env.production" },
        ],
        initial: 0,
    });

    if (!targetFile) {
        console.log("Cancelled");
        return;
    }

    const targetPath = path.join(process.cwd(), targetFile);

    // Get missing required variables
    const missingVars = result.errors!.filter(
        (err) => err.message.includes("Required") || err.message.includes("Invalid")
    );

    const updates: Record<string, string> = {};

    // Prompt for each missing variable
    for (const error of missingVars) {
        const { value } = await prompts({
            type: "text",
            name: "value",
            message: `Enter value for ${error.variable}:`,
            validate: (input: string) => {
                if (!input) return "Value is required";
                // TODO: Add runtime validation using Zod schema
                return true;
            },
        });

        if (!value) {
            console.log("Skipped");
            continue;
        }

        updates[error.variable] = value;
    }

    if (Object.keys(updates).length === 0) {
        console.log("No updates made");
        return;
    }

    // Append to target file
    const existingContent = fs.existsSync(targetPath)
        ? fs.readFileSync(targetPath, "utf-8")
        : "";

    const newLines = Object.entries(updates)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    const updatedContent = existingContent
        ? `${existingContent}\n\n# Added by smart-env fix\n${newLines}\n`
        : `${newLines}\n`;

    fs.writeFileSync(targetPath, updatedContent, "utf-8");

    console.log(`\n✓ Updated ${targetFile} with ${Object.keys(updates).length} variable(s)`);
    console.log("\nRun: npx smart-env validate");
}
