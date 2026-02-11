import { test, describe, it } from "node:test";
import * as assert from "node:assert";
import { z } from "zod";
import { validateEnv } from "../../src/core/validator";
import { defineConfig } from "../../src/core/config";

describe("Config", () => {
    it("should return config object", () => {
        const config = { schema: {} };
        const result = defineConfig(config);
        assert.strictEqual(result, config);
    });
});

describe("Validator", () => {
    it("should validate valid environment", () => {
        const config = defineConfig({
            schema: {
                PORT: z.coerce.number(),
                HOST: z.string(),
            },
        });

        const env = {
            PORT: "3000",
            HOST: "localhost",
        };

        const result = validateEnv(config, env);

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data?.PORT, 3000);
        assert.strictEqual(result.data?.HOST, "localhost");
    });

    it("should fail on missing required variables", () => {
        const config = defineConfig({
            schema: {
                REQUIRED: z.string(),
            },
        });

        const env = {};

        const result = validateEnv(config, env);

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.errors?.length, 1);
        assert.strictEqual(result.errors?.[0].variable, "REQUIRED");
    });

    it("should fail on invalid types", () => {
        const config = defineConfig({
            schema: {
                PORT: z.number(), // no coerce
            },
        });

        const env = {
            PORT: "not a number",
        };

        const result = validateEnv(config, env);

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.errors?.[0].variable, "PORT");
    });

    it("should handle optional default values", () => {
        const config = defineConfig({
            schema: {
                OPTIONAL: z.string().default("default"),
            },
        });

        const env = {};

        const result = validateEnv(config, env);

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data?.OPTIONAL, "default");
    });

    it("should fail on strict mode violation", () => {
        const config = defineConfig({
            schema: {
                KNOWN: z.string(),
            },
            strict: true,
        });

        const env = {
            KNOWN: "val",
            UNKNOWN: "val",
        };

        const result = validateEnv(config, env);

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.errors?.length, 1);
        assert.strictEqual(result.errors?.[0].variable, "UNKNOWN");
    });

    it("should fail on production requirements", () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        try {
            const config = defineConfig({
                schema: {
                    // Technically optional in Zod, but required in prod config
                    API_KEY: z.string().optional(),
                },
                requiredInProduction: ["API_KEY"],
            });

            const env = {};

            const result = validateEnv(config, env);

            assert.strictEqual(result.success, false);
            assert.strictEqual(result.errors?.[0].message, "Required in production but not set");

        } finally {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });
});
