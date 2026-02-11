import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

export async function docsCommand() {
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

    // Generate documentation
    const rows: string[] = [];
    rows.push("| Variable | Type | Required | Default | Description |");
    rows.push("|----------|------|----------|---------|-------------|");

    const schema = z.object(config.schema);
    const schemaShape = config.schema;

    for (const [key, zodType] of Object.entries(schemaShape)) {
        const type = getZodType(zodType as z.ZodTypeAny);
        const isOptional = (zodType as z.ZodTypeAny).isOptional();
        const defaultValue = getDefaultValue(zodType as z.ZodTypeAny);
        const description = config.descriptions?.[key] || "-";

        rows.push(
            `| \`${key}\` | ${type} | ${isOptional ? "No" : "Yes"} | ${defaultValue || "-"} | ${description} |`
        );
    }

    const table = rows.join("\n");

    console.log("\n## Environment Variables\n");
    console.log(table);
    console.log("");

    // Optionally update README.md
    const readmePath = path.join(process.cwd(), "README.md");
    if (fs.existsSync(readmePath)) {
        const prompts = require("prompts");
        const { shouldUpdate } = await prompts({
            type: "confirm",
            name: "shouldUpdate",
            message: "Update README.md with this table?",
            initial: true,
        });

        if (shouldUpdate) {
            const readmeContent = fs.readFileSync(readmePath, "utf-8");
            const startMarker = "<!-- smart-env-start -->";
            const endMarker = "<!-- smart-env-end -->";

            if (readmeContent.includes(startMarker) && readmeContent.includes(endMarker)) {
                const before = readmeContent.split(startMarker)[0];
                const after = readmeContent.split(endMarker)[1];
                const newContent = `${before}${startMarker}\n\n${table}\n\n${endMarker}${after}`;

                fs.writeFileSync(readmePath, newContent, "utf-8");
                console.log("✓ Updated README.md");
            } else {
                console.log("\n⚠️  README.md doesn't contain markers:");
                console.log(`Add the following to your README.md:\n`);
                console.log(startMarker);
                console.log(endMarker);
            }
        }
    }
}

function getZodType(zodType: z.ZodTypeAny): string {
    const typeName = zodType._def.typeName;

    if (typeName === "ZodString") return "string";
    if (typeName === "ZodNumber") return "number";
    if (typeName === "ZodBoolean") return "boolean";
    if (typeName === "ZodEnum") return "enum";
    if (typeName === "ZodDefault") return getZodType((zodType as z.ZodDefault<any>)._def.innerType);
    if (typeName === "ZodOptional") return getZodType((zodType as z.ZodOptional<any>)._def.innerType);
    if (typeName === "ZodEffects") return getZodType((zodType as z.ZodEffects<any>)._def.schema);

    return "any";
}

function getDefaultValue(zodType: z.ZodTypeAny): string | null {
    if (zodType._def.typeName === "ZodDefault") {
        const defaultVal = (zodType as z.ZodDefault<any>)._def.defaultValue();
        if (typeof defaultVal === "string") return `\`${defaultVal}\``;
        if (typeof defaultVal === "number") return `\`${defaultVal}\``;
        if (typeof defaultVal === "boolean") return `\`${defaultVal}\``;
        return String(defaultVal);
    }
    return null;
}
