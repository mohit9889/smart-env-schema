import { test, describe, it, before, after } from "node:test";
import * as assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { parseEnvFile, loadEnvFiles, expandVariables } from "../../src/core/parser";

const TEST_DIR = path.join(process.cwd(), "test-fixtures");

describe("Parser", () => {
    before(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR);
        }
    });

    after(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    describe("parseEnvFile", () => {
        it("should parse simple key=value", () => {
            const filepath = path.join(TEST_DIR, ".env.simple");
            fs.writeFileSync(filepath, "KEY=VALUE\nANOTHER=123");

            const result = parseEnvFile(filepath);

            assert.strictEqual(result.exists, true);
            assert.strictEqual(result.variables.KEY, "VALUE");
            assert.strictEqual(result.variables.ANOTHER, "123");
        });

        it("should handle quotes", () => {
            const filepath = path.join(TEST_DIR, ".env.quotes");
            fs.writeFileSync(filepath, `
        SINGLE='single quoted'
        DOUBLE="double quoted"
      `);

            const result = parseEnvFile(filepath);

            assert.strictEqual(result.variables.SINGLE, "single quoted");
            assert.strictEqual(result.variables.DOUBLE, "double quoted");
        });

        it("should ignore comments and empty lines", () => {
            const filepath = path.join(TEST_DIR, ".env.comments");
            fs.writeFileSync(filepath, `
        # This is a comment
        
        VALID=value
        # ANOTHER=commented
      `);

            const result = parseEnvFile(filepath);

            assert.strictEqual(result.variables.VALID, "value");
            assert.strictEqual(result.variables.ANOTHER, undefined);
        });

        it("should track line numbers", () => {
            const filepath = path.join(TEST_DIR, ".env.lines");
            fs.writeFileSync(filepath, `A=1\nB=2\n\nC=3`);

            const result = parseEnvFile(filepath);

            assert.strictEqual(result.lines?.get("A"), 1);
            assert.strictEqual(result.lines?.get("C"), 4);
        });
    });

    describe("loadEnvFiles", () => {
        it("should load variables from multiple files with priority", () => {
            const envLocal = path.join(TEST_DIR, ".env.local");
            const envDev = path.join(TEST_DIR, ".env");

            fs.writeFileSync(envLocal, "OVERRIDE=local\nUNIQUE_LOCAL=true");
            fs.writeFileSync(envDev, "OVERRIDE=dev\nUNIQUE_DEV=true");

            const { merged, sources } = loadEnvFiles([envLocal, envDev]);

            assert.strictEqual(merged.OVERRIDE, "local");
            assert.strictEqual(merged.UNIQUE_LOCAL, "true");
            assert.strictEqual(merged.UNIQUE_DEV, "true");

            assert.strictEqual(sources.OVERRIDE, envLocal);
            assert.strictEqual(sources.UNIQUE_DEV, envDev);
        });
    });

    describe("expandVariables", () => {
        it("should expand variables", () => {
            const env = {
                HOST: "localhost",
                PORT: "3000",
                URL: "http://${HOST}:${PORT}"
            };

            const expanded = expandVariables(env);

            assert.strictEqual(expanded.URL, "http://localhost:3000");
        });

        it("should handle missing variables", () => {
            const env = {
                URL: "http://${MISSING}"
            };

            const expanded = expandVariables(env);

            // Should replace with empty string or keep as is? 
            // Based on implementation: replacement || process.env[varName] || ""
            assert.strictEqual(expanded.URL, "http://");
        });
    });
});
