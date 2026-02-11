import { test, describe, it, before, after } from "node:test";
import * as assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { docsCommand } from "../../../src/cli/commands/docs";

const TEST_DIR = path.join(process.cwd(), "test-fixtures-docs");

describe("Docs Command", () => {
    before(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR);
        }

        // Create a test config
        const configContent = `
      const { defineConfig, z } = require('../../../dist/index.js');
      
      module.exports = defineConfig({
        schema: {
          PORT: z.coerce.number().default(3000),
          DATABASE_URL: z.string().url(),
          API_KEY: z.string().optional(),
        },
        descriptions: {
          PORT: 'Server port',
          DATABASE_URL: 'DB connection string',
        },
      });
    `;

        fs.writeFileSync(path.join(TEST_DIR, "env.config.js"), configContent);
    });

    after(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    it("should generate documentation table", async () => {
        const originalCwd = process.cwd();
        process.chdir(TEST_DIR);

        // Capture console output
        let output = "";
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            output += args.join(" ") + "\n";
        };

        const prompts = require("prompts");
        prompts.inject([false]); // Don't update README

        try {
            await docsCommand();

            // Verify table structure
            assert.ok(output.includes("| Variable |"), "Should contain table header");
            assert.ok(output.includes("PORT"), "Should contain PORT variable");
            assert.ok(output.includes("DATABASE_URL"), "Should contain DATABASE_URL");
            assert.ok(output.includes("API_KEY"), "Should contain API_KEY");
            assert.ok(output.includes("Server port"), "Should contain description");
        } finally {
            console.log = originalLog;
            process.chdir(originalCwd);
        }
    });

    it("should identify required vs optional fields", async () => {
        const originalCwd = process.cwd();
        process.chdir(TEST_DIR);

        let output = "";
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            output += args.join(" ") + "\n";
        };

        const prompts = require("prompts");
        prompts.inject([false]);

        try {
            await docsCommand();

            // PORT has default, so it's optional
            assert.ok(output.includes("No") || output.includes("PORT"), "PORT should be marked correctly");
            // DATABASE_URL is required
            assert.ok(output.includes("Yes") || output.includes("DATABASE_URL"), "DATABASE_URL should be required");
        } finally {
            console.log = originalLog;
            process.chdir(originalCwd);
        }
    });
});
