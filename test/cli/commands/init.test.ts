import { test, describe, it, before, after } from "node:test";
import * as assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { initCommand } from "../../../src/cli/commands/init";

const TEST_DIR = path.join(process.cwd(), "test-fixtures-init");

describe("Init Command", () => {
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

    it("should create env.config.ts in TypeScript mode", async () => {
        const originalCwd = process.cwd();
        process.chdir(TEST_DIR);

        // Mock prompts to auto-select TypeScript and skip gitignore
        const prompts = require("prompts");
        prompts.inject([0, false]); // 0 = TypeScript, false = don't update gitignore

        try {
            await initCommand();

            const configPath = path.join(TEST_DIR, "env.config.ts");
            assert.ok(fs.existsSync(configPath), "env.config.ts should exist");

            const content = fs.readFileSync(configPath, "utf-8");
            assert.ok(content.includes("import"), "Should use ES6 import syntax");
            assert.ok(content.includes("defineConfig"), "Should contain defineConfig");
        } finally {
            process.chdir(originalCwd);
        }
    });

    it("should create env.config.js in JavaScript mode", async () => {
        const testDir2 = path.join(process.cwd(), "test-fixtures-init-js");
        fs.mkdirSync(testDir2);

        const originalCwd = process.cwd();
        process.chdir(testDir2);

        const prompts = require("prompts");
        prompts.inject([1, false]); // 1 = JavaScript, false = don't update gitignore

        try {
            await initCommand();

            const configPath = path.join(testDir2, "env.config.js");
            assert.ok(fs.existsSync(configPath), "env.config.js should exist");

            const content = fs.readFileSync(configPath, "utf-8");
            assert.ok(content.includes("require"), "Should use CommonJS require");
            assert.ok(content.includes("module.exports"), "Should use module.exports");
        } finally {
            process.chdir(originalCwd);
            fs.rmSync(testDir2, { recursive: true, force: true });
        }
    });

    it("should create .env.example file", async () => {
        const testDir3 = path.join(process.cwd(), "test-fixtures-init-example");
        fs.mkdirSync(testDir3);

        const originalCwd = process.cwd();
        process.chdir(testDir3);

        const prompts = require("prompts");
        prompts.inject([0, false]);

        try {
            await initCommand();

            const examplePath = path.join(testDir3, ".env.example");
            assert.ok(fs.existsSync(examplePath), ".env.example should exist");

            const content = fs.readFileSync(examplePath, "utf-8");
            assert.ok(content.includes("NODE_ENV"), "Should contain example vars");
        } finally {
            process.chdir(originalCwd);
            fs.rmSync(testDir3, { recursive: true, force: true });
        }
    });

    it("should update .gitignore when requested", async () => {
        const testDir4 = path.join(process.cwd(), "test-fixtures-init-gitignore");
        fs.mkdirSync(testDir4);

        const originalCwd = process.cwd();
        process.chdir(testDir4);

        const prompts = require("prompts");
        prompts.inject([0, true]); // true = update gitignore

        try {
            await initCommand();

            const gitignorePath = path.join(testDir4, ".gitignore");
            assert.ok(fs.existsSync(gitignorePath), ".gitignore should exist");

            const content = fs.readFileSync(gitignorePath, "utf-8");
            assert.ok(content.includes(".env"), "Should contain .env");
            assert.ok(content.includes(".env.local"), "Should contain .env.local");
        } finally {
            process.chdir(originalCwd);
            fs.rmSync(testDir4, { recursive: true, force: true });
        }
    });
});
